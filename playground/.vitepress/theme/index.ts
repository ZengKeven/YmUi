import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ComponentDemo from './ComponentDemo.vue'
import { data as sidebar } from './sidebar.data'
import '../../../src/style.css'
import './site.css'
import '../../playground.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, siteData }) {
    siteData.value = { ...siteData.value, themeConfig: { ...siteData.value.themeConfig, sidebar } }
    app.component('ComponentDemo', ComponentDemo)
  },
} satisfies Theme
