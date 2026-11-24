<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmLayout, YmMenu, YmSwitch, type ControlSize, type MenuItem, type MenuValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const items: MenuItem[] = [
  { value: 'dashboard', label: '工作台', icon: 'dashboard' },
  {
    value: 'purchase', label: '采购管理', icon: 'purchase',
    children: [
      { value: 'orders', label: '采购订单', icon: 'file-text' },
      { value: 'suppliers', label: '供应商', icon: 'supplier' },
    ],
  },
  { value: 'reports', label: '报表中心', icon: 'reports' },
]
const pages = items.flatMap(item => item.children?.length ? item.children : [item])
const selected = ref<MenuValue>('dashboard')
const expanded = ref<MenuValue[]>([])
const currentPage = computed(() => pages.find(page => page.value === selected.value)?.label)
const collapsed = ref(false)
const size = ref<ControlSize>()
const logo = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
  '<rect width="32" height="32" rx="7" fill="#006eff"/>' +
  '<path d="m7 8 9 10 9-10M16 18v7" fill="none" stroke="white" stroke-width="4"/></svg>',
)
</script>

<template>
  <PreviewFrame name="YmMenu">
    <template #preview>
      <YmLayout v-model:collapsed="collapsed" class="menu-demo" system-name="采购工作台" :logo="logo"
        :aside-width="152" :collapsed-width="48" :header-height="40">
        <template #aside="{ collapsed: compact }">
          <YmMenu v-model="selected" v-model:expanded="expanded" :items="items" :collapsed="compact" :size="size" />
        </template>
        <template #header>当前页面</template>
        <template #content><output aria-live="polite">{{ currentPage }}</output></template>
      </YmLayout>
    </template>
    <template #controls>
      <label>收起侧栏 <YmSwitch v-model="collapsed" /></label>
      <label>菜单尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.menu-demo {
  --menu-line: color-mix(in srgb, var(--ym-color-text) 14%, var(--ym-color-surface));
  box-sizing: border-box;
  width: 100%;
  height: 19rem;
  border: 1px solid var(--menu-line);
  color: var(--ym-color-text);
}
.menu-demo :deep(.ym-layout__aside) {
  box-sizing: border-box;
  border-inline-end: 1px solid var(--menu-line);
  background: var(--ym-color-surface);
}
.menu-demo :deep(.ym-layout__header) {
  padding-inline: .75rem;
  border-bottom: 1px solid var(--menu-line);
  background: var(--ym-color-surface);
  color: color-mix(in srgb, var(--ym-color-text) 72%, var(--ym-color-surface));
  font-size: .8rem;
}
.menu-demo :deep(.ym-layout__content) {
  padding: .75rem;
  background: color-mix(in srgb, var(--ym-color-text) 4%, var(--ym-color-surface));
}
.menu-demo output { font-weight: 600; }
</style>
