<script setup lang="ts" vapor>
import { computed, nextTick, onMounted, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmChatMessage, type ChatMessageData, type ChatMessageSearchContext, type ChatMessageSuggestionContext } from '../chat-message'
import { YmDialog, type DialogActionContext } from '../dialog'
import { YmIcon } from '../icon'
import chatListProps from './props'
import type { ChatListInstance } from './types'

defineOptions({ name: 'YmChatList' })
const props = defineProps(chatListProps)
const emit = defineEmits<{
  'update:data': [messages: ChatMessageData[]]
  clear: [context: { e: Event }]
  scroll: [context: { e: Event }]
  'source-click': [href: string, context: ChatMessageSearchContext]
  'suggestion-click': [prompt: string, context: ChatMessageSuggestionContext]
}>()
type MessageSlot = (scope: { item: ChatMessageData; index: number }) => unknown
const slots = defineSlots<{
  default?: () => unknown
  footer?: () => unknown
  avatar?: MessageSlot
  name?: MessageSlot
  datetime?: MessageSlot
  header?: MessageSlot
  content?: MessageSlot
  actionbar?: MessageSlot
}>()

const rows = computed(() => {
  const items = props.data?.map((item, index) => ({ item, index })) ?? []
  return props.reverse ? items.reverse() : items
})
const canClear = computed(() => props.clearHistory && Boolean(rows.value.length || slots.default))
const confirming = ref(false)
watch(canClear, available => { if (!available) confirming.value = false })

function clear({ e }: DialogActionContext) {
  if (!canClear.value) return
  emit('update:data', [])
  emit('clear', { e })
}

const viewport = useTemplateRef<HTMLDivElement>('viewport')
const content = useTemplateRef<HTMLDivElement>('content')
const atBottom = ref(true)
let positioned = false
let smoothScroll = false
let resize: ResizeObserver | undefined

function measure(el: HTMLElement) {
  // scrollTop 可带小数，另外两项尺寸由浏览器取整。
  atBottom.value = el.scrollHeight - el.clientHeight - el.scrollTop <= 2
}

function resizeList() {
  const el = viewport.value
  if (!el?.clientHeight) return
  // 用内容变化前的位置判定是否跟随，逐段追加或头像加载都会改变内容高度。
  const follow = positioned ? props.autoScroll && atBottom.value : props.defaultScrollTo === 'bottom'
  if (follow && !smoothScroll) el.scrollTop = el.scrollHeight
  positioned = true
  measure(el)
}

const scrollToBottom: ChatListInstance['scrollToBottom'] = (options = {}) => {
  // 调用方可以追加消息后立即回底，此时先等本轮 Vue 更新写入 DOM。
  nextTick(() => {
    const el = viewport.value
    if (!el?.clientHeight) return
    positioned = true
    measure(el)
    smoothScroll = !atBottom.value && options.behavior === 'smooth' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ top: el.scrollHeight, behavior: smoothScroll ? 'smooth' : 'instant' })
    measure(el)
  })
}
defineExpose({ scrollToBottom })

function onScroll(e: Event) {
  measure(e.currentTarget as HTMLElement)
  emit('scroll', { e })
}
function endScroll() {
  if (!smoothScroll) return
  smoothScroll = false
  // 动画期间可能又收到分片，再对齐一次最新的底部。
  if (props.autoScroll) scrollToBottom()
}
function interruptScroll() {
  const el = viewport.value
  if (!smoothScroll || !el) return
  smoothScroll = false
  el.scrollTo({ top: el.scrollTop, behavior: 'instant' })
  measure(el)
}

onMounted(() => {
  if (!viewport.value || !content.value) return
  resizeList()
  resize = new ResizeObserver(resizeList)
  resize.observe(viewport.value)
  resize.observe(content.value)
})
onScopeDispose(() => resize?.disconnect())
</script>

<template>
  <div class="ym-chat-list ym-theme" :data-size="props.size">
    <div v-if="canClear" class="ym-chat-list__toolbar">
      <YmButton variant="text" @click="confirming = true">
        <template #icon><YmIcon name="clear" /></template>清空历史
      </YmButton>
      <YmDialog v-model:visible="confirming" header="清空历史消息？" body="清空后将移除当前对话中的所有消息。"
        confirm-btn="清空" @confirm="clear" />
    </div>
    <div class="ym-chat-list__main">
      <div ref="viewport" class="ym-chat-list__viewport" role="region" aria-label="对话记录" tabindex="0"
        @scroll="onScroll" @scrollend="endScroll" @wheel.passive="interruptScroll" @touchstart.passive="interruptScroll"
        @pointerdown="interruptScroll" @keydown="interruptScroll">
        <div ref="content" class="ym-chat-list__messages" :data-reverse="props.reverse && !rows.length || undefined">
          <template v-if="rows.length">
            <YmChatMessage v-for="{ item, index } in rows" :key="item.id" :message="item"
              :variant="item.role === 'user' ? 'base' : 'text'"
              :placement="props.layout === 'both' && item.role === 'user' ? 'right' : 'left'"
              :suggestion-disabled="props.suggestionDisabled"
              @source-click="(href, context) => emit('source-click', href, context)"
              @suggestion-click="(prompt, context) => emit('suggestion-click', prompt, context)">
              <template v-if="slots.avatar" #avatar><slot name="avatar" :item="item" :index="index" /></template>
              <template v-if="slots.name" #name><slot name="name" :item="item" :index="index" /></template>
              <template v-if="slots.datetime" #datetime><slot name="datetime" :item="item" :index="index" /></template>
              <template v-if="slots.header" #header><slot name="header" :item="item" :index="index" /></template>
              <template v-if="slots.content" #content><slot name="content" :item="item" :index="index" /></template>
              <template v-if="slots.actionbar" #actionbar><slot name="actionbar" :item="item" :index="index" /></template>
            </YmChatMessage>
          </template>
          <slot v-else />
        </div>
      </div>
      <YmButton v-if="props.showScrollButton && !atBottom" class="ym-chat-list__to-bottom" variant="outline"
        @click="scrollToBottom({ behavior: 'smooth' })">
        <template #icon><YmIcon name="arrow-down" /></template>回到底部
      </YmButton>
    </div>
    <div v-if="slots.footer" class="ym-chat-list__footer"><slot name="footer" /></div>
  </div>
</template>
