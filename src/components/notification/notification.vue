<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { onMounted, ref, watchEffect } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import notificationProps from './props'
import type { NotificationCloseContext } from './types'

defineOptions({ name: 'YmNotification' })
const props = defineProps(notificationProps)
const emit = defineEmits<{
  close: [context: NotificationCloseContext]
  'close-btn-click': [context: { e: MouseEvent }]
  'duration-end': []
}>()
defineSlots<{
  title?: () => unknown
  default?: () => unknown
  content?: () => unknown
  footer?: () => unknown
  icon?: () => unknown
  closeBtn?: () => unknown
}>()

const visible = ref(true)
const hovered = ref(false)
const focused = ref(false)

function close(context: NotificationCloseContext) {
  if (!visible.value) return
  visible.value = false
  if (context.e) emit('close-btn-click', { e: context.e })
  if (context.trigger === 'duration-end') emit('duration-end')
  emit('close', context)
}

onMounted(() => {
  watchEffect(onCleanup => {
    const duration = props.duration
    if (!visible.value || hovered.value || focused.value || !Number.isFinite(duration) || duration <= 0) return
    const timer = setTimeout(() => close({ trigger: 'duration-end' }), duration)
    onCleanup(() => clearTimeout(timer))
  }, { flush: 'sync' })
})

function onFocusOut(event: FocusEvent) {
  focused.value = (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)
}
</script>

<template>
  <div v-if="visible" class="ym-notification ym-theme" :data-size="props.size" :data-notification-theme="props.theme"
    :role="props.theme === 'error' || props.theme === 'warning' ? 'alert' : 'status'" aria-atomic="true"
    @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="focused = true" @focusout="onFocusOut">
    <span v-if="props.icon" class="ym-notification__icon" aria-hidden="true">
      <slot name="icon"><YmIcon :name="props.theme" /></slot>
    </span>
    <div class="ym-notification__body">
      <div v-if="$slots.title || props.title" class="ym-notification__title"><slot name="title">{{ props.title }}</slot></div>
      <div v-if="$slots.default || $slots.content || props.content" class="ym-notification__content">
        <slot><slot name="content">{{ props.content }}</slot></slot>
      </div>
      <div v-if="$slots.footer || props.footer" class="ym-notification__footer"><slot name="footer">{{ props.footer }}</slot></div>
    </div>
    <YmButton v-if="props.closeBtn || $slots.closeBtn" class="ym-notification__close" variant="text"
      :shape="props.closeBtn === true && !$slots.closeBtn ? 'square' : 'rectangle'" :disabled="false"
      :aria-label="props.closeBtn === true && !$slots.closeBtn ? '关闭通知' : undefined"
      @click="close({ trigger: 'close-click', e: $event })">
      <slot name="closeBtn">
        <template v-if="typeof props.closeBtn === 'string'">{{ props.closeBtn }}</template>
        <YmIcon v-else name="close" />
      </slot>
    </YmButton>
  </div>
</template>
