<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmChatbot, type ChatServiceConfig, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const size = ref<ControlSize>()
const endpoints = {
  normal: '/api/chat/sse',
  search: '/api/chat/sse?search=1',
  attachment: '/api/chat/sse?attachment=1',
  error: '/api/chat/sse?error=1',
}
const placeholders: Partial<Record<keyof typeof endpoints, string>> = {
  search: '如何在消息中展示搜索来源？',
  attachment: '请发我配送日历和收货清单',
}
const mode = ref<keyof typeof endpoints>('normal')
const chatServiceConfig = computed<ChatServiceConfig>(() => ({
  endpoint: endpoints[mode.value],
}))
</script>

<template>
  <PreviewFrame name="YmChatbot">
    <template #preview>
      <YmChatbot class="chatbot-demo" :chat-service-config="chatServiceConfig" :size="size"
        :placeholder="placeholders[mode] ?? '询问收货安排，或选择附件'" />
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
          <option value="normal">思考、回复与推荐问题</option>
          <option value="search">搜索来源与回复</option>
          <option value="attachment">附件与回复</option>
          <option value="error">流中出错</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.chatbot-demo { width: 100%; min-width: 0; }
</style>
