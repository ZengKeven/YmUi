<script setup lang="ts" vapor>
import { onScopeDispose, ref } from 'vue'
import { Message, YmButton, YmMessage, YmSwitch, type MessageHandle, type MessagePlacement, type MessageTheme, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const content = ref('采购单已保存')
const theme = ref<MessageTheme>('info')
const size = ref<ControlSize>()
const duration = ref(0)
const placement = ref<MessagePlacement>('top')
const icon = ref(true)
const closeBtn = ref(true)
const previewKey = ref(0)
const messages = new Set<MessageHandle>()
const themes = [
  ['info', '信息'], ['success', '成功'], ['warning', '警告'],
  ['error', '错误'], ['question', '疑问'], ['loading', '加载中'],
] as const
const placements = [
  ['top', '顶部'], ['top-left', '左上'], ['top-right', '右上'],
  ['left', '左侧'], ['center', '居中'], ['right', '右侧'],
  ['bottom', '底部'], ['bottom-left', '左下'], ['bottom-right', '右下'],
] as const

function showMessage(event: MouseEvent) {
  const handle = Message[theme.value]({
    source: event.currentTarget as HTMLElement, content: content.value, icon: icon.value, closeBtn: closeBtn.value,
    size: size.value, duration: duration.value, placement: placement.value, onClose: () => messages.delete(handle),
  })
  messages.add(handle)
}

onScopeDispose(() => { for (const handle of messages) handle.close() })
</script>

<template>
  <PreviewFrame name="YmMessage">
    <template #preview>
      <div :key="previewKey">
        <YmMessage :content="content" :theme="theme" :size="size" :icon="icon" :close-btn="closeBtn" :duration="duration" />
      </div>
    </template>
    <template #controls>
      <label>提示内容 <input v-model="content" type="text" /></label>
      <label>提示类型
        <select v-model="theme"><option v-for="[value, label] in themes" :key="value" :value="value">{{ label }}</option></select>
      </label>
      <label>提示尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示时长
        <select v-model="duration">
          <option :value="0">常驻</option><option :value="3000">3 秒</option><option :value="5000">5 秒</option>
        </select>
      </label>
      <label>状态图标 <YmSwitch v-model="icon" /></label>
      <label>关闭按钮 <YmSwitch v-model="closeBtn" /></label>
      <label>弹出位置
        <select v-model="placement"><option v-for="[value, label] in placements" :key="value" :value="value">{{ label }}</option></select>
      </label>
      <YmButton size="small" variant="outline" @click="showMessage">弹出全局提示</YmButton>
      <YmButton size="small" variant="text" @click="previewKey++">重新显示组件</YmButton>
      <YmButton size="small" variant="text" @click="Message.closeAll()">关闭全部全局提示</YmButton>
    </template>
  </PreviewFrame>
</template>
