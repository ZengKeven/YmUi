<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmLayout } from '../../src'
import PreviewFrame from './PreviewFrame.vue'

const systemName = ref('云明系统')
const collapsed = ref(false)
const headerHeight = ref(48)
const collapsedWidth = ref(48)
const logo = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
  '<rect width="32" height="32" rx="7" fill="white"/>' +
  '<path d="m7 8 9 10 9-10M16 18v7" fill="none" stroke="#006eff" stroke-width="4"/></svg>',
)
</script>

<template>
  <PreviewFrame name="YmLayout">
    <template #preview>
      <YmLayout v-model:collapsed="collapsed" class="layout-demo" :logo="logo"
        :system-name="systemName" :header-height="headerHeight" :aside-width="128" :collapsed-width="collapsedWidth">
        <template #header><span class="layout-demo__label">Header</span></template>
        <template #aside><span class="layout-demo__label">Aside</span></template>
        <template #content><span class="layout-demo__label">Content</span></template>
      </YmLayout>
    </template>
    <template #controls>
      <label>系统名称 <input v-model="systemName" type="text" /></label>
      <label>顶栏高度
        <select v-model="headerHeight">
          <option v-for="value in [40, 48, 64]" :key="value" :value="value">{{ value }} px</option>
        </select>
      </label>
      <label>收起宽度
        <select v-model="collapsedWidth">
          <option v-for="value in [48, 56, 72]" :key="value" :value="value">{{ value }} px</option>
        </select>
      </label>
      <label>收起侧栏 <input v-model="collapsed" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.layout-demo { width: 100%; height: 200px; }
.layout-demo__label {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: .875rem;
}
</style>
