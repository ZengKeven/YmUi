<script setup lang="ts" vapor>
import { computed, onScopeDispose, reactive, ref } from 'vue'
import {
  YmChatActionbar, YmChatMessage, type ChatActionbarAction, type ChatActionbarComment,
  type ChatMarkdownContent, type ChatMessageData, type ControlSize,
} from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()
const preset = ref<'all' | 'feedback'>('all')
const actionBar = computed<ChatActionbarAction[] | undefined>(() =>
  preset.value === 'feedback' ? ['good', 'bad', 'copy'] : undefined)
const comment = ref<ChatActionbarComment>('')
const block = reactive<ChatMarkdownContent>({ type: 'markdown', data: '请携带送货单到北门登记。' })
const reply = reactive<ChatMessageData>({
  id: 'arrival-reply', name: '收货助手', role: 'assistant', status: 'complete', content: [block],
})
const replies = [
  ['## 入库安排\n\n', '- 北门登记车牌\n', '- 三号库核对送货单'],
  ['## 签收步骤\n\n', '- 凭送货单核对数量\n', '- 在回执上签名'],
]
let turn = 0
let timer: ReturnType<typeof setInterval> | undefined

function handleAction(action: ChatActionbarAction) {
  if (action !== 'replay' || timer !== undefined) return
  const chunks = replies[turn++ % replies.length]
  let index = 0
  comment.value = ''
  block.data = ''
  reply.status = 'pending'
  timer = setInterval(() => {
    block.data += chunks[index++]
    if (index < chunks.length) {
      reply.status = 'streaming'
      return
    }
    clearInterval(timer)
    timer = undefined
    reply.status = 'complete'
  }, 400)
}

onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <PreviewFrame name="YmChatActionbar">
    <template #preview>
      <div class="reply-preview">
        <YmChatMessage :message="reply" variant="base">
          <template #actionbar="{ copyText, status }">
            <YmChatActionbar v-model:comment="comment" :content="copyText" :action-bar="actionBar"
              :size="size" :disabled="status === 'pending' || status === 'streaming'" @actions="handleAction" />
          </template>
        </YmChatMessage>
      </div>
    </template>
    <template #controls>
      <label>可用操作
        <select v-model="preset">
          <option value="all">全部操作</option>
          <option value="feedback">点赞、点踩、复制</option>
        </select>
      </label>
      <label>操作栏尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.reply-preview { width: 100%; min-width: 0; }
</style>
