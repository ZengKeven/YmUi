<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmRadioGroup } from '../radio'
import { YmSelect, type SelectOption, type SelectValue } from '../select'
import ChannelInput from './channel-input.vue'
import ColorPalette from './color-palette.vue'
import { Color, DEFAULT_COLOR, DEFAULT_LINEAR_GRADIENT, DEFAULT_SYSTEM_SWATCH_COLORS, getColorFormatInputs,
  getColorFormatMap, getColorFormatOptions, getColorObject, initColorFormat } from './color'
import { panelProps } from './props'
import type { ColorFormat, ColorMode, ColorObject, ColorPickerChangeContext, ColorPickerChangeTrigger } from './types'
import { useColorValue, useRecentColors } from './use-color-picker'

defineOptions({ name: 'YmColorPickerPanel' })
const props = defineProps(panelProps)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:value': [value: string]
  change: [value: string, context: ColorPickerChangeContext]
  'palette-bar-change': [context: { color: ColorObject }]
  'update:recentColors': [colors: string[]]
  'recent-colors-change': [colors: string[]]
}>()

const modes = computed<readonly ColorMode[]>(() => props.colorModes?.length ? props.colorModes : ['monochrome', 'linear-gradient'])
const modeOptions = computed(() => modes.value.map(value => ({ value, label: value === 'monochrome' ? '单色' : '渐变色' })))
const color = reactive(new Color(DEFAULT_COLOR)) as Color
const mode = computed(() => color.isGradient ? 'linear-gradient' : 'monochrome')
const { external, value, changeValue } = useColorValue(props, (event, next) => {
  if (event === 'update:modelValue') emit('update:modelValue', next)
  else emit('update:value', next)
})

// 比较格式化结果，避免父级回写时重建正在拖动的色标或丢失灰色的色相。
function applyValue(input: string) {
  const valid = Color.isValid(input)
  const gradient = valid && Color.isGradientColor(input)
  const wantsGradient = modes.value.length === 1 ? modes.value[0] === 'linear-gradient' : gradient
  if (wantsGradient === color.isGradient && input === color.getFormattedColor(props.format, props.enableAlpha)) return
  if (wantsGradient) {
    color.update(gradient ? input : DEFAULT_LINEAR_GRADIENT)
  } else {
    color.isGradient = false
    color.update(gradient ? new Color(input).rgba : valid ? input : DEFAULT_COLOR)
  }
}
watch([external, modes], () => applyValue(value.value), { immediate: true, deep: true })

function publish(trigger: ColorPickerChangeTrigger) {
  const value = color.getFormattedColor(props.format, props.enableAlpha)
  changeValue(value)
  emit('change', value, { color: getColorObject(color), trigger })
  if (external.value !== undefined) nextTick(() => {
    if (external.value !== undefined && external.value !== value) applyValue(external.value)
  })
}

function changeMode(next: string | number | boolean) {
  if (props.disabled || mode.value === next) return
  if (next === 'linear-gradient') color.update(color.gradientColors.length ? color.linearGradient : DEFAULT_LINEAR_GRADIENT)
  else {
    color.isGradient = false
    color.update(color.rgba)
  }
  publish('palette-saturation-brightness')
}

function setSaturation(saturation: number, brightness: number) {
  const changeS = color.saturation !== saturation
  const changeV = color.value !== brightness
  if (!changeS && !changeV) return
  if (changeS) color.saturation = saturation
  if (changeV) color.value = brightness
  publish(changeS && changeV ? 'palette-saturation-brightness' : changeS ? 'palette-saturation' : 'palette-brightness')
}
function setHue(hue: number) {
  color.hue = hue
  publish('palette-hue-bar')
  emit('palette-bar-change', { color: getColorObject(color) })
}
function setAlpha(alpha: number) {
  color.alpha = alpha
  publish('palette-alpha-bar')
}
function setDegree(degree: number) {
  color.gradientDegree = degree
  publish('input')
}
function selectStop(id: string) {
  color.gradientSelectedId = id
  publish('palette-saturation-brightness')
}
function setStops(points: Color['gradientColors'], id: string) {
  color.gradientColors = points
  selectStop(id)
}

const editFormat = ref<ColorFormat>('RGB')
const formats = computed<SelectOption[]>(() => getColorFormatOptions(props.enableAlpha).map(value => ({ value, label: value })))
watch([() => props.format, () => props.enableAlpha], () => {
  editFormat.value = initColorFormat(props.format, props.enableAlpha)
}, { immediate: true })
const channels = computed(() => getColorFormatInputs(editFormat.value, props.enableAlpha))
const channelValues = computed<Record<string, number | string>>(() => ({
  ...getColorFormatMap(color, 'encode')[editFormat.value], a: Math.round(color.alpha * 100),
}))
function changeFormat(value: SelectValue) {
  const format = getColorFormatOptions(props.enableAlpha).find(option => option === value)
  if (format) editFormat.value = format
}
function editChannel(key: string, value: string | number) {
  if (props.disabled) return
  if (key === 'a') color.alpha = Number(value) / 100
  else if (typeof value === 'string') {
    if (!Color.isValid(value)) return
    if (Color.isGradientColor(value) && !modes.value.includes('linear-gradient')) return
    color.update(value)
  } else {
    const alpha = color.alpha
    color.update(Color.object2color({ ...channelValues.value, [key]: value, a: alpha }, editFormat.value))
    color.alpha = alpha
  }
  publish('input')
}

