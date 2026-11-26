<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmImage } from '../image'
import { acceptsImage } from '../image-upload/upload'
import { YmLoading } from '../loading'
import attachmentProps from './props'
import type { ChatAttachmentItem, ChatAttachmentRemoveContext } from './types'

defineOptions({ name: 'YmChatAttachments' })
const props = defineProps(attachmentProps)
const emit = defineEmits<{
  'update:items': [items: ChatAttachmentItem[]]
  remove: [item: ChatAttachmentItem, context: ChatAttachmentRemoveContext]
}>()

// 旧消息可能没有标识，同名附件仍需在移除和重排时保留各自的图片预览。
const keys = new WeakMap<ChatAttachmentItem, symbol>()
function keyFor(item: ChatAttachmentItem) {
  const id = item.id ?? item.key ?? item.uid
  if (id != null) return id
  let key = keys.get(item)
  if (!key) {
    key = Symbol()
    keys.set(item, key)
  }
  return key
}

function formatSize(bytes?: number) {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${Number(value.toFixed(1))} ${units[unit]}`
}

const cards = computed(() => props.items.map(item => {
  const isImage = item.fileType ? item.fileType === 'image' :
    acceptsImage({ name: item.name, type: item.type || item.raw?.type || '' }, '')
  return {
    item, key: keyFor(item),
    image: isImage ? item.url || item.raw : undefined,
    detail: item.description || formatSize(item.size ?? item.raw?.size),
  }
}))

function remove(index: number, e: MouseEvent) {
  const item = props.items[index]
  const next = props.items.slice()
  next.splice(index, 1)
  emit('update:items', next)
  emit('remove', item, { index, e })
}
</script>

<template>
  <ul v-if="cards.length" class="ym-chat-attachments ym-theme" role="list" aria-label="附件列表" :data-size="props.size">
    <li v-for="(card, index) in cards" :key="card.key" class="ym-chat-attachments__item">
      <YmImage v-if="card.image" class="ym-chat-attachments__thumbnail" :src="card.image" :alt="card.item.name"
        :preview="props.imageViewer" width="var(--ym-chat-attachment-thumbnail)" height="var(--ym-chat-attachment-thumbnail)" fit="cover">
        <template #loading><YmLoading /></template>
        <template #error><YmIcon name="file-image" aria-label="图片加载失败" /></template>
      </YmImage>
      <span v-else class="ym-chat-attachments__file"><YmIcon name="file" /></span>
      <div class="ym-chat-attachments__info">
        <span :title="card.item.name">{{ card.item.name }}</span>
        <span v-if="card.detail" class="ym-chat-attachments__detail">{{ card.detail }}</span>
      </div>
      <YmButton v-if="props.removable" variant="text" shape="square" :aria-label="'移除 ' + card.item.name"
        @click="remove(index, $event)"><YmIcon name="close" /></YmButton>
    </li>
  </ul>
</template>
