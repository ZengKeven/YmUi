<script setup lang="ts" vapor>
import { ref } from 'vue'
import {
  ConfigProvider, YmChatAttachments, YmChatMessage, YmChatSender,
  type ChatAttachmentItem, type ChatMessageData,
} from 'ym-ui-vapor'

const picture: ChatAttachmentItem = {
  key: 'photo', name: '日历.png', fileType: 'image', size: 2048,
  url: '/playground/examples/assets/delivery-calendar.png',
}
const mixed = ref<ChatAttachmentItem[]>([
  { key: 'first', name: '说明.txt', size: 20 },
  picture,
  { key: 'second', name: '说明.txt', description: '修订稿', size: 70 },
  { key: 'missing', name: '待补原图.png', fileType: 'image' },
])
const nextItems = ref<ChatAttachmentItem[]>([])
const removed = ref('')
const viewer = ref(true)
const removable = ref(true)
const legacy = ref<ChatAttachmentItem[]>([
  { name: '同名.png', url: picture.url + '?version=first' },
  { name: '同名.png', url: picture.url + '?version=second' },
])
const lockedUpdates = ref('')
function recordRemove(item: ChatAttachmentItem, { index, e }: { index: number; e: MouseEvent }) {
  removed.value = JSON.stringify([item.key, index, e.type])
}

const files = ref<ChatAttachmentItem[]>([])
const draft = ref('')
const messages = ref<ChatMessageData[]>([])
const blocked = ref(false)
const disabled = ref(false)
const sent = ref('')
function send(text: string, { attachments, e }: { attachments: readonly ChatAttachmentItem[]; e: Event }) {
  files.value.splice(0)
  draft.value = ''
  sent.value = JSON.stringify([e.type, text, attachments.map(file => [file.name, file.raw instanceof File])])
  messages.value.push({
    id: String(messages.value.length + 1), role: 'user',
    content: [{ type: 'text', data: text }, { type: 'attachment', data: attachments }],
  })
}

const compact = ref(false)
const dark = ref(false)
const square = ref(false)
const border = ref('#52687b')
</script>

<template>
  <section id="basic">
    <YmChatAttachments :items="mixed" :image-viewer="viewer" :removable="removable"
      @remove="recordRemove" @update:items="nextItems = $event" />
    <output id="removed">{{ removed }}</output>
    <output id="next">{{ nextItems.map(item => item.key).join(',') }}</output>
    <button @click="mixed = nextItems">接受移除</button>
    <label><input v-model="viewer" type="checkbox" />允许预览</label>
    <label><input v-model="removable" type="checkbox" />可移除</label>
  </section>
  <section id="legacy">
    <YmChatAttachments :items="legacy" />
    <button id="reorder" @click="legacy.reverse()">重排历史图片</button>
  </section>
  <section id="sender">
    <YmChatSender v-model="draft" v-model:attachments="files" :disabled="disabled" :send-btn-disabled="blocked" @send="send" />
    <label><input v-model="disabled" type="checkbox" />禁用发送框</label>
    <label><input v-model="blocked" type="checkbox" />暂停发送</label>
    <output id="sent">{{ sent }}</output>
  </section>
  <section id="history">
    <YmChatMessage v-for="message in messages" :key="message.id" :message="message">
      <template #actionbar="{ copyText }"><output class="copy">{{ copyText }}</output></template>
    </YmChatMessage>
    <button id="clear-history" @click="messages = []">清空已发消息</button>
  </section>
  <section id="text-only"><YmChatSender /></section>
  <section id="locked">
    <YmChatSender :attachments="[picture]" @update:attachments="next => lockedUpdates = JSON.stringify(next.map(file => file.name))" />
    <output>{{ lockedUpdates }}</output>
  </section>

  <label><input v-model="compact" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="square" type="checkbox" />直角卡片</label>
  <label>边框颜色<input v-model="border" type="color" /></label>
  <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { border, surface: '#f0f4f8' }, dark: { border: '#aabccc', surface: '#213240' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatAttachments :items="[picture]" /></section>
      <section id="local"><YmChatAttachments :items="[picture]" size="small" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
