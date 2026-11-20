<script setup lang="ts" vapor>
import { ConfigProvider } from '../../src'
import { settings } from './settings'
import GlobalControls from './GlobalControls.vue'

defineProps<{ name: string; globalOnly?: boolean }>()
</script>

<template>
  <ConfigProvider class="playground" :mode="settings.mode" :size="settings.size" :radius="settings.radius"
    :theme="{ light: { primary: settings.lightPrimary }, dark: { primary: settings.darkPrimary } }">
    <div class="demo-board">
      <div class="demo-stage">
        <div class="demo-caption demo-name">{{ name }}</div>
        <div class="demo-canvas"><slot name="preview" /></div>
      </div>
      <div class="demo-panel">
        <div class="demo-caption">{{ globalOnly ? '全局设置' : '组件配置' }}</div>
        <div class="demo-fields">
          <GlobalControls v-if="globalOnly" />
          <slot v-else name="controls" />
        </div>
      </div>
    </div>
    <details v-if="!globalOnly" class="demo-global">
      <summary>全局设置</summary>
      <div class="demo-fields"><GlobalControls /></div>
    </details>
    <slot />
  </ConfigProvider>
</template>