const { recent, changeRecent } = useRecentColors(props, colors => {
  emit('update:recentColors', colors)
  emit('recent-colors-change', colors)
})
function visibleSwatches(colors: readonly string[]) {
  return modes.value.length === 1 && modes.value[0] === 'linear-gradient' ? colors.filter(Color.isGradientColor) : colors
}
const recentSwatches = computed(() => visibleSwatches(recent.value || []))
const presets = computed(() => visibleSwatches(props.swatchColors === undefined ? DEFAULT_SYSTEM_SWATCH_COLORS : props.swatchColors ?? []))
const activeRecent = computed(() => recent.value ? recent.value.findIndex(value => Color.compare(value, color.css)) : -1)
function addRecent() {
  if (props.disabled || !recent.value) return
  const next = [color.css, ...recent.value.filter(value => !Color.compare(value, color.css))]
  changeRecent(next.slice(0, 100))
}
function removeRecent() {
  if (props.disabled || !recent.value || activeRecent.value < 0) return
  changeRecent(recent.value.filter((_, index) => index !== activeRecent.value))
}
function chooseSwatch(value: string, trigger: 'recent' | 'preset') {
  if (props.disabled || !Color.isValid(value)) return
  applyValue(value)
  publish(trigger)
}
</script>

<template>
  <div class="ym-color-picker__panel" :data-size="props.size" :aria-disabled="props.disabled || undefined">
    <YmRadioGroup v-if="modeOptions.length > 1" class="ym-color-picker__modes" aria-label="颜色模式"
      :model-value="mode" :options="modeOptions" :disabled="props.disabled" @update:model-value="changeMode" />
    <ColorPalette :color="color" :disabled="props.disabled" :enable-alpha="props.enableAlpha"
      :enable-multiple-gradient="props.enableMultipleGradient" :show-primary-color-preview="props.showPrimaryColorPreview"
      @saturation="setSaturation" @hue="setHue" @alpha="setAlpha" @degree="setDegree" @select-stop="selectStop" @stops="setStops" />
    <div class="ym-color-picker__format">
      <YmSelect v-bind="props.selectInputProps" class="ym-color-picker__format-select" aria-label="颜色格式"
        :model-value="editFormat" :options="formats" :multiple="false" :disabled="props.disabled || props.selectInputProps?.disabled"
        @update:model-value="changeFormat" />
      <ChannelInput v-for="field in channels" :key="field.key" :input-props="props.inputProps" :label="field.key.toUpperCase()"
        :value="channelValues[field.key]" :min="field.min" :max="field.max" :unit="field.key === 'a' ? '%' : undefined"
        :maxlength="editFormat === 'HEX' ? 9 : undefined" :disabled="props.disabled" @commit="editChannel(field.key, $event)" />
    </div>
    <section v-if="recent !== false" class="ym-color-picker__swatches" aria-label="最近使用">
      <div class="ym-color-picker__swatch-heading">
        <span>最近使用颜色</span>
        <YmButton shape="square" variant="text" theme="default" aria-label="添加最近使用颜色" title="添加最近使用颜色"
          :disabled="props.disabled" @click="addRecent"><YmIcon name="add" /></YmButton>
        <YmButton v-if="recentSwatches.length" shape="square" variant="text" theme="default" aria-label="删除最近使用颜色"
          title="删除最近使用颜色" :disabled="props.disabled || activeRecent < 0" @click="removeRecent"><YmIcon name="delete" /></YmButton>
      </div>
      <div class="ym-color-picker__swatch-list">
        <button v-for="(swatch, i) in recentSwatches" :key="i" type="button" class="ym-color-picker__swatch ym-color-picker__checker"
          :aria-label="swatch" :title="swatch" :aria-pressed="Color.compare(swatch, color.css)" :disabled="props.disabled"
          @click="chooseSwatch(swatch, 'recent')"><span :style="{ background: swatch }" /></button>
      </div>
    </section>
    <section v-if="presets.length" class="ym-color-picker__swatches" aria-label="系统预设">
      <div class="ym-color-picker__swatch-heading">系统预设颜色</div>
      <div class="ym-color-picker__swatch-list">
        <button v-for="(swatch, i) in presets" :key="i" type="button" class="ym-color-picker__swatch ym-color-picker__checker"
          :aria-label="swatch" :title="swatch" :disabled="props.disabled" @click="chooseSwatch(swatch, 'preset')">
          <span :style="{ background: swatch }" />
        </button>
      </div>
    </section>
  </div>
</template>
