import { compileScript, MagicString, parse, type SFCDescriptor } from '@vue/compiler-sfc'
import type { Node } from '@babel/types'
import { ElementTypes, type ElementNode, type TemplateChildNode } from '@vue/compiler-core'
import type { Plugin } from 'vite'
import type { PreviewPart } from '../examples/preview-source'

function elements(children: TemplateChildNode[]) {
  return children.filter((node): node is ElementNode => 'tag' in node)
}

function componentRoots(children: TemplateChildNode[]): ElementNode[] {
  return elements(children).flatMap(node => node.tagType === ElementTypes.COMPONENT ? [node] : componentRoots(node.children))
}

function literal(node: Node) {
  return node.type === 'StringLiteral' || node.type === 'NumericLiteral' || node.type === 'BooleanLiteral'
    || node.type === 'NullLiteral' || (node.type === 'Identifier' && node.name === 'undefined')
}

// 只读取设置值、其字段或与常量的比较，不重复执行预览中的函数和事件。
function settingName(node: Node): string | undefined {
  switch (node.type) {
    case 'Identifier': return node.name
    case 'MemberExpression': return !node.computed ? settingName(node.object) : undefined
    case 'BinaryExpression': return ['===', '!=='].includes(node.operator) && literal(node.right) ? settingName(node.left) : undefined
    case 'ConditionalExpression': return literal(node.consequent) && literal(node.alternate) ? settingName(node.test) : undefined
  }
}

function previewTemplate(descriptor: SFCDescriptor) {
  const frame = elements(descriptor.template?.ast?.children ?? []).find(node => node.tag === 'PreviewFrame')
  const slot = frame && elements(frame.children).find(node => node.props.some(prop =>
    'arg' in prop && prop.name === 'slot' && prop.arg?.loc.source === 'preview',
  ))
  if (!frame || !slot) throw new Error(`${descriptor.filename}: missing PreviewFrame #preview`)
  const roots = componentRoots(slot.children)
  if (!roots.length) throw new Error(`${descriptor.filename}: missing component in #preview`)

  const bindings = compileScript(descriptor, { id: descriptor.filename }).bindings
  const settings = new Set(Object.entries(bindings ?? {}).filter(([, kind]) => kind === 'setup-ref').map(([name]) => name))
  // 保留可写模型和作用域内的名字，复制后这些绑定仍应由模板上下文提供。
  function preserveBindings(node: ElementNode) {
    for (const prop of node.props) {
      if (!('exp' in prop) || !['model', 'slot', 'for'].includes(prop.name)) continue
      for (const name of prop.exp?.loc.source.match(/[$\w]+/g) ?? []) settings.delete(name)
    }
    elements(node.children).forEach(preserveBindings)
  }
  preserveBindings(slot)

  const values: string[] = []
  function indexOf(expression: string) {
    const index = values.indexOf(expression)
    return index === -1 ? values.push(expression) - 1 : index
  }

  function render(node: ElementNode, indent: RegExp, hasElse = false): PreviewPart[] {
    const parts: PreviewPart[] = []
    let cursor = node.loc.start.offset
    let condition: number | undefined
    function advance(end: number, trim = false) {
      const source = descriptor.source.slice(cursor, end).replace(indent, '\n')
      parts.push(trim ? source.trimEnd() : source)
      cursor = end
    }
    for (const prop of node.props) {
      if (!('exp' in prop) || !prop.exp || !('content' in prop.exp) || prop.modifiers.length) continue
      const name = prop.name === 'bind' && prop.arg && 'isStatic' in prop.arg && prop.arg.isStatic ? prop.arg.content : undefined
      if (!name && (prop.name !== 'if' || hasElse)) continue
      const setting = prop.exp.ast ? settingName(prop.exp.ast) : prop.exp.content
      if (!setting || !settings.has(setting)) continue
      advance(prop.loc.start.offset, true)
      const index = indexOf(prop.exp.content)
      if (name) parts.push({ name, index })
      else condition = index
      cursor = prop.loc.end.offset
    }
    const children = elements(node.children)
    children.forEach((child, index) => {
      advance(child.loc.start.offset)
      const next = children[index + 1]
      parts.push(...render(child, indent, startsWithElse(next)))
      cursor = child.loc.end.offset
    })
    advance(node.loc.end.offset)
    return condition === undefined ? parts : [{ when: condition, parts }]
  }

  const parts: PreviewPart[] = []
  function startsWithElse(node: ElementNode | undefined) {
    return node?.props.some(prop => 'exp' in prop && ['else', 'else-if'].includes(prop.name))
  }

  for (const [index, root] of roots.entries()) {
    if (parts.length) parts.push('\n')
    const indent = new RegExp(`\\n[^\\S\\n]{0,${root.loc.start.column - 1}}`, 'g')
    parts.push(...render(root, indent, startsWithElse(roots[index + 1])))
  }
  return { parts, values, frameOffset: frame.loc.start.offset + frame.tag.length + 1 }
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
      const { parts, values, frameOffset } = previewTemplate(descriptor)
      const literal = JSON.stringify(parts).replaceAll('<', '\\u003c')
      let name = 'ymPreviewSource'
      while (source.includes(name)) name += '_'
      const valuesAttr = values.join(', ').replaceAll('&', '&amp;').replaceAll('"', '&quot;')
      const code = new MagicString(source)
      code.appendLeft(descriptor.scriptSetup.loc.end.offset, `\nconst ${name} = ${literal}\n`)
      code.appendLeft(frameOffset, ` :source="${name}" :values="[${valuesAttr}]"`)
      return { code: code.toString(), map: code.generateMap({ source: filename, hires: true }) }
    },
  }
}
