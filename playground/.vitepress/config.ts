import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { previewSource } from './preview-source'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Ym UI',
  description: 'Vue 3.6 Vapor 组件文档与交互示例',
  srcDir: '../src/components',
  outDir: './dist',
  cleanUrls: true,
  vite: {
    resolve: { dedupe: ['vue'] },
    plugins: [previewSource(), {
      name: 'watch-playground-examples',
      configureServer(server) {
        // 示例目录位于 srcDir 之外，新增示例时也要更新 ComponentDemo 的导入列表。
        server.watcher.add(fileURLToPath(new URL('../examples', import.meta.url)))
      },
    }],
  },
  themeConfig: {
    nav: [{ text: '组件文档', link: '/button/' }, { text: '全局配置', link: '/config-provider/' }],
    search: {
      provider: 'local',
      options: { locales: { root: { translations: {
        button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
        modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空搜索', displayDetails: '显示详情',
          backButtonTitle: '返回', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } },
      } } } },
    },
    outline: { level: 2, label: '本页目录' },
    docFooter: { prev: '上一组件', next: '下一组件' },
    skipToContentLabel: '跳到正文',
    navMenuLabel: '主导航',
    mobileMenuLabel: '主菜单',
    sidebarMenuLabel: '组件目录',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '显示模式',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})
