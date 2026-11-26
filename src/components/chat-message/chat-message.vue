<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmChatMarkdown } from '../chat-markdown'
import { YmIcon } from '../icon'
import { YmImage } from '../image'
import { YmLoading } from '../loading'
import chatMessageProps from './props'
import type { ChatMessageStatus } from './types'

defineOptions({ name: 'YmChatMessage' })
const props = defineProps(chatMessageProps)
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
  return content?.filter(block => block.type === 'text' || block.type === 'markdown') ?? []
})
const loading = computed(() => status.value === 'pending' ||
  (status.value === 'streaming' && !slots.content && !slots.default && !segments.value.some(block => block.data)))
const copyText = computed(() => segments.value.map(block => block.data).join('\n'))
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
          <template v-for="(block, index) in segments" :key="index">
            <YmChatMarkdown v-if="block.type === 'markdown'" :content="block.data" />
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
