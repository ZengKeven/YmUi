<script setup lang="ts" vapor>
import { ref, shallowRef, useTemplateRef } from 'vue'
import {
  ConfigProvider, YmChatbot, type ChatbotInstance, type ChatbotRequestContext, type ChatMessageData,
} from 'ym-ui-vapor'

const seeded = new URLSearchParams(location.search).has('history')
const initial: ChatMessageData[] = seeded ? [
  { id: 'greeting', role: 'assistant', content: '欢迎回来' },
  { id: 'past-user', role: 'user', content: [
    { type: 'text', data: '上次的清单' },
    { type: 'attachment', data: [{ name: '原始清单.txt' }] },
  ] },
  { id: 'past-reply', role: 'assistant', content: '已存档' },
] : []
const bot = useTemplateRef<ChatbotInstance>('bot')
const mounted = ref(true)
const completedSends = ref(0)
async function sendFromInstance() {
  await bot.value?.sendUserMessage({ prompt: '实例问题' })
  completedSends.value++
}
const compact = ref(false)
const small = ref(false)
const dark = ref(false)
const square = ref(false)
const surface = ref('#f2eddf')
const changes = ref<string[][]>([])
function record(messages: ChatMessageData[]) {
  changes.value.push(messages.map(message => message.status ?? 'complete'))
}

interface RequestRun {
  context: ChatbotRequestContext
  complete: () => void
  fail: () => void
}
function summarize({ prompt, attachments, messages, trigger }: ChatbotRequestContext) {
  return JSON.stringify({
    prompt, trigger, files: attachments.map(file => [file.name, file.raw instanceof File]),
    history: messages.map(message => [message.role, message.id]),
  })
}
const runs = shallowRef<RequestRun[]>([])
const aborted = ref<number[]>([])
function request(context: ChatbotRequestContext) {
  if (context.prompt === '同步完成') {
    context.onChunk('**即时回复**')
    return
  }
  if (context.prompt === '同步异常') throw new Error('请求未能启动')
  const number = runs.value.length + 1
  context.signal.addEventListener('abort', () => aborted.value.push(number), { once: true })
  // 即使被取消，测试仍可手动传出分片、完成或异常，验证迟到的回调如何处理。
  return new Promise<void>((complete, reject) => {
    runs.value = [...runs.value, { context, complete, fail: () => reject(new Error('模拟断流')) }]
  })
}
</script>

<template>
  <label><input v-model="mounted" type="checkbox" />挂载会话</label>
  <label><input v-model="compact" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="small" type="checkbox" />局部小号</label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="square" type="checkbox" />直角</label>
  <label>浅色背景<input v-model="surface" type="color" /></label>
  <button @click="sendFromInstance">实例发送</button>
  <output id="completed-sends">{{ completedSends }}</output>
  <button @click="bot?.regenerate()">实例重试</button>
  <button @click="bot?.abortChat()">实例停止</button>
  <button @click="bot?.clearMessages()">实例清空</button>
  <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { surface }, dark: { surface: '#313945' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <YmChatbot v-if="mounted" ref="bot" :default-messages="initial" :request="request" :size="small ? 'small' : undefined"
        @message-change="record" />
    </ConfigProvider>
  </ConfigProvider>
  <div v-for="(run, i) in runs" :key="i" :id="'run-' + (i + 1)">
    <output class="request">{{ summarize(run.context) }}</output>
    <button @click="run.context.onChunk('首段' + (i + 1))">首段</button>
    <button @click="run.context.onChunk('，末段' + (i + 1))">末段</button>
    <button @click="run.complete()">结束请求</button>
    <button @click="run.fail()">请求出错</button>
  </div>
  <output id="aborted">{{ aborted.join(',') }}</output>
  <output id="changes">{{ JSON.stringify(changes) }}</output>
</template>
