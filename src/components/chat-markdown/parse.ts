import { decodeHTMLStrict } from 'entities'
import { Lexer, type MarkedToken, type Token } from 'marked'
import { safeHref } from '../../utils/safe-href'

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
type Tag = typeof headings[number] | 'p' | 'ul' | 'ol' | 'li' | 'blockquote' | 'a' | 'pre' | 'code' |
  'strong' | 'em' | 'br' | 'hr'
type Attributes = { href?: string; title?: string; start?: number }
export type MarkdownNode = string | { tag: Tag; children: MarkdownNode[]; attrs?: Attributes }

const protocols = new Set(['https:', 'http:', 'mailto:', 'tel:'])

function element(tag: Tag, children: MarkdownNode[] = [], attrs?: Attributes): MarkdownNode {
  return { tag, children, attrs }
}

function nodes(tokens: Token[], looseListItem = false): MarkdownNode[] {
  // 仅使用 Marked 内置词法规则，逐类映射为允许的标签和属性。
  return (tokens as MarkedToken[]).flatMap((token): MarkdownNode | MarkdownNode[] => {
    switch (token.type) {
      case 'heading': return element(headings[token.depth - 1], nodes(token.tokens))
      case 'paragraph': return element('p', nodes(token.tokens))
      case 'blockquote': case 'strong': case 'em':
        return element(token.type, nodes(token.tokens))
      case 'list':
        return element(token.ordered ? 'ol' : 'ul', nodes(token.items),
          typeof token.start === 'number' && token.start !== 1 ? { start: token.start } : undefined)
      case 'list_item': return element('li', nodes(token.tokens, token.loose))
      case 'link': {
        const children = nodes(token.tokens)
        const href = safeHref(token.href, protocols)
        return href ? element('a', children, { href, title: token.title ? decodeHTMLStrict(token.title) : undefined }) : children
      }
      case 'code': return element('pre', [element('code', [token.text])])
      case 'codespan': return element('code', [token.text])
      case 'br': case 'hr': return element(token.type)
      case 'text': {
        if (!token.tokens) return decodeHTMLStrict(token.text)
        const children = nodes(token.tokens)
        return looseListItem ? element('p', children) : children
      }
      case 'escape': case 'html': return token.text
      case 'image': return decodeHTMLStrict(token.text)
      case 'space': case 'def': return []
      default: return token.raw
    }
  })
}

export function parseMarkdown(content: string) {
  return nodes(Lexer.lex(content, { gfm: false }))
}
