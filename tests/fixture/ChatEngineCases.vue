<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatbot, type ChatMessageSearchContext, type ChatServiceConfig, type ChatbotRequestContext, type SSEChunkData } from 'ym-ui-vapor'

const options = new URLSearchParams(location.search)
const events = ref<string[]>([])
const errors = ref<string[]>([])
const frames = ref<SSEChunkData[]>([])
const selectedSource = ref('')
const config: ChatServiceConfig = {
  endpoint: '/api/sse-fixture',
  stream: true,
  onAbort() { events.value.push('abort') },
  onComplete(aborted, params) { events.value.push((aborted ? 'stopped' : 'complete') + ':' + params.trigger) },
  onError(error) { errors.value.push(error.message) },
}

if (options.has('map')) {
  config.onRequest = params => ({
    headers: { 'X-Request-Kind': params.trigger },
    body: JSON.stringify({ question: params.prompt }),
  })
  config.onMessage = chunk => {
    frames.value.push(chunk)
    if (chunk.event === 'ignore') return null
    if (chunk.event === 'invalid') throw new Error('无法转换此事件')
    if (chunk.event === 'reasoning') return { type: 'thinking', data: { text: chunk.raw } }
    if (chunk.event === 'question') return { type: 'suggestion', data: [{ title: chunk.raw }] }
    if (chunk.event === 'document' && typeof chunk.data === 'string') {
      return { type: 'attachment', data: [{ name: '收货清单.txt', url: chunk.data }] }
    }
    if (chunk.event === 'catalog' && Array.isArray(chunk.data)) {
      return { type: 'search', data: { references: chunk.data.map(title => ({ title: String(title) })) } }
    }
    if (typeof chunk.data === 'object' && chunk.data && 'piece' in chunk.data) {
      return { type: 'markdown', data: String(chunk.data.piece) }
    }
    return chunk.raw
  }
}

function legacy({ onChunk }: ChatbotRequestContext) {
  onChunk('自定义请求')
}

function selectSource(href: string, context: ChatMessageSearchContext) {
  context.e.preventDefault()
  selectedSource.value = JSON.stringify([href, context.item, context.index, context.message?.id, context.e.defaultPrevented])
}
</script>

<template>
  <YmChatbot :chat-service-config="options.has('missing') ? undefined : config"
    :request="options.has('legacy') ? legacy : undefined" @source-click="selectSource" />
  <output id="events">{{ JSON.stringify(events) }}</output>
  <output id="errors">{{ JSON.stringify(errors) }}</output>
  <output id="frames">{{ JSON.stringify(frames.map(frame => [frame.event, frame.id, frame.data, frame.raw])) }}</output>
  <output id="selected-source">{{ selectedSource }}</output>
</template>
