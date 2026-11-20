import { createContentLoader, type DefaultTheme } from 'vitepress'

export declare const data: DefaultTheme.SidebarItem[]

export default createContentLoader('*/index.md', {
  includeSrc: true,
  transform(pages) {
    const groups = new Map<string, DefaultTheme.SidebarItem[]>([
      ['基础组件', []], ['反馈组件', []], ['全局配置', []],
    ])
    for (const { url, frontmatter, src } of pages.sort((a, b) => a.url.localeCompare(b.url))) {
      const text = frontmatter.title ?? src?.match(/^# (.+)$/m)?.[1].trim() ?? url
      const group = frontmatter.category ?? '其他组件'
      const items = groups.get(group) ?? []
      items.push({ text, link: url })
      groups.set(group, items)
    }
    return [...groups].filter(([, items]) => items.length)
      .map(([text, items]) => ({ text, collapsed: false, items }))
  },
})
