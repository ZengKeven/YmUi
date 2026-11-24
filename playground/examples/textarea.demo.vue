<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmSwitch, YmTextarea, type TextareaProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const note = ref('到货前请电话联系。')
const size = ref<TextareaProps['size']>()
const status = ref<TextareaProps['status']>('default')
const heightMode = ref('fixed')
const autosize = computed(() => heightMode.value === 'bounded' ? { minRows: 2, maxRows: 5 } : heightMode.value === 'content')
const limitMode = ref('length')
const maxlength = computed(() => limitMode.value === 'length' ? 40 : undefined)
const maxcharacter = computed(() => limitMode.value === 'weighted' ? 40 : undefined)
const allowInputOverMax = ref(false)
const readOnly = ref(false)
const disabled = ref(false)
</script>

<template>
  <PreviewFrame name="YmTextarea">
    <template #preview>
      <YmTextarea v-model="note" aria-label="收货备注" placeholder="请输入收货要求" tips="每行填写一项收货要求。"
        :size="size" :status="status" :autosize="autosize" :maxlength="maxlength" :maxcharacter="maxcharacter"
        :allow-input-over-max="allowInputOverMax" :readonly="readOnly" :disabled="disabled" />
    </template>
    <template #controls>
      <label>文本框尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, text] in sizes" :key="value" :value="value">{{ text }}</option>
        </select>
      </label>
      <label>文本框高度
        <select v-model="heightMode">
          <option value="fixed">固定行数</option><option value="content">随内容增长</option>
          <option value="bounded">自适应 2 至 5 行</option>
        </select>
      </label>
      <label>字数限制
        <select v-model="limitMode">
          <option value="none">不限</option><option value="length">最多 40 个字符</option>
          <option value="weighted">最多 40，汉字计 2</option>
        </select>
      </label>
      <label>校验状态
        <select v-model="status">
          <option value="default">默认</option><option value="success">成功</option>
          <option value="warning">警告</option><option value="error">错误</option>
        </select>
      </label>
      <label v-if="limitMode !== 'none'">允许超限 <YmSwitch v-model="allowInputOverMax" /></label>
      <label>只读 <YmSwitch v-model="readOnly" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
