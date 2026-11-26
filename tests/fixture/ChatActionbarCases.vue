<script setup lang="ts" vapor>
import { reactive, ref } from 'vue'
import {
  ConfigProvider, YmChatActionbar, YmChatMessage,
  type ChatActionbarAction, type ChatActionbarComment, type ChatMessageData,
} from 'ym-ui-vapor'

const source = ref('可复制的初稿')
const disabled = ref(false)
const actions = ref<ChatActionbarAction[]>([])
const comments = ref<ChatActionbarComment[]>([])
const clicked = ref(false)
function record(action: ChatActionbarAction, { e }: { e: MouseEvent }) {
  actions.value.push(action)
  clicked.value = e instanceof MouseEvent
}

const accepted = ref<ChatActionbarComment>('bad')
const requested = ref<ChatActionbarComment>('bad')
const message = reactive<ChatMessageData>({
  id: 'arrival-42', status: 'complete',
  content: [{ type: 'text', data: '订单 42' }, { type: 'markdown', data: '## 到货\n\n- 北库' }],
})
const override = ref(false)
const small = ref(false)
const square = ref(false)
const dark = ref(false)
const ink = ref('#403429')
</script>

<template>
  <section id="default">
    <label>复制正文<textarea v-model="source" /></label>
    <label><input v-model="disabled" type="checkbox" />禁用操作</label>
    <YmChatActionbar :content="source" :disabled="disabled" @actions="record" @update:comment="comments.push($event)" />
    <p id="actions">{{ actions.join(',') }}</p>
    <p id="comments">{{ JSON.stringify(comments) }}</p>
    <p id="native-click">{{ clicked }}</p>
  </section>

  <section id="controlled">
    <YmChatActionbar :action-bar="['bad', 'good']" :comment="accepted" @update:comment="requested = $event" />
    <p id="requested">{{ requested }}</p>
    <button @click="accepted = requested">应用评价</button>
  </section>

  <section id="slotted">
    <label><input v-model="override" type="checkbox" />使用临时正文</label>
    <YmChatMessage :message="message" :content="override ? '临时正文' : undefined" :status="override ? 'pending' : undefined">
      <template #actionbar="{ copyText, status }">
        <YmChatActionbar :content="copyText" :disabled="status === 'pending'" />
        <p id="slot-values">{{ JSON.stringify([copyText, status]) }}</p>
      </template>
    </YmChatMessage>
  </section>

  <label>按钮文字颜色<input v-model="ink" type="color" /></label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="small" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="square" type="checkbox" />直角按钮</label>
  <ConfigProvider :size="small ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'" :radius="18"
    :theme="{ light: { text: ink }, dark: { text: '#f5f0da' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatActionbar content="继承配置" /></section>
      <section id="local"><YmChatActionbar size="small" content="局部小尺寸" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
