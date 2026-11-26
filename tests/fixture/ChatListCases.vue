<script setup lang="ts" vapor>
import { computed, ref, useTemplateRef } from 'vue'
import { ConfigProvider, YmChatList, YmChatMessage, YmChatSender, type ChatListInstance, type ChatMessageData } from 'ym-ui-vapor'

const params = new URLSearchParams(location.search)
const list = useTemplateRef<ChatListInstance>('list')
const messages = ref<ChatMessageData[]>(Array.from({ length: 24 }, (_, index) => ({
  id: String(index + 1), role: index % 2 ? 'assistant' : 'user',
  content: '收货记录 ' + (index + 1),
})))
const reverse = ref(false)
const data = computed(() => reverse.value ? [...messages.value].reverse() : messages.value)
const autoScroll = ref(!params.has('manual'))
const single = ref(false)
const clearHistory = ref(true)
const showScrollButton = ref(true)
const custom = ref(false)
const acceptClear = ref(true)
const draft = ref('')
const events = ref<string[]>([])
const lastScroll = ref('')
const dark = ref(false)
const compact = ref(false)
const localSize = ref(false)
const square = ref(false)
const color = ref('#f2eddf')
let serial = messages.value.length

function append() {
  const id = ++serial
  messages.value.push({ id: String(id), role: 'assistant', content: '新消息 ' + id })
}

function growReply() {
  const reply = messages.value.at(-1)
  if (reply) reply.content += '\n' + Array(12).fill('新增的回复片段').join('\n')
}

function update(next: readonly ChatMessageData[]) {
  events.value.push('update:' + next.length)
  if (acceptClear.value) messages.value = [...next]
}
</script>

<template>
  <label><input type="checkbox" v-model="autoScroll" />自动跟随</label>
  <label><input type="checkbox" v-model="single" />单列布局</label>
  <label><input type="checkbox" v-model="reverse" />倒序数据</label>
  <label><input type="checkbox" v-model="clearHistory" />显示清空</label>
  <label><input type="checkbox" v-model="showScrollButton" />显示回底按钮</label>
  <label><input type="checkbox" v-model="acceptClear" />接受清空</label>
  <label><input type="checkbox" v-model="custom" />自定义正文</label>
  <button @click="append">追加消息</button>
  <button @click="growReply">追加片段</button>
  <button @click="list?.scrollToBottom()">实例回底</button>
  <button @click="growReply(); list?.scrollToBottom()">追加并回底</button>
  <button @click="messages = []">移除数据</button>
  <label><input type="checkbox" v-model="compact" />紧凑尺寸</label>
  <label><input type="checkbox" v-model="localSize" />局部小号</label>
  <label><input type="checkbox" v-model="dark" />深色模式</label>
  <label><input type="checkbox" v-model="square" />直角</label>
  <label>浅色背景<input type="color" v-model="color" /></label>
  <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { surface: color }, dark: { surface: '#313945' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <YmChatList ref="list" style="height: 340px; max-width: 540px" :data="data" :auto-scroll="autoScroll"
        :clear-history="clearHistory" :show-scroll-button="showScrollButton" :reverse="reverse"
        :default-scroll-to="params.has('top') ? 'top' : 'bottom'" :layout="single ? 'single' : 'both'"
        :size="localSize ? 'small' : undefined" @update:data="update"
        @scroll="({ e }) => lastScroll = e.type" @clear="({ e }) => events.push('clear:' + e.type)">
        <template v-if="custom" #content="{ item, index }"><span>{{ item.id }} 位于 {{ index }}</span></template>
        <template #default><YmChatMessage content="插槽历史" /></template>
        <template #footer><YmChatSender v-model="draft" /></template>
      </YmChatList>
    </ConfigProvider>
  </ConfigProvider>
  <output id="events">{{ events.join(',') }}</output><output id="last-scroll">{{ lastScroll }}</output>
</template>
