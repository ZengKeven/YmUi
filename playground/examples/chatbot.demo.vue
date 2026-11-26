<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmChatbot, type ChatServiceConfig, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()
const mode = ref('normal')
const chatServiceConfig = computed<ChatServiceConfig>(() => ({
  endpoint: mode.value === 'error' ? '/api/chat/sse?error=1' : '/api/chat/sse',
}))
</script>

<template>
  <PreviewFrame name="YmChatbot">
    <template #preview>
      <YmChatbot class="chatbot-demo" :chat-service-config="chatServiceConfig" :size="size" placeholder="询问收货安排，或选择附件" />
    </template>
    <template #controls>
      <label>对话尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>模拟服务
        <select v-model="mode">
          <option value="normal">正常回复</option>
          <option value="error">流中出错</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.chatbot-demo { width: 100%; min-width: 0; }
</style>
