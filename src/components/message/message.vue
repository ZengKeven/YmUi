<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, onMounted, ref, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmLoading } from '../loading'
import messageProps from './props'
import type { MessageCloseContext } from './types'

defineOptions({ name: 'YmMessage' })
const props = defineProps(messageProps)
const emit = defineEmits<{
  close: [context: MessageCloseContext]
  'close-btn-click': [context: { e: MouseEvent }]
  'duration-end': []
}>()
defineSlots<{
  default?: () => unknown
  icon?: () => unknown
  closeBtn?: () => unknown
}>()

const visible = ref(true)
const mounted = ref(false)
const hovered = ref(false)
const focused = ref(false)
const iconName = computed(() => props.theme === 'question' ? 'help' : props.theme)

function close(context: MessageCloseContext) {
  if (!visible.value) return
  visible.value = false
  if (context.e) emit('close-btn-click', { e: context.e })
  if (context.trigger === 'duration-end') emit('duration-end')
  emit('close', context)
}

onMounted(() => { mounted.value = true })
watch([mounted, visible, hovered, focused, () => props.duration], ([ready, open, hover, focus, duration], _, onCleanup) => {
  if (!ready || !open || hover || focus || !Number.isFinite(duration) || duration <= 0) return
  const timer = setTimeout(() => close({ trigger: 'duration-end' }), duration)
  onCleanup(() => clearTimeout(timer))
}, { flush: 'sync' })

function focusOut(event: FocusEvent) {
  focused.value = (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)
}
</script>

<template>
  <div v-if="visible" class="ym-message ym-theme" :data-size="props.size" :data-message-theme="props.theme"
    :role="props.theme === 'error' || props.theme === 'warning' ? 'alert' : 'status'" aria-atomic="true"
    @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="focused = true" @focusout="focusOut">
    <span v-if="props.icon" class="ym-message__icon" aria-hidden="true">
      <slot name="icon">
        <YmLoading v-if="props.theme === 'loading'" inherit-color />
        <YmIcon v-else :name="iconName" />
      </slot>
    </span>
    <span class="ym-message__content"><slot>{{ props.content }}</slot></span>
    <YmButton v-if="props.closeBtn || $slots.closeBtn" class="ym-message__close" variant="text"
      :shape="props.closeBtn === true && !$slots.closeBtn ? 'square' : 'rectangle'" :disabled="false"
      :aria-label="props.closeBtn === true && !$slots.closeBtn ? '关闭提示' : undefined"
      @click="close({ trigger: 'close-click', e: $event })">
      <slot name="closeBtn">
        <template v-if="typeof props.closeBtn === 'string'">{{ props.closeBtn }}</template>
        <YmIcon v-else name="close" />
      </slot>
    </YmButton>
  </div>
</template>
