<script setup lang="ts" vapor>
import { computed, ref, useId } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import thinkingProps from './props'

defineOptions({ name: 'YmChatThinking' })
const props = defineProps(thinkingProps)
const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
  'collapsed-change': [collapsed: boolean]
}>()
defineSlots<{ content?: () => unknown; default?: () => unknown }>()

const panelId = `ym-chat-thinking-${useId()}`
const localCollapsed = ref(props.defaultCollapsed)
const collapsed = computed(() => props.collapsed ?? localCollapsed.value)
const complete = computed(() => props.status === 'complete')
const statusText = computed(() => complete.value ? '思考完成' : '思考中')

function toggle() {
  const next = !collapsed.value
  if (props.collapsed === undefined) localCollapsed.value = next
  emit('update:collapsed', next)
  emit('collapsed-change', next)
}
</script>

<template>
  <div class="ym-chat-thinking ym-theme" :data-size="props.size" :data-status="props.status">
    <YmButton class="ym-chat-thinking__toggle" variant="text" :aria-expanded="!collapsed" :aria-controls="panelId"
      :aria-description="props.content?.title ? statusText : undefined" @click="toggle">
      <template #icon><YmIcon class="ym-chat-thinking__indicator" :name="complete ? 'success' : 'loading'" /></template>
      <span aria-live="polite">{{ props.content?.title || statusText }}</span>
      <template #suffix><YmIcon :name="collapsed ? 'chevron-right' : 'chevron-down'" /></template>
    </YmButton>
    <div :id="panelId" class="ym-chat-thinking__content" :hidden="collapsed">
      <slot name="content"><slot>{{ props.content?.text }}</slot></slot>
    </div>
  </div>
</template>
