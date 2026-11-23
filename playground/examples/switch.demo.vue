<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmSwitch, type SwitchProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const notifications = ref(true)
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
          :size="size" :label="label" :disabled="disabled" :loading="loading" />
      </label>
    </template>
    <template #controls>
      <label>开关尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, text] in sizes" :key="value" :value="value">{{ text }}</option>
        </select>
      </label>
      <label>显示开关文字 <input v-model="showLabel" type="checkbox" /></label>
      <label>禁用 <input v-model="disabled" type="checkbox" /></label>
      <label>加载中 <input v-model="loading" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.switch-demo { display: inline-flex; align-items: center; gap: 0.75rem; }
</style>
