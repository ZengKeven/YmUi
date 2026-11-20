<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmCheckbox, YmCheckboxGroup, type CheckboxValue, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const channels = ['站内信', '邮件', '短信']
const selected = ref<CheckboxValue[]>(['站内信'])
const size = ref<ControlSize>()
const disabled = ref(false)
const allSelected = computed({
  get: () => selected.value.length === channels.length,
  set: (checked: boolean) => { selected.value = checked ? [...channels] : [] },
})
</script>

<template>
  <PreviewFrame name="YmCheckbox">
    <template #preview>
      <div class="checkbox-demo">
        <YmCheckbox v-model="allSelected" :indeterminate="selected.length > 0 && selected.length < channels.length"
          :size="size" :disabled="disabled">全选通知方式</YmCheckbox>
        <YmCheckboxGroup v-model="selected" aria-label="通知方式" :size="size" :disabled="disabled">
          <YmCheckbox v-for="channel in channels" :key="channel" :value="channel" />
        </YmCheckboxGroup>
      </div>
    </template>
    <template #controls>
      <label>复选框尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>禁用 <input v-model="disabled" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.checkbox-demo { display: grid; justify-items: start; gap: 1rem; }
</style>
