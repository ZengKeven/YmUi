<script setup lang="ts" vapor>
import { onScopeDispose, ref } from 'vue'
import { Notification, YmButton, YmNotification, YmSwitch, type ControlSize, type NotificationHandle,
  type NotificationPlacement, type NotificationTheme } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const title = ref('收货预约已确认')
const content = ref('杭州一号仓已确认预约，请在 14:00 前送达。')
const footer = ref('采购单 PO-1024')
const theme = ref<NotificationTheme>('info')
const size = ref<ControlSize>()
const duration = ref(0)
const placement = ref<NotificationPlacement>('top-right')
const icon = ref(true)
const closeBtn = ref(true)
const previewKey = ref(0)
const notifications = new Set<NotificationHandle>()
const themes = [['info', '信息'], ['success', '成功'], ['warning', '警告'], ['error', '错误']] as const
const placements = [['top-right', '右上'], ['top-left', '左上'], ['bottom-right', '右下'], ['bottom-left', '左下']] as const

function showNotification(event: MouseEvent) {
  const handle = Notification[theme.value]({
    title: title.value, content: content.value, footer: footer.value, icon: icon.value, closeBtn: closeBtn.value,
    size: size.value, placement: placement.value, duration: duration.value, source: event.currentTarget as HTMLElement,
    onClose: () => notifications.delete(handle),
  })
  notifications.add(handle)
}

function closeNotifications() {
  for (const handle of notifications) handle.close()
}

onScopeDispose(closeNotifications)
</script>

<template>
  <PreviewFrame name="YmNotification">
    <template #preview>
      <div :key="previewKey" style="max-width: 100%">
        <YmNotification :title="title" :content="content" :footer="footer" :theme="theme"
          :size="size" :icon="icon" :close-btn="closeBtn" :duration="duration" />
      </div>
    </template>
    <template #controls>
      <label>通知标题 <input v-model="title" type="text" /></label>
      <label>通知正文 <input v-model="content" type="text" /></label>
      <label>底部文字 <input v-model="footer" type="text" /></label>
      <label>通知类型
        <select v-model="theme"><option v-for="[value, label] in themes" :key="value" :value="value">{{ label }}</option></select>
      </label>
      <label>通知尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>弹出位置
        <select v-model="placement"><option v-for="[value, label] in placements" :key="value" :value="value">{{ label }}</option></select>
      </label>
      <label>显示时长
        <select v-model="duration"><option :value="0">常驻</option><option :value="3000">3 秒</option><option :value="5000">5 秒</option></select>
      </label>
      <label>状态图标 <YmSwitch v-model="icon" /></label>
      <label>关闭按钮 <YmSwitch v-model="closeBtn" /></label>
      <YmButton size="small" variant="outline" @click="showNotification">弹出通知</YmButton>
      <YmButton size="small" variant="text" @click="closeNotifications">关闭已弹出的通知</YmButton>
      <YmButton size="small" variant="text" @click="previewKey++">重新显示卡片</YmButton>
    </template>
  </PreviewFrame>
</template>
