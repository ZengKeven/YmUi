<script setup lang="ts" vapor>
import { onScopeDispose, reactive, ref } from 'vue'
import {
  YmButton, YmChatMessage, YmChatSearch, type ChatMarkdownContent, type ChatMessageData,
  type ChatSearchData, type ControlSize,
} from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()
const sources = {
  title: '组件文档来源',
  references: [
    { title: '对话消息用法', url: '/chat-message/', site: 'YmUi 文档', content: '消息角色、状态和内容块用法。' },
    { title: 'Markdown 正文用法', url: '/chat-markdown/', site: 'YmUi 文档', content: '标题、列表和流式渲染示例。' },
  ],
} satisfies ChatSearchData
const preview: ChatSearchData = {
  references: [...sources.references, { title: '内部笔记（仅标题）', url: 'archive:notes' }],
}
const reply = reactive<ChatMessageData>({ id: 'search-reply', name: '组件助手', role: 'assistant' })
const chunks = ['## 接入步骤\n\n', '- 准备搜索结果。\n', '- 追加 Markdown 回复。']
let timer: ReturnType<typeof setInterval> | undefined

function start() {
  clearInterval(timer)
  reply.status = 'pending'
  reply.content = []
  const search = { type: 'search' as const, data: sources }
  const answer = reactive<ChatMarkdownContent>({ type: 'markdown', data: '' })
  let step = 0
  timer = setInterval(() => {
    if (step === 0) {
      reply.status = 'streaming'
      reply.content = [search]
    } else {
      answer.data += chunks[step - 1]
      if (step === 1) reply.content = [search, answer]
      if (step === chunks.length) {
        reply.status = 'complete'
        clearInterval(timer)
      }
    }
    step++
  }, 400)
}

onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <PreviewFrame name="YmChatSearch">
    <template #preview>
      <div class="search-preview">
        <YmChatSearch :content="preview" :size="size" />
      </div>
    </template>
    <template #controls>
      <label>面板尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>

    <section class="example-section">
      <h3>先展示来源，再生成回复</h3>
      <YmButton theme="primary" @click="start">模拟搜索与回复</YmButton>
      <YmChatMessage v-if="reply.status" class="reply-preview" :message="reply" variant="base" />
    </section>
  </PreviewFrame>
</template>

<style scoped>
.search-preview { width: 100%; min-width: 0; }
.reply-preview { margin-block-start: 1rem; }
</style>
