<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmPopup } from '../popup'
import { Color, getColorObject, isValidColor } from './color'
import YmColorPickerPanel from './color-picker-panel.vue'
import pickerProps from './props'
import type { ColorObject, ColorPickerChangeContext } from './types'
import { useColorValue, useRecentColors } from './use-color-picker'

defineOptions({ name: 'YmColorPicker' })
const props = defineProps(pickerProps)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:value': [value: string]
  change: [value: string, context: ColorPickerChangeContext]
  clear: [context: { e: MouseEvent }]
  'update:recentColors': [colors: string[]]
  'recent-colors-change': [colors: string[]]
  'palette-bar-change': [context: { color: ColorObject }]
}>()
defineSlots<{ default?: (scope: { value: string; visible: boolean; panelId: string }) => unknown }>()

const { value, changeValue } = useColorValue(props, (event, next) => {
  if (event === 'update:modelValue') emit('update:modelValue', next)
  else emit('update:value', next)
})
const preview = computed(() => isValidColor(value.value) ? new Color(value.value).css : undefined)
const disabled = computed(() => props.disabled || props.popupProps?.disabled)
const { recent, changeRecent } = useRecentColors(props, colors => {
  emit('update:recentColors', colors)
  emit('recent-colors-change', colors)
})

function change(next: string, context: ColorPickerChangeContext) {
  if (disabled.value) return
  changeValue(next)
  emit('change', next, context)
}

function edit(next: string) {
  if (next !== value.value) change(next, { color: getColorObject(new Color(next)), trigger: 'input' })
}

function clear(e: MouseEvent) {
  e.stopPropagation()
  if (disabled.value || props.inputProps?.disabled || props.inputProps?.readonly) return
  edit('')
  const context = { e }
  emit('clear', context)
  props.inputProps?.onClear?.(context)
}

function openFromKeyboard(e: KeyboardEvent, visible: boolean) {
  if (visible || disabled.value || (props.popupProps?.trigger ?? 'click') !== 'click' || e.isComposing) return
  if (e.key === 'ArrowDown' || e.key === 'Enter') {
    e.preventDefault()
    const input = e.target as HTMLElement
    input.click()
  }
}
</script>

<template>
  <YmPopup class="ym-color-picker" placement="bottom-left" v-bind="props.popupProps"
    :disabled="disabled" :size="props.size ?? props.popupProps?.size"
    :overlay-class-name="['ym-color-picker__popup', props.popupProps?.overlayClassName]">
    <template #default="{ visible, panelId }">
      <slot :value="value" :visible="visible" :panel-id="panelId">
        <span class="ym-color-picker__trigger" :data-borderless="props.borderless || undefined"
          :data-disabled="disabled || props.inputProps?.disabled || undefined">
          <span class="ym-color-picker__sample" :data-alpha="props.enableAlpha || undefined" aria-hidden="true">
            <span :style="{ background: preview }" />
          </span>
          <YmInput aria-label="颜色值" v-bind="props.inputProps" :model-value="value" type="text"
            :disabled="disabled || props.inputProps?.disabled" :aria-expanded="visible" aria-haspopup="dialog"
            :aria-controls="visible ? panelId : undefined" @keydown="openFromKeyboard($event, visible)" @update:model-value="edit" />
          <YmButton v-if="props.clearable && value && !disabled && !props.inputProps?.disabled && !props.inputProps?.readonly"
            class="ym-color-picker__clear" aria-label="清空颜色" type="button" theme="default" variant="text" shape="square"
            @click="clear">
            <YmIcon name="close" />
          </YmButton>
        </span>
      </slot>
    </template>
    <template #content>
      <YmColorPickerPanel role="dialog" aria-label="选择颜色" :model-value="value" :recent-colors="recent"
        :color-modes="props.colorModes" :disabled="disabled" :enable-alpha="props.enableAlpha"
        :enable-multiple-gradient="props.enableMultipleGradient" :format="props.format" :input-props="props.inputProps"
        :select-input-props="props.selectInputProps" :show-primary-color-preview="props.showPrimaryColorPreview"
        :swatch-colors="props.swatchColors" @change="change" @recent-colors-change="changeRecent"
        @palette-bar-change="emit('palette-bar-change', $event)" />
    </template>
  </YmPopup>
</template>
