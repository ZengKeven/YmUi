<script setup lang="ts" vapor>
import { onScopeDispose, ref } from 'vue'
import { ConfigProvider, YmIcon } from '../../src'
import { settings } from './settings'
import GlobalControls from './GlobalControls.vue'
import { renderPreviewSource, type PreviewSource } from './preview-source'

// Playground 构建插件从 #preview 生成 source 和对应的响应式 state。
const props = defineProps<{ name: string; globalOnly?: boolean; source?: PreviewSource; state?: Record<string, unknown> }>()
const feedback = ref('')
let feedbackTimer: ReturnType<typeof setTimeout>
onScopeDispose(() => clearTimeout(feedbackTimer))

function copyWithSelection(text: string) {
  const previous = document.activeElement
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.style.cssText = 'position:fixed;top:0;left:-10000px'
  document.body.append(field)
  try {
    field.select()
    return document.execCommand('copy')
  } finally {
    field.remove()
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
  }
}

async function copyCode() {
  if (!props.source) return
  clearTimeout(feedbackTimer)
  try {
    const text = renderPreviewSource(props.source, props.state ?? {}, settings)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      if (!copyWithSelection(text)) throw new Error('Copy failed')
    }
    feedback.value = '已复制'
  } catch {
    feedback.value = '复制失败，请重试'
  }
  feedbackTimer = setTimeout(() => { feedback.value = '' }, 2500)
}
</script>

<template>
  <ConfigProvider class="playground" :mode="settings.mode" :size="settings.size" :radius="settings.radius"
    :theme="{ light: { primary: settings.lightPrimary }, dark: { primary: settings.darkPrimary } }">
    <div class="demo-board">
      <div class="demo-stage">
        <div class="demo-caption demo-name">
          <span>{{ name }}</span>
          <span class="demo-copy-tools">
            <span role="status">{{ feedback }}</span>
            <button type="button" class="demo-copy" @click="copyCode"><YmIcon name="copy" />复制代码</button>
          </span>
        </div>
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
