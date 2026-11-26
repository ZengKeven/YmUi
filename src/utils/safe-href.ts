import { decodeHTMLStrict } from 'entities'

const webProtocols = new Set(['https:', 'http:'])

export function safeHref(raw?: string, protocols: ReadonlySet<string> = webProtocols) {
  if (typeof raw !== 'string') return
  const decoded = decodeHTMLStrict(raw)
  const href = decoded.trim()
  if (!href || href.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(decoded)) return
  try {
    const url = new URL(href, 'https://ym.invalid/')
    if (protocols.has(url.protocol)) return href
  } catch {
    // 无法解析的地址只显示链接文字。
  }
}
