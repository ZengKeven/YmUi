<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatbot, type ChatbotRequestContext, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()

function simulateReply({ prompt, attachments, trigger, signal, onChunk }: ChatbotRequestContext) {
  const chunks = [
    trigger === 'regenerate' ? '已重新核对这条消息。' : '已收到你的消息。',
    attachments.length
      ? '\n\n随消息收到的附件有' + attachments.map(file => file.name).join('、') + '。'
      : '\n\n你询问的是「' + prompt + '」。',
    '\n\n请在北门登记后前往收货区。',
  ]

  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted()
    let index = 0
    const timer = window.setInterval(() => {
      onChunk(chunks[index++])
      if (index === chunks.length) {
        window.clearInterval(timer)
        signal.removeEventListener('abort', cancel)
        resolve()
      }
    }, 400)
    function cancel() {
      window.clearInterval(timer)
      reject(signal.reason)
    }
    signal.addEventListener('abort', cancel, { once: true })
  })
}
</script>

<template>
  <PreviewFrame name="YmChatbot">
    <template #preview>
      <YmChatbot class="chatbot-demo" :request="simulateReply" :size="size" placeholder="询问收货安排，或选择附件" />
    </template>
    <template #controls>
      <label>对话尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.chatbot-demo { width: 100%; min-width: 0; }
</style>
