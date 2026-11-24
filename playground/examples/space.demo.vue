<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmIcon, YmSpace, YmSwitch, type SpaceProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'

const direction = ref<SpaceProps['direction']>('horizontal')
const align = ref<SpaceProps['align']>()
const sizeChoice = ref('inherit')
const size = computed<SpaceProps['size']>(() => {
  if (sizeChoice.value === 'inherit') return undefined
  if (sizeChoice.value === 'pair') return [8, 24]
  return sizeChoice.value
})
const breakLine = ref(false)
const separator = ref('none')
</script>

<template>
  <PreviewFrame name="YmSpace">
    <template #preview>
      <div class="space-demo-viewport">
        <YmSpace class="space-demo" :direction="direction" :align="align" :size="size"
          :break-line="breakLine" :separator="separator === 'text' ? '/' : undefined">
          <span class="space-demo-step">收货</span>
          <span class="space-demo-step space-demo-step--current">质量验收</span>
          <span class="space-demo-step">上架入库</span>
          <template v-if="separator === 'icon'" #separator>
            <YmIcon name="chevron-right" />
          </template>
        </YmSpace>
      </div>
    </template>
    <template #controls>
      <label>排列方向
        <select v-model="direction">
          <option value="horizontal">水平</option><option value="vertical">垂直</option>
        </select>
      </label>
      <label>间距
        <select v-model="sizeChoice">
          <option value="inherit">继承</option><option value="extra-small">特小 · 4px</option>
          <option value="small">小 · 8px</option><option value="medium">中 · 16px</option>
          <option value="large">大 · 24px</option><option value="pair">行 8px / 列 24px</option>
        </select>
      </label>
      <label>对齐方式
        <select v-model="align">
          <option :value="undefined">默认</option><option value="start">起点</option>
          <option value="center">居中</option><option value="end">终点</option>
          <option value="baseline">文字基线</option>
        </select>
      </label>
      <label>分隔符
        <select v-model="separator">
          <option value="none">无</option><option value="text">斜线</option><option value="icon">箭头图标</option>
        </select>
      </label>
      <label>自动换行 <YmSwitch v-model="breakLine" :disabled="direction === 'vertical'" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.space-demo-viewport { max-width: 100%; overflow: auto; }
.space-demo { max-width: min(100%, 15rem); }
.space-demo-step {
  display: inline-flex;
  align-items: center;
  padding: .25rem .65rem;
  border-radius: var(--ym-radius);
  background: color-mix(in srgb, var(--ym-color-primary) 10%, var(--ym-color-surface));
  color: var(--ym-color-text);
  font-size: .875rem;
  white-space: nowrap;
}
.space-demo-step--current {
  padding-block: .6rem;
  background: var(--ym-color-primary);
  color: var(--ym-color-on-accent);
}
</style>
