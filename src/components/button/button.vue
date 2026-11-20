<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmLoading } from '../loading'
import buttonProps from './props'

defineOptions({ name: 'YmButton', inheritAttrs: false })
const props = defineProps(buttonProps)
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{
  default?: () => unknown
  icon?: () => unknown
  suffix?: () => unknown
}>()

const element = computed(() => props.tag ?? (props.href ? 'a' : 'button'))
const buttonRole = computed(() => element.value === 'div' || (element.value === 'a' && !props.href))
const intent = computed(() => props.theme ?? (props.variant === 'base' ? 'primary' : 'default'))

function blockActivation(event: MouseEvent) {
  if (!props.disabled && !props.loading) return false
  event.preventDefault()
  event.stopPropagation()
  return true
}

function handleClick(event: MouseEvent) {
  if (!blockActivation(event)) emit('click', event)
}

function handleKey(event: KeyboardEvent) {
  if (!buttonRole.value || event.target !== event.currentTarget || event.defaultPrevented) return
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  if (props.disabled || props.loading || event.repeat) return
  const activate = event.key === 'Enter' ? event.type === 'keydown' : event.type === 'keyup'
  if (activate) (event.currentTarget as HTMLElement).click()
}
</script>

<template>
  <component
    :is="element"
    v-bind="$attrs"
    class="ym-button"
    :class="{ 'ym-button--block': props.block, 'ym-button--ghost': props.ghost }"
    :data-theme="intent"
    :data-variant="props.variant"
    :data-shape="props.shape"
    :data-size="props.size"
    :type="props.type"
    :form="props.form"
    :href="props.href || undefined"
    :disabled="element === 'button' ? props.disabled : undefined"
    :aria-disabled="props.loading || (props.disabled && element !== 'button') || $attrs['aria-disabled']"
    :aria-busy="props.loading || $attrs['aria-busy']"
    :role="$attrs.role ?? (buttonRole ? 'button' : undefined)"
    :tabindex="props.disabled ? (element === 'button' ? undefined : -1) : ($attrs.tabindex ?? 0)"
    @click="handleClick"
    @auxclick="blockActivation"
    @keydown="handleKey"
    @keyup="handleKey"
  >
    <YmLoading v-if="props.loading" v-bind="props.loadingProps" />
    <span v-else-if="props.icon || $slots.icon" class="ym-button__icon">
      <template v-if="props.icon">{{ props.icon }}</template>
      <slot v-else name="icon" />
    </span>
    <span class="ym-button__text"><slot>{{ props.content }}</slot></span>
    <span v-if="props.suffix || $slots.suffix" class="ym-button__suffix">
      <template v-if="props.suffix">{{ props.suffix }}</template>
      <slot v-else name="suffix" />
    </span>
  </component>
</template>
