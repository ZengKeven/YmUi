<script setup lang="ts" vapor>
import { computed, inject, toRaw } from 'vue'
import { YmTag } from '../tag'
import { toolCallComponentsKey, toolCallRespondKey } from './toolcall-context'
import type { ChatToolCallContent, ChatToolCallValue } from './types'

const props = defineProps<{ block: ChatToolCallContent }>()
const getComponents = inject(toolCallComponentsKey, undefined)
const getRespond = inject(toolCallRespondKey, undefined)
const renderer = computed(() => {
  const components = getComponents?.()
  const tool = props.block.data.toolCallName
  // in 订阅响应式注册表的增删，hasOwn 只允许当前实例显式注册的名称。
  if (components && tool && tool in components && Object.hasOwn(components, tool)) return toRaw(components[tool])
})
const name = computed(() => props.block.data.toolCallName || props.block.data.toolCallId)
const status = computed(() => props.block.status ?? 'executing')
const respond = computed(() => status.value === 'awaiting-input' ? getRespond?.(toRaw(props.block)) : undefined)
const states = {
  executing: { label: '进行中', theme: 'primary' },
  'awaiting-input': { label: '待确认', theme: 'warning' },
  complete: { label: '成功', theme: 'success' },
  error: { label: '失败', theme: 'danger' },
  stop: { label: '已中断', theme: 'default' },
} as const

function displayValue(value: ChatToolCallValue) {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}
</script>

<template>
  <component v-if="renderer" :is="renderer" :toolCallId="props.block.data.toolCallId" :toolCallName="name"
    :status="status" :args="props.block.data.args" :result="props.block.data.result" :respond="respond" />
  <section v-else class="ym-chat-message__toolcall" :aria-label="name" :data-tool-call-id="props.block.data.toolCallId"
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
