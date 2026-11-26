<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmChatMessage, YmSwitch, YmTextarea, type ChatMessageProps } from '../../src'
import calendarAvatar from './assets/delivery-calendar.png'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const content = ref('预计周五到货，签收后会同步入库数量。')
const name = ref('排期助手')
const datetime = ref('今天 09:30')
const role = ref<ChatMessageProps['role']>('assistant')
const status = ref<ChatMessageProps['status']>('complete')
const placement = ref<ChatMessageProps['placement']>('left')
const variant = ref<ChatMessageProps['variant']>('base')
const size = ref<ChatMessageProps['size']>()
const showAvatar = ref(true)
const avatar = computed(() => showAvatar.value ? calendarAvatar : undefined)
</script>

<template>
  <PreviewFrame name="YmChatMessage">
    <template #preview>
      <div class="message-preview">
        <YmChatMessage :role="role" :status="status" :content="content" :name="name" :datetime="datetime"
          :avatar="avatar" :placement="placement" :variant="variant" :size="size" />
      </div>
    </template>
    <template #controls>
      <label>消息正文 <YmTextarea v-model="content" class="message-text" :rows="3" /></label>
      <label>昵称 <input v-model="name" type="text" /></label>
      <label>时间 <input v-model="datetime" type="text" /></label>
      <label>消息角色
        <select v-model="role">
          <option value="assistant">助手</option><option value="user">用户</option><option value="system">系统</option>
        </select>
      </label>
      <label>消息状态
        <select v-model="status">
          <option value="complete">已完成</option><option value="pending">等待回复</option>
          <option value="streaming">接收中</option><option value="stop">已停止</option><option value="error">出错</option>
        </select>
      </label>
      <label>气泡样式
        <select v-model="variant">
          <option value="base">填充</option><option value="outline">描边</option><option value="text">纯文本</option>
        </select>
      </label>
      <label>消息位置
        <select v-model="placement"><option value="left">居左</option><option value="right">居右</option></select>
      </label>
      <label>消息尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示头像 <YmSwitch v-model="showAvatar" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.message-preview { width: 100%; min-width: 0; }
.message-text { width: 6.4rem; }
</style>
