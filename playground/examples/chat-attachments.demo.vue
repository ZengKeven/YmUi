<script setup lang="ts" vapor>
import { ref } from 'vue'
import {
  YmButton, YmChatAttachments, YmChatMessage, YmChatSender, YmSwitch,
  type ChatAttachmentItem, type ChatMessageContent, type ChatMessageData, type ChatSenderSendContext, type ControlSize,
} from '../../src'
import calendarImage from './assets/delivery-calendar.png'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const examples: ChatAttachmentItem[] = [
  { id: 'calendar', name: '配送日历.png', fileType: 'image', url: calendarImage, size: 60965 },
  { id: 'checklist', name: '收货清单.pdf', size: 24576 },
]
const items = ref<ChatAttachmentItem[]>([...examples])
const removable = ref(true)
const imageViewer = ref(true)
const size = ref<ControlSize>()

const draft = ref('')
const attachments = ref<ChatAttachmentItem[]>([])
const messages = ref<ChatMessageData[]>([])

function send(text: string, context: ChatSenderSendContext) {
  const content: ChatMessageContent[] = []
  if (text) content.push({ type: 'text', data: text })
  if (context.attachments.length) content.push({ type: 'attachment', data: context.attachments })
  messages.value.push({ id: 'dispatch-' + (messages.value.length + 1), role: 'user', name: '我', content })
  draft.value = ''
  attachments.value = []
}
</script>

<template>
  <PreviewFrame name="YmChatAttachments">
    <template #preview>
      <YmChatAttachments v-model:items="items" :removable="removable" :image-viewer="imageViewer" :size="size" />
    </template>
    <template #controls>
      <label>附件尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>允许移除 <YmSwitch v-model="removable" /></label>
      <label>图片预览 <YmSwitch v-model="imageViewer" /></label>
      <YmButton v-if="items.length < examples.length" variant="outline" @click="items = [...examples]">恢复示例附件</YmButton>
    </template>

    <section class="example-section">
      <h3>发送本地附件</h3>
      <div v-if="messages.length" class="sent-messages" role="region" aria-label="已发送的消息">
        <YmChatMessage v-for="message in messages" :key="message.id"
          :message="message" placement="right" variant="base" />
      </div>
      <YmChatSender v-model="draft" v-model:attachments="attachments" placeholder="可添加附件说明" @send="send" />
    </section>
  </PreviewFrame>
</template>

<style scoped>
.sent-messages { display: grid; gap: 1rem; margin-block-end: 1rem; }
</style>
