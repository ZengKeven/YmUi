<script setup lang="ts" vapor>
import { onScopeDispose, reactive, ref, shallowRef } from 'vue'
import { YmChatList, YmChatSender, YmSwitch, type ChatMessageData, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const messages = ref<ChatMessageData[]>([
  { id: 'schedule-1', role: 'user', name: '采购员', content: '今天的到货安排在哪里查看？' },
  { id: 'schedule-2', role: 'assistant', name: '排期助手', content: '打开收货排期，选择今天的日期，即可看到各库区的预约。' },
  { id: 'schedule-3', role: 'user', name: '采购员', content: '送货时要带哪些材料？' },
  { id: 'schedule-4', role: 'assistant', name: '排期助手', content: '请准备送货单和采购单号，以便收货员核对。' },
  { id: 'schedule-5', role: 'user', name: '采购员', content: '司机到场后向谁登记？' },
  { id: 'schedule-6', role: 'assistant', name: '排期助手', content: '先到北门值班室登记车牌，再按指引前往对应卸货区。' },
])
const draft = ref('')
const autoScroll = ref(true)
const showScrollButton = ref(true)
const clearHistory = ref(true)
const layout = ref<'both' | 'single'>('both')
const size = ref<ControlSize>()
const activeReply = shallowRef<ChatMessageData>()
const replyParts = ['已核对今日的到货安排。', '北门库区将在下午两点开始收货。', '请按预约时段到场，', '并准备送货单和采购单号。']
let nextTurn = 1
let timer: ReturnType<typeof setInterval> | undefined

function finishReply(status: 'complete' | 'stop') {
  clearInterval(timer)
  if (activeReply.value) activeReply.value.status = status
  activeReply.value = undefined
}

function send(text: string) {
  if (activeReply.value) return
  const turn = nextTurn++
  const reply = reactive<ChatMessageData>({
    id: 'reply-' + turn, role: 'assistant', name: '排期助手', status: 'pending', content: '',
  })
  messages.value.push({ id: 'question-' + turn, role: 'user', name: '采购员', content: text }, reply)
  draft.value = ''
  activeReply.value = reply

  let received = ''
  let index = 0
  timer = setInterval(() => {
    received += replyParts[index++]
    reply.content = received
    reply.status = 'streaming'
    if (index === replyParts.length) finishReply('complete')
  }, 450)
}

onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <PreviewFrame name="YmChatList">
    <template #preview>
      <YmChatList class="list-demo" v-model:data="messages" :size="size" :layout="layout" :auto-scroll="autoScroll"
        :show-scroll-button="showScrollButton" :clear-history="clearHistory" @clear="finishReply('stop')">
        <template #footer>
          <YmChatSender v-model="draft" :loading="!!activeReply" placeholder="询问今日到货安排"
            @send="send" @stop="finishReply('stop')">
            <template v-if="messages.at(-1)?.status === 'stop'" #footer-prefix><small>已停止回复</small></template>
          </YmChatSender>
        </template>
      </YmChatList>
    </template>
    <template #controls>
      <label>自动滚动 <YmSwitch v-model="autoScroll" /></label>
      <label>回底按钮 <YmSwitch v-model="showScrollButton" /></label>
      <label>清空入口 <YmSwitch v-model="clearHistory" /></label>
      <label>消息布局
        <select v-model="layout"><option value="both">双侧</option><option value="single">单侧</option></select>
      </label>
      <label>列表尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.list-demo { width: 100%; min-width: 0; height: 25rem; }
</style>
