<script setup lang="ts" vapor>
import { onScopeDispose, reactive, ref } from 'vue'
import { YmButton, YmChatList, YmChatSuggestion, YmSwitch, type ChatMessageData,
  type ChatSuggestionItem, type ChatTextContent, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()
const disabled = ref(false)
const selected = ref('')
const initialPrompt = '今天如何办理收货？'
const questions = [
  { title: '要带哪些单据？', prompt: '办理收货需要携带哪些单据？' },
  { title: '三号库怎么走？', prompt: '从北门到三号库怎么走？' },
] satisfies ChatSuggestionItem[]
const replies = new Map([
  [initialPrompt, ['请先到北门登记。', '登记后前往三号库。']],
  [questions[0].prompt, ['请携带送货单。', '还需提供采购单号。', '签收后请保留回执。']],
  [questions[1].prompt, ['从北门沿主路直行。', '到第二个路口右转。', '三号库在左侧。']],
])
const messages = ref<ChatMessageData[]>([])
const running = ref(false)
let turn = 0
let timer: ReturnType<typeof setInterval> | undefined

function send(prompt: string) {
  const chunks = replies.get(prompt)
  if (running.value || !chunks) return
  const previous = messages.value.at(-1)
  if (previous?.content && typeof previous.content !== 'string') {
    previous.content = previous.content.filter(block => block.type !== 'suggestion')
  }
  turn++
  const text = reactive<ChatTextContent>({ type: 'text', data: '' })
  const reply = reactive<ChatMessageData>({
    id: 'reply-' + turn, role: 'assistant', name: '收货助手', status: 'pending',
    content: [text, { type: 'suggestion', data: questions.filter(question => question.prompt !== prompt) }],
  })
  messages.value.push({ id: 'question-' + turn, role: 'user', name: '采购员', content: prompt }, reply)
  running.value = true

  let index = 0
  timer = setInterval(() => {
    text.data += chunks[index++]
    if (index < chunks.length) {
      reply.status = 'streaming'
      return
    }
    reply.status = 'complete'
    clearInterval(timer)
    running.value = false
  }, 400)
}

function start() {
  if (running.value) return
  messages.value = []
  send(initialPrompt)
}
onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <PreviewFrame name="YmChatSuggestion">
    <template #preview>
      <div class="suggestion-preview">
        <YmChatSuggestion :content="questions" :disabled="disabled" :size="size" @select="selected = $event" />
        <p v-if="selected" role="status">追问内容为「{{ selected }}」</p>
      </div>
    </template>
    <template #controls>
      <label>问题尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>禁用追问 <YmSwitch v-model="disabled" /></label>
    </template>

    <section class="example-section">
      <h3>回复后继续追问</h3>
      <YmButton theme="primary" :disabled="running" @click="start">模拟首轮回复</YmButton>
      <YmChatList v-if="messages.length" class="conversation" :data="messages" :clear-history="false" @suggestion-click="send" />
    </section>
  </PreviewFrame>
</template>

<style scoped>
.suggestion-preview { width: 100%; min-width: 0; }
.suggestion-preview p { margin-block: .75rem 0; }
.conversation { height: 22rem; margin-block-start: 1rem; }
</style>
