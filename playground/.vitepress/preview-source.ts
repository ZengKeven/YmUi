import { compileScript, compileTemplate, MagicString, parse, type SFCDescriptor } from '@vue/compiler-sfc'
import ts from 'typescript'
import type { Plugin } from 'vite'

type ScriptPart = string | { binding: string }

function previewTemplate(descriptor: SFCDescriptor) {
  const frame = descriptor.template?.ast?.children.find(node => 'tag' in node && node.tag === 'PreviewFrame')
  if (!frame || !('tag' in frame)) throw new Error(`${descriptor.filename}: missing PreviewFrame`)
  const slot = frame.children.find(node => 'tag' in node && node.tag === 'template' && node.props.some(prop =>
    'arg' in prop && prop.name === 'slot' && prop.arg?.loc.source === 'preview',
  ))
  if (!slot || !('tag' in slot) || !slot.children.length) throw new Error(`${descriptor.filename}: missing #preview`)
  const first = slot.children[0].loc.start
  const end = slot.children[slot.children.length - 1].loc.end.offset
  const indent = new RegExp(`\\n[^\\S\\n]{0,${first.column - 1}}`, 'g')
  return {
    template: descriptor.source.slice(first.offset, end).replace(indent, '\n'),
    framePropsOffset: frame.loc.start.offset + frame.tag.length + 1,
  }
}

function scriptForPreview(descriptor: SFCDescriptor, template: string): ScriptPart[] {
  const filename = `${descriptor.filename}.ts`
  const content = descriptor.scriptSetup!.content
  const file = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true)
  // 只在本文件解析符号，不加载类型库或依赖包。
  const options = { noLib: true, noResolve: true }
  const host = ts.createCompilerHost(options)
  host.getSourceFile = path => path === filename ? file : undefined
  const checker = ts.createProgram([filename], options, host).getTypeChecker()
  const bindings = compileScript(descriptor, { id: filename }).bindings
  const render = compileTemplate({ source: template, filename, id: filename, compilerOptions: { bindingMetadata: bindings } })
  if (render.errors.length) throw new Error(`${filename}: ${render.errors.join('\n')}`)

  const symbols = new Map(checker.getSymbolsInScope(file, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Alias)
    .filter(symbol => symbol.declarations?.[0]?.getSourceFile() === file)
    .map(symbol => [symbol.name, symbol]))
  const used = new Set<ts.Declaration>()
  const initializers = new Map<ts.VariableDeclaration, ts.CallExpression>()

  function include(symbol: ts.Symbol | undefined) {
    const declaration = symbol?.declarations?.[0]
    if (!symbol || symbols.get(symbol.name) !== symbol || !declaration || used.has(declaration)) return
    used.add(declaration)
    if (ts.isVariableDeclaration(declaration)) {
      const call = declaration.initializer
      if (call && ts.isCallExpression(call) && call.expression.getText(file) === 'ref') {
        initializers.set(declaration, call)
        visit(call.expression)
        call.typeArguments?.forEach(visit)
        if (declaration.type) visit(declaration.type)
        return
      }
    }
    ts.forEachChild(declaration, visit)
  }

  function visit(node: ts.Node) {
    if (ts.isShorthandPropertyAssignment(node)) include(checker.getShorthandAssignmentValueSymbol(node))
    if (ts.isIdentifier(node)) include(checker.getSymbolAtLocation(node))
    ts.forEachChild(node, visit)
  }

  // Vue 已区分局部插槽变量、模板内置项以及 setup 中的组件别名。
  for (const match of render.code.matchAll(/\$setup(?:\.(\w+)|\["([^"]+)"\])/g)) {
    include(symbols.get(match[1] ?? match[2]))
  }

  const imports = new Map<string, Set<string>>([['ym-ui-vapor', new Set(['ConfigProvider'])]])
  const body: ScriptPart[] = []
  for (const statement of file.statements) {
    if (ts.isImportDeclaration(statement)) {
      const named = statement.importClause?.namedBindings
      if (!named || !ts.isNamedImports(named)) continue
      for (const item of named.elements.filter(item => used.has(item))) {
        const path = (statement.moduleSpecifier as ts.StringLiteral).text
        const module = path === '../../src' ? 'ym-ui-vapor' : path
        if (module.startsWith('.') || module.startsWith('/')) throw new Error(`${filename}: preview depends on local module ${path}`)
        const names = imports.get(module) ?? new Set<string>()
        names.add((statement.importClause?.isTypeOnly ? 'type ' : '') + item.getText(file))
        imports.set(module, names)
      }
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations.filter(item => used.has(item))) {
        const kind = statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let'
        const call = initializers.get(declaration)
        if (call) {
          body.push(`\n${kind} ${content.slice(declaration.getStart(file), call.arguments.pos)}`,
            { binding: declaration.name.getText(file) }, content.slice(call.arguments.end, declaration.end))
        } else {
          body.push(`\n${kind} ${declaration.getText(file)}`)
        }
      }
    } else if (ts.isDeclarationStatement(statement) && used.has(statement)) {
      body.push(`\n${statement.getText(file)}`)
    }
  }
  const lines = Array.from(imports, ([module, names]) => `import { ${[...names].join(', ')} } from '${module}'`)
  lines.push("import 'ym-ui-vapor/style.css'")
  return [lines.join('\n') + (body.length ? '\n' : ''), ...body]
}

export function previewSource(): Plugin {
  return {
    name: 'playground-preview-source',
    enforce: 'pre',
    transform(source, filename) {
      if (!filename.endsWith('.demo.vue')) return
      const { descriptor, errors } = parse(source, { filename })
      if (errors.length) this.error(errors.join('\n'))
      if (!descriptor.scriptSetup) this.error(`${filename}: missing <script setup>`)
      const { template, framePropsOffset } = previewTemplate(descriptor)
      const scriptParts = scriptForPreview(descriptor, template)
      const style = descriptor.styles.map(block =>
        `<style${block.scoped ? ' scoped' : ''}>\n${block.content.trim()}\n</style>`,
      ).join('\n\n')

      const bindings = scriptParts.flatMap(part => typeof part === 'string' ? [] : [part.binding])
      const literal = JSON.stringify({ template, scriptParts, style }).replaceAll('<', '\\u003c')
      let name = 'ymPreviewSource'
      while (source.includes(name)) name += '_'
      const code = new MagicString(source)
      code.appendLeft(descriptor.scriptSetup.loc.end.offset, `\nconst ${name} = ${literal}\n`)
      code.appendLeft(framePropsOffset, ` :source="${name}" :state="{ ${bindings.join(', ')} }"`)
      return { code: code.toString(), map: code.generateMap({ source: filename, hires: true }) }
    },
  }
}
