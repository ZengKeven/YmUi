export type PreviewPart = string | { name: string; index: number } | { when: number; parts: PreviewPart[] }

function attribute(name: string, value: unknown): string {
  if (value === undefined) return ''
  if (value === true) return ` ${name}`
  if (typeof value === 'string') {
    const escaped = value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
    return ` ${name}="${escaped}"`
  }
  const literal = JSON.stringify(value)
  if (!literal.includes('"')) return ` :${name}="${literal}"`
  const escaped = literal.replaceAll('&', '&amp;').replaceAll("'", '&#39;').replaceAll('<', '&lt;')
  return ` :${name}='${escaped}'`
}

export function renderPreviewSource(parts: PreviewPart[], values: unknown[]): string {
  return parts.map(part => {
    if (typeof part === 'string') return part
    if ('when' in part) return values[part.when] ? renderPreviewSource(part.parts, values) : ''
    return attribute(part.name, values[part.index])
  }).join('')
}

export function wrapConfigProvider(content: string, config: Record<string, unknown>) {
  const props = Object.entries(config).map(([name, value]) => attribute(name, value)).join('')
  const children = content.split('\n').map(line => `  ${line}`).join('\n')
  return `<ConfigProvider${props}>\n${children}\n</ConfigProvider>`
}
