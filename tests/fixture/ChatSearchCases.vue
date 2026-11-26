<script setup lang="ts" vapor>
import { reactive, ref } from 'vue'
import {
  ConfigProvider, YmChatActionbar, YmChatList, YmChatMessage, YmChatSearch,
  type ChatMessageContent, type ChatMessageData, type ChatMessageSearchContext, type ChatSearchData, type ChatSearchReference,
} from 'ym-ui-vapor'

const sources: ChatSearchData = {
  references: [
    { title: '收货单', url: '/receipts/42' },
    { title: '   ', url: '/empty-title' },
    { title: '签收记录', url: './history?day=2', site: '单据中心', date: '2026-11-26', content: '<em>核对签收数量</em>' },
  ],
}
const destinations: ChatSearchData = {
  title: '来源地址',
  references: [
    { title: '本地文档', url: '/tests/fixture/chat-markdown.html' },
    { title: '站内相对路径', url: './chat-message.html' },
    { title: '本页', url: '#basic' },
    { title: '查询', url: '?order=42' },
    { title: '带参数的单据', url: ' /orders?warehouse=3&amp;page=2 ' },
    { title: '外部文档', url: 'https://example.com/guide' },
    { title: '本地服务', url: 'http://example.test/docs' },
    { title: '内嵌数据', url: 'data:,example' },
    { title: '本地文件', url: 'file:///notes' },
    { title: '无协议外站', url: '//example.com/notes' },
    { title: '反斜杠路径', url: 'folder\\notes' },
    { title: '控制字符', url: 'notes\t/latest' },
    { title: '脚本协议', url: 'javascript:example' },
    { title: '邮箱', url: 'mailto:ops@example.test' },
    { title: '电话', url: 'tel:10086' },
    { title: '缺少地址' },
  ],
}

const none = ref(false)
const accepted = ref(true)
const requests = ref<boolean[]>([])
const changes = ref<boolean[]>([])
const selected = ref('')
function record(href: string, { item, index, e, message }: ChatMessageSearchContext) {
  e.preventDefault()
  selected.value = JSON.stringify([href, item.title, index, e instanceof MouseEvent, message?.id ?? null])
}
const sourceBlock = { type: 'search', data: sources } as const
const blocks = ref<ChatMessageContent[]>([sourceBlock])
function appendAnswer() {
  blocks.value.push({ type: 'text', data: '已核对' }, { type: 'markdown', data: '## 签收安排' })
}
const history: ChatMessageData[] = [
  { id: 'first', content: [sourceBlock] },
  { id: 'second', content: [sourceBlock] },
]
const incoming = reactive<ChatSearchReference[]>([{ title: ' ', url: '/ignored' }])
const incomingMessage: ChatMessageData = {
  id: 'incoming', status: 'streaming', content: [{ type: 'search', data: { references: incoming } }],
}
function updateSources() {
  incoming[1].url = 'file:///archive'
  incoming.push({ title: '签收说明', url: '/receipts/guide' })
}
const small = ref(false)
const square = ref(false)
const dark = ref(false)
const ink = ref('#403429')
</script>

<template>
  <label><input v-model="none" type="checkbox" />清空来源</label>
  <section id="basic">
    <YmChatSearch :content="none ? { references: [] } : sources"
      @collapsed-change="changes.push($event)" @source-click="record" />
  </section>
  <output id="changes">{{ JSON.stringify(changes) }}</output>
  <section id="controlled">
    <YmChatSearch :content="sources" :collapsed="accepted" @update:collapsed="requests.push($event)" />
  </section>
  <output id="requests">{{ JSON.stringify(requests) }}</output>
  <button @click="accepted = requests[requests.length - 1]">应用折叠请求</button>
  <section id="destinations"><YmChatSearch :content="destinations" default-collapsed /></section>

  <section id="message">
    <YmChatMessage :message="{ id: 'single', status: 'streaming', content: blocks }" @source-click="record">
      <template #actionbar="{ copyText }"><YmChatActionbar :content="copyText" :action-bar="['copy']" /></template>
    </YmChatMessage>
    <button @click="appendAnswer">追加正文</button>
  </section>
  <section id="history"><YmChatList :data="history" reverse @source-click="record" /></section>
  <section id="incremental">
    <YmChatMessage :message="incomingMessage" @source-click="record" />
    <button @click="incoming.push({ title: '到货记录', url: '/receipts/2' })">收到首条来源</button>
    <button :disabled="incoming.length < 2" @click="updateSources">更新并追加来源</button>
  </section>
  <output id="selected">{{ selected }}</output>

  <label>链接颜色<input v-model="ink" type="color" /></label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="small" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="square" type="checkbox" />直角面板</label>
  <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="small ? 'extra-small' : 'large'" :radius="18"
    :theme="{ light: { primary: ink }, dark: { primary: '#f5f0da' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatSearch :content="sources" /></section>
      <section id="local"><YmChatSearch :content="sources" size="small" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
