<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmSwitch, type SwitchProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const notifications = ref(true)
const theme = ref<SwitchProps['theme']>('primary')
const size = ref<SwitchProps['size']>()
const showLabel = ref(false)
const label = computed<SwitchProps['label']>(() => showLabel.value ? ['开', '关'] : undefined)
const disabled = ref(false)
const loading = ref(false)
</script>

<template>
  <PreviewFrame name="YmSwitch">
    <template #preview>
      <label class="switch-demo">
        邮件通知
        <YmSwitch v-model="notifications" aria-label="邮件通知"
          :theme="theme" :size="size" :label="label" :disabled="disabled" :loading="loading" />
      </label>
    </template>
    <template #controls>
      <label>开关主题
        <select v-model="theme">
          <option value="primary">主要</option><option value="default">中性</option><option value="success">成功</option>
          <option value="warning">警告</option><option value="danger">危险</option>
        </select>
      </label>
      <label>开关尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, text] in sizes" :key="value" :value="value">{{ text }}</option>
        </select>
      </label>
      <label>显示开关文字 <YmSwitch v-model="showLabel" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
      <label>加载中 <YmSwitch v-model="loading" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.switch-demo { display: inline-flex; align-items: center; gap: 0.75rem; }
</style>
