<script setup lang="ts" vapor>
import { ref } from 'vue'
import {
  ConfigProvider, YmChatActionbar, YmChatList, YmChatMessage, YmChatSuggestion,
  type ChatMessageData, type ChatMessageStatus, type ChatMessageSuggestionContext, type ChatSuggestionItem,
} from 'ym-ui-vapor'

const items: ChatSuggestionItem[] = [
  { title: '核对单据', prompt: '入库前需要核对哪些单据？' },
  { title: '   ', prompt: '空标题不应展示' },
  { title: '核对单据', prompt: ' 出库前需要核对哪些单据？ ' },
  { title: '仓库地址？' },
  { title: '到货时间？', prompt: '  ' },
]
const none = ref(false)
const disabled = ref(false)
const picks = ref<string[]>([])
function record(prompt: string, { item, index, e, message }: ChatMessageSuggestionContext) {
  picks.value.push(JSON.stringify([prompt, item.title, index, e instanceof MouseEvent, message?.id]))
}
const status = ref<ChatMessageStatus>('pending')
const hasAnswer = ref(false)
const blockStatus = ref<ChatMessageStatus>()
const offered = { type: 'suggestion', data: items } as const
const answers: ChatMessageData[] = [
  { id: 'first', content: [offered] },
  { id: 'second', content: [offered] },
]
const small = ref(false)
const square = ref(false)
const dark = ref(false)
const ink = ref('#403429')
</script>

<template>
  <label><input v-model="none" type="checkbox" />清空问题</label>
  <label><input v-model="disabled" type="checkbox" />禁用追问</label>
  <section id="standalone">
    <YmChatSuggestion :content="none ? [] : items" :disabled="disabled" @select="record" />
  </section>
  <ol id="picks"><li v-for="(pick, index) in picks" :key="index">{{ pick }}</li></ol>

  <label>消息状态
    <select v-model="status">
      <option v-for="value in ['pending', 'streaming', 'complete', 'stop', 'error']" :key="value">{{ value }}</option>
    </select>
  </label>
  <label>问题块状态
    <select v-model="blockStatus">
      <option :value="undefined">跟随消息</option>
      <option v-for="value in ['pending', 'streaming', 'complete', 'stop', 'error']" :key="value">{{ value }}</option>
    </select>
  </label>
  <label><input v-model="hasAnswer" type="checkbox" />含有回复正文</label>
  <section id="message">
    <YmChatMessage :message="{ id: 'single' }" :status="status"
      :content="hasAnswer ? [{ type: 'markdown', data: '## 收货清单' }, { ...offered, status: blockStatus }]
        : [{ ...offered, status: blockStatus }]" @suggestion-click="record">
      <template #actionbar="{ copyText }"><YmChatActionbar :content="copyText" :action-bar="['copy']" /></template>
    </YmChatMessage>
  </section>
  <section id="history"><YmChatList :data="answers" reverse @suggestion-click="record" /></section>

  <label>问题文字颜色<input v-model="ink" type="color" /></label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="small" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="square" type="checkbox" />直角问题按钮</label>
  <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="small ? 'extra-small' : 'large'" :radius="18"
    :theme="{ light: { text: ink }, dark: { text: '#f5f0da' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatSuggestion :content="items" /></section>
      <section id="local"><YmChatSuggestion :content="items" size="small" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
