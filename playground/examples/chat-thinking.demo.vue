<script setup lang="ts" vapor>
import { onScopeDispose, reactive, ref } from 'vue'
import {
  YmButton, YmChatMessage, YmChatThinking, type ChatMarkdownContent, type ChatMessageData,
  type ChatThinkingContent, type ChatThinkingStatus, type ControlSize,
} from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()
const status = ref<ChatThinkingStatus>('pending')
const thinking = reactive<ChatThinkingContent>({ type: 'thinking', status: 'pending', data: { text: '' } })
const answer = reactive<ChatMarkdownContent>({ type: 'markdown', data: '' })
const reply = reactive<ChatMessageData>({ id: 'thinking-reply', name: '收货助手', role: 'assistant' })
const notes = ['已读取北门收货单。', '\n已核对三号库的预约时段。']
const answerChunks = ['## 收货安排\n\n', '- 到北门登记车牌\n', '- 前往三号库签收']
let timer: ReturnType<typeof setInterval> | undefined

function start() {
  if (timer !== undefined) return
  thinking.data.text = ''
  thinking.status = 'pending'
  answer.data = ''
  reply.content = [thinking]
  reply.status = 'streaming'

  let step = 0
  timer = setInterval(() => {
    if (step < notes.length) {
      thinking.status = 'streaming'
      thinking.data.text += notes[step]
    } else if (step === notes.length) {
      thinking.status = 'complete'
    } else {
      const index = step - notes.length - 1
      if (index === 0) reply.content = [thinking, answer]
      answer.data += answerChunks[index]
      if (index === answerChunks.length - 1) {
        reply.status = 'complete'
        clearInterval(timer)
        timer = undefined
      }
    }
    step++
  }, 400)
}

onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <PreviewFrame name="YmChatThinking">
    <template #preview>
      <div class="thinking-preview">
        <YmChatThinking :content="{ text: '已读取预约单。\n正在核对卸货窗口。' }" :status="status" :size="size" />
      </div>
    </template>
    <template #controls>
      <label>思考状态
        <select v-model="status">
          <option value="pending">等待首段</option>
          <option value="streaming">逐段接收</option>
          <option value="complete">思考完成</option>
        </select>
      </label>
      <label>面板尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>

    <section class="example-section">
      <h3>从思考过程到回复</h3>
      <YmButton theme="primary" :disabled="reply.status === 'streaming'" @click="start">模拟思考与回复</YmButton>
      <YmChatMessage v-if="reply.status" class="reply-preview" :message="reply" variant="base" />
    </section>
  </PreviewFrame>
</template>

<style scoped>
.thinking-preview { width: 100%; min-width: 0; }
.reply-preview { margin-block-start: 1rem; }
</style>
