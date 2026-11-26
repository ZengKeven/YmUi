<script setup lang="ts" vapor>
import { computed, onScopeDispose, provide, ref, shallowRef, useId } from 'vue'
import { ChatEngine, type ChatStreamContent } from '../../chat-engine'
import { createReplyContent } from '../../chat-engine/reply-content'
import { YmChatActionbar } from '../chat-actionbar'
import type { ChatAttachmentItem } from '../chat-attachments'
import { YmChatList } from '../chat-list'
import type { ChatMessageContent, ChatMessageData, ChatMessageSearchContext, ChatMessageStatus } from '../chat-message'
import { toolCallComponentsKey } from '../chat-message/toolcall-context'
import { YmChatSender } from '../chat-sender'
import chatbotProps from './props'
import type { ChatbotInstance, ChatbotRequestContext, ChatbotSendOptions } from './types'

defineOptions({ name: 'YmChatbot' })
const props = defineProps(chatbotProps)
provide(toolCallComponentsKey, () => props.toolCallComponents)
const emit = defineEmits<{
  'message-change': [messages: ChatMessageData[]]
  'source-click': [href: string, context: ChatMessageSearchContext]
}>()

const messages = shallowRef<ChatMessageData[]>(props.defaultMessages.slice())
const draft = ref('')
const attachments = ref<ChatAttachmentItem[]>([])
const active = shallowRef<AbortController>()
const transport = computed(() => {
  if (props.request) return props.request
  if (props.chatServiceConfig?.endpoint) {
    const engine = new ChatEngine(props.chatServiceConfig)
    return (context: ChatbotRequestContext) => engine.send(context)
  }
})
const prefix = useId()
let sequence = 0

function nextId() {
  let id: string
  do {
    id = `ym-chatbot-${prefix}-${++sequence}`
  } while (messages.value.some(item => item.id === id))
  return id
}

function publish(next: ChatMessageData[]) {
  messages.value = next
  emit('message-change', next.slice())
}

// 历史消息与当前会话使用相同的重试入口，可从字符串或混合内容块还原原问题。
const lastTurn = computed(() => {
  const reply = messages.value.at(-1)
  const user = messages.value.at(-2)
  if (!reply || (reply.role ?? 'assistant') !== 'assistant' || user?.role !== 'user') return
  const blocks = user.content
  const input = typeof blocks === 'string' ? { prompt: blocks, attachments: [] } : {
    prompt: blocks?.filter(block => block.type === 'text' || block.type === 'markdown').map(block => block.data).join('\n') ?? '',
    attachments: blocks?.flatMap(block => block.type === 'attachment' ? block.data : []) ?? [],
  }
  if (input.prompt.trim() || input.attachments.length) return { reply, input }
})

async function generate(history: ChatMessageData[], assistant: ChatMessageData,
  input: Required<ChatbotSendOptions>, trigger: ChatbotRequestContext['trigger']) {
  const execute = transport.value
  if (!execute) return
  const controller = new AbortController()
  const { signal } = controller
  active.value = controller
  const reply = createReplyContent()
  function update(status: ChatMessageStatus) {
    publish([...history, { ...assistant, status, content: reply.snapshot(status) }])
  }
  function onContent(chunk: ChatStreamContent) {
    if (active.value !== controller || (chunk.type === 'markdown' && !chunk.data)) return
    reply.append(chunk)
    update('streaming')
  }

  // 即使服务稍后才返回，调用方也可以在停止后立即开始下一轮。
  let onAbort!: () => void
  const stopped = new Promise<void>(resolve => {
    onAbort = () => {
      if (active.value === controller) {
        active.value = undefined
        update('stop')
      }
      resolve()
    }
  })
  signal.addEventListener('abort', onAbort, { once: true })
  let status: 'complete' | 'error' = 'complete'
  try {
    update('pending')
    if (signal.aborted) return
    const request = execute({
      ...input, attachments: input.attachments.slice(), messages: history.slice(), trigger, signal,
      onChunk: data => onContent({ type: 'markdown', data }),
      onContent,
    })
    if (request) await Promise.race([request, stopped])
  } catch {
    status = 'error'
  } finally {
    signal.removeEventListener('abort', onAbort)
    if (active.value === controller) {
      active.value = undefined
      update(status)
    }
  }
}

async function send(input: ChatbotSendOptions, fromDraft = false) {
  const prompt = input.prompt?.trim() ? input.prompt : ''
  const files = input.attachments?.slice() ?? []
  if (!transport.value || active.value || (!prompt && !files.length)) return
  const content: ChatMessageContent[] = []
  if (prompt) content.push({ type: 'text', data: prompt })
  if (files.length) content.push({ type: 'attachment', data: files })
  const user: ChatMessageData = { id: nextId(), role: 'user', name: '我', content }
  if (fromDraft) {
    draft.value = ''
    attachments.value = []
  }
  await generate([...messages.value, user], { id: nextId(), role: 'assistant', name: '助手' },
    { prompt, attachments: files }, 'send')
}

async function regenerate() {
  const turn = lastTurn.value
  if (active.value || !turn) return
  await generate(messages.value.slice(0, -1), turn.reply, turn.input, 'regenerate')
}

function abortChat() {
  active.value?.abort()
}

function clearMessages() {
  if (!messages.value.length) return
  const controller = active.value
  active.value = undefined
  publish([])
  controller?.abort()
}

onScopeDispose(() => {
  const controller = active.value
  active.value = undefined
  controller?.abort()
})
defineExpose({ sendUserMessage: input => send(input), regenerate, abortChat, clearMessages } satisfies ChatbotInstance)
</script>

<template>
  <YmChatList class="ym-chatbot" :data="messages" :size="props.size" :suggestion-disabled="!!active || !transport"
    @clear="clearMessages" @suggestion-click="prompt => send({ prompt })"
    @source-click="(href, context) => emit('source-click', href, context)">
    <template #actionbar="{ item }">
      <span v-if="item.status === 'stop' && (item.role ?? 'assistant') === 'assistant'"
        class="ym-chatbot__stopped" role="status">已停止生成</span>
      <YmChatActionbar v-if="transport && !active && item.id === lastTurn?.reply.id" :action-bar="['replay']" @actions="regenerate" />
    </template>
    <template #footer>
      <YmChatSender v-model="draft" v-model:attachments="attachments" :placeholder="props.placeholder"
        :loading="!!active" :send-btn-disabled="!transport || (!draft.trim() && !attachments.length)"
        @send="(prompt, context) => send({ prompt, attachments: context.attachments }, true)" @stop="abortChat" />
    </template>
  </YmChatList>
</template>
