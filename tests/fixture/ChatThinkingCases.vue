<script setup lang="ts" vapor>
import { reactive, ref } from 'vue'
import {
  ConfigProvider, YmChatActionbar, YmChatMessage, YmChatThinking,
  type ChatMessageContent, type ChatMessageData, type ChatMessageStatus, type ChatThinkingContent,
} from 'ym-ui-vapor'

const complete = ref(false)
const note = ref('正在读取单据。')
const accepted = ref(true)
const requests = ref<boolean[]>([])
const changes = ref<boolean[]>([])
const thinking = reactive<ChatThinkingContent>({ type: 'thinking', data: { text: '' } })
const messageStatus = ref<ChatMessageStatus>('pending')
const blocks = ref<ChatMessageContent[]>([thinking])
const showNext = ref(false)
const nextMessage: ChatMessageData = {
  id: 'next', content: [{ type: 'thinking', data: { text: '已读取下一张单据。' } }],
}
function finishThinking() {
  thinking.data.text = '已核对送货单。'
  thinking.status = 'complete'
  blocks.value.push({ type: 'text', data: '已就绪' }, { type: 'markdown', data: '## 收货清单' })
}

const small = ref(false)
const square = ref(false)
const dark = ref(false)
const ink = ref('#403429')
const example = { text: '配置随面板更新' }
</script>

<template>
  <section id="basic">
    <YmChatThinking :content="{ text: note }" :status="complete ? 'complete' : 'pending'" @collapsed-change="changes.push($event)" />
  </section>
  <output id="changes">{{ JSON.stringify(changes) }}</output>
  <label>过程文字<textarea v-model="note" /></label>
  <label><input v-model="complete" type="checkbox" />完成思考</label>

  <section id="controlled">
    <YmChatThinking :content="{ title: '核对进度', text: '已核对仓库编号。' }"
      :collapsed="accepted" @update:collapsed="requests.push($event)" />
  </section>
  <output id="requests">{{ JSON.stringify(requests) }}</output>
  <button @click="accepted = requests[requests.length - 1]">应用折叠请求</button>
  <section id="slots">
    <YmChatThinking default-collapsed :content="{ text: '属性正文' }">
      <template #default>默认插槽</template>
      <template #content><strong>具名插槽</strong></template>
    </YmChatThinking>
    <YmChatThinking :content="{ text: '属性正文' }">默认正文</YmChatThinking>
  </section>

  <section id="message">
    <label>消息状态
      <select v-model="messageStatus">
        <option value="pending">等待</option>
        <option value="streaming">接收中</option>
        <option value="complete">已完成</option>
      </select>
    </label>
    <label><input v-model="showNext" type="checkbox" />显示下一条消息</label>
    <YmChatMessage :message="showNext ? nextMessage : { id: 'first', status: messageStatus, content: blocks }">
      <template #actionbar="{ copyText }">
        <YmChatActionbar :content="copyText" :action-bar="['copy']" />
      </template>
    </YmChatMessage>
    <button @click="finishThinking">追加最终回复</button>
  </section>

  <label>正文颜色<input v-model="ink" type="color" /></label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="small" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="square" type="checkbox" />直角面板</label>
  <ConfigProvider :size="small ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'" :radius="18"
    :theme="{ light: { text: ink }, dark: { text: '#f5f0da' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatThinking :content="example" /></section>
      <section id="local"><YmChatThinking :content="example" size="small" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
