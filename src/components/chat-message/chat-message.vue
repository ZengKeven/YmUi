<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmChatMarkdown } from '../chat-markdown'
import { YmChatSearch, type ChatSearchSourceContext } from '../chat-search'
import { hasSearchTitle } from '../chat-search/references'
import { YmChatSuggestion, type ChatSuggestionSelectContext } from '../chat-suggestion'
import { YmChatThinking, type ChatThinkingStatus } from '../chat-thinking'
import { YmIcon } from '../icon'
import { YmImage } from '../image'
import { YmLoading } from '../loading'
import chatMessageProps from './props'
import type { ChatMessageSearchContext, ChatMessageStatus, ChatMessageSuggestionContext } from './types'

defineOptions({ name: 'YmChatMessage' })
const props = defineProps(chatMessageProps)
const emit = defineEmits<{
  'source-click': [href: string, context: ChatMessageSearchContext]
  'suggestion-click': [prompt: string, context: ChatMessageSuggestionContext]
}>()
const slots = defineSlots<{
  default?: () => unknown
  content?: () => unknown
  avatar?: () => unknown
  name?: () => unknown
  datetime?: () => unknown
  header?: () => unknown
  actionbar?: (scope: { copyText: string; status: ChatMessageStatus }) => unknown
}>()

const role = computed(() => props.role ?? props.message?.role ?? 'assistant')
const status = computed(() => props.status ?? props.message?.status ?? 'complete')
const name = computed(() => props.name ?? props.message?.name)
const datetime = computed(() => props.datetime ?? props.message?.datetime)
const avatar = computed(() => {
  const value = props.avatar ?? props.message?.avatar
  return typeof value === 'string' ? { src: value } : value
})
const avatarIcon = { user: 'user', assistant: 'reply', system: 'info' } as const
const roleName = { user: '用户', assistant: '助手', system: '系统' } as const
const avatarAlt = computed(() => avatar.value?.alt ?? (name.value ? '' : roleName[role.value] + '头像'))
const segments = computed(() => {
  const content = props.content ?? props.message?.content
  if (typeof content === 'string') return [{ type: 'text' as const, data: content }]
  return content?.filter(block => block.type === 'text' || block.type === 'markdown' ||
    block.type === 'thinking' || block.type === 'search' || block.type === 'suggestion') ?? []
})
const answerBlocks = computed(() => segments.value.filter(block => block.type === 'text' || block.type === 'markdown'))
const thinkingStatus = computed<ChatThinkingStatus>(() =>
  status.value === 'pending' || status.value === 'streaming' ? status.value : 'complete')
const loading = computed(() => {
  if (status.value !== 'pending' && status.value !== 'streaming') return false
  if (slots.content || slots.default) return status.value === 'pending'
  if (segments.value.some(block => block.type === 'thinking' ||
    (block.type === 'search' && block.data?.references?.some(hasSearchTitle)))) return false
  return status.value === 'pending' || !answerBlocks.value.some(block => block.data)
})
const copyText = computed(() => answerBlocks.value.map(block => block.data).join('\n'))

function openSource(href: string, context: ChatSearchSourceContext) {
  emit('source-click', href, { ...context, message: props.message })
}

function selectSuggestion(prompt: string, context: ChatSuggestionSelectContext) {
  emit('suggestion-click', prompt, { ...context, message: props.message })
}
</script>

<template>
  <article class="ym-chat-message ym-theme" :data-message-id="props.message?.id" :data-role="role"
    :data-status="status" :data-placement="props.placement" :data-variant="props.variant" :data-size="props.size">
    <div v-if="slots.avatar || avatar?.src || avatar?.fallback" class="ym-chat-message__avatar">
      <slot name="avatar">
        <YmImage v-if="avatar" :src="avatar.src" :alt="avatarAlt" :fallback="avatar.fallback"
          width="var(--ym-control-height)" height="var(--ym-control-height)" fit="cover" shape="circle">
          <template #loading><span aria-hidden="true" /></template>
          <template #error><YmIcon :name="avatarIcon[role]" :aria-label="avatarAlt || undefined" /></template>
        </YmImage>
      </slot>
    </div>
    <div class="ym-chat-message__body">
      <div v-if="slots.header || slots.name || slots.datetime || name || datetime" class="ym-chat-message__header">
        <slot name="header">
          <span v-if="slots.name || name"><slot name="name">{{ name }}</slot></span>
          <span v-if="slots.datetime || datetime"><slot name="datetime">{{ datetime }}</slot></span>
        </slot>
      </div>
      <div class="ym-chat-message__bubble">
        <slot name="content"><slot>
          <template v-for="(block, index) in segments" :key="`${props.message?.id ?? ''}:${index}`">
            <YmChatMarkdown v-if="block.type === 'markdown'" :content="block.data" />
            <YmChatThinking v-else-if="block.type === 'thinking'" :content="block.data" :status="block.status ?? thinkingStatus" />
            <YmChatSearch v-else-if="block.type === 'search'" :content="block.data" @source-click="openSource" />
            <template v-else-if="block.type === 'suggestion'">
              <YmChatSuggestion v-if="status === 'complete' && (block.status ?? 'complete') === 'complete'"
                :content="block.data" @select="selectSuggestion" />
            </template>
            <div v-else class="ym-chat-message__text">{{ block.data }}</div>
          </template>
        </slot></slot>
        <YmLoading v-if="loading" text="加载中" />
        <div v-if="status === 'error'" class="ym-chat-message__error" role="alert">
          <YmIcon name="error" />消息出错
        </div>
      </div>
      <div v-if="slots.actionbar" class="ym-chat-message__actionbar">
        <slot name="actionbar" :copy-text="copyText" :status="status" />
      </div>
    </div>
  </article>
</template>
