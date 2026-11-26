<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmTag } from '../tag'
import type { ChatToolCallContent, ChatToolCallValue } from './types'

const props = defineProps<{ block: ChatToolCallContent }>()
const name = computed(() => props.block.data.toolCallName || props.block.data.toolCallId)
const status = computed(() => props.block.status ?? 'executing')
const states = {
  executing: { label: '进行中', theme: 'primary' },
  complete: { label: '成功', theme: 'success' },
  error: { label: '失败', theme: 'danger' },
  stop: { label: '已中断', theme: 'default' },
} as const

function displayValue(value: ChatToolCallValue) {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}
</script>

<template>
  <section class="ym-chat-message__toolcall" :aria-label="name" :data-tool-call-id="props.block.data.toolCallId"
    :data-status="status">
    <div class="ym-chat-message__toolcall-header">
      <strong class="ym-chat-message__toolcall-name">{{ name }}</strong>
      <YmTag role="status" variant="light" :theme="states[status].theme" :content="states[status].label" />
    </div>
    <dl v-if="props.block.data.args !== undefined || props.block.data.result !== undefined">
      <template v-if="props.block.data.args !== undefined">
        <dt>参数</dt>
        <dd><pre class="ym-chat-message__toolcall-args">{{ displayValue(props.block.data.args) }}</pre></dd>
      </template>
      <template v-if="props.block.data.result !== undefined">
        <dt>结果</dt>
        <dd><pre class="ym-chat-message__toolcall-result">{{ displayValue(props.block.data.result) }}</pre></dd>
      </template>
    </dl>
  </section>
</template>
