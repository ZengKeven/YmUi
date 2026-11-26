<script setup lang="ts" vapor>
import { reactive, ref } from 'vue'
import { ConfigProvider, YmChatMarkdown, YmChatMessage, type ChatMessageData } from 'ym-ui-vapor'

const source = ref('')
const compact = ref(false)
const dark = ref(false)
const square = ref(false)
const textColor = ref('#403429')
const sample = '[详情](/orders)\n\n```text\nPO-42\n```'
const mixed = reactive({
  id: 'mixed-1',
  content: [
    { type: 'text', data: '# 原样显示' },
    { type: 'markdown', data: '## 交货明细' },
    { type: 'text', data: '[单号](/orders)' },
  ],
} satisfies ChatMessageData)
const reply = reactive({
  id: 'streaming-1',
  status: 'streaming',
  content: [{ type: 'markdown', data: '' }],
} satisfies ChatMessageData)
const chunks = ['## 到货\n\n查看[单', '据](/orders/42)\n\n``', '`text\nPO-', '42\n```']
const cursor = ref(0)
function appendChunk() {
  if (cursor.value < chunks.length) reply.content[0].data += chunks[cursor.value++]
}
</script>

<template>
  <label>源文<textarea v-model="source" /></label>
  <section id="standalone"><YmChatMarkdown :content="source" /></section>
  <section id="plain"><YmChatMessage content="# 标题 [详情](/orders)" /></section>
  <section id="mixed"><YmChatMessage :message="mixed" /></section>
  <section id="stream">
    <YmChatMessage :message="reply" />
    <button :disabled="cursor >= chunks.length" @click="appendChunk">追加一段</button>
  </section>

  <label>正文颜色<input v-model="textColor" type="color" /></label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="compact" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="square" type="checkbox" />直角代码块</label>
  <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'" :radius="18"
    :theme="{ light: { text: textColor }, dark: { text: '#f5f0da' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatMarkdown :content="sample" /></section>
      <section id="local"><YmChatMarkdown size="small" :content="sample" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
