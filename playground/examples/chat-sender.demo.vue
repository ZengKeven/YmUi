<script setup lang="ts" vapor>
import { onScopeDispose, ref } from 'vue'
import { YmButton, YmChatSender, YmSwitch, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const draft = ref('')
const size = ref<ControlSize>()
const disabled = ref(false)
const sendBtnDisabled = ref(false)
const customActions = ref(false)
const loading = ref(false)
const lastMessage = ref('')
const replyStatus = ref('')
let replyTimer: ReturnType<typeof setTimeout>

function sendMessage(text: string) {
  lastMessage.value = text
  draft.value = ''
  loading.value = true
  replyStatus.value = '正在模拟回复…'
  replyTimer = setTimeout(() => {
    loading.value = false
    replyStatus.value = '模拟回复已完成'
  }, 5000)
}

function stopReply() {
  clearTimeout(replyTimer)
  loading.value = false
  replyStatus.value = '已停止回复'
}

onScopeDispose(() => clearTimeout(replyTimer))
</script>

<template>
  <PreviewFrame name="YmChatSender">
    <template #preview>
      <div class="sender-demo">
        <YmChatSender v-model="draft" placeholder="输入消息" :loading="loading" :size="size"
          :disabled="disabled" :send-btn-disabled="sendBtnDisabled" @send="sendMessage" @stop="stopReply">
          <template #footer-prefix><small>Enter 发送 · Shift+Enter 换行</small></template>
          <template v-if="customActions" #suffix="{ send, stop, disabled: actionDisabled, loading: showStop }">
            <YmButton v-if="showStop" :disabled="actionDisabled" @click="stop">停止回复</YmButton>
            <YmButton v-else :disabled="actionDisabled" @click="send">发送消息</YmButton>
          </template>
        </YmChatSender>
        <div v-if="lastMessage" class="sender-result">
          <p>最近发送的消息</p>
          <p class="sender-message">{{ lastMessage }}</p>
        </div>
        <output aria-live="polite">{{ replyStatus }}</output>
      </div>
    </template>
    <template #controls>
      <label>发送框尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>禁用发送 <YmSwitch v-model="sendBtnDisabled" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
      <label>自定义操作按钮 <YmSwitch v-model="customActions" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.sender-demo { width: 100%; min-width: 0; }
.sender-demo small, .sender-demo output, .sender-result p:first-child { color: var(--demo-muted); font-size: .8rem; }
.sender-result { margin-top: 1rem; }
.sender-result p { margin: .25rem 0; }
.sender-message { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
