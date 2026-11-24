<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmColorPicker, YmColorPickerPanel, YmSwitch, type ColorFormat, type ColorMode, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const color = ref('#0052d9')
const inline = ref(false)
const mode = ref<ColorMode | 'both'>('both')
const modes = computed<ColorMode[]>(() => mode.value === 'both' ? ['monochrome', 'linear-gradient'] : [mode.value])
const size = ref<ControlSize>()
const format = ref<ColorFormat>('RGB')
const alpha = ref(false)
const formats = computed<ColorFormat[]>(() => alpha.value ? ['HEX8', 'RGBA', 'HSLA', 'HSVA', 'CMYK', 'CSS'] : ['HEX', 'RGB', 'HSL', 'HSV', 'CMYK', 'CSS'])
const multiple = ref(true)
const preview = ref(true)
const disabled = ref(false)
const clearable = ref(true)
const showRecent = ref(true)
const history = ref<string[]>([])
const recent = computed(() => showRecent.value ? history.value : false)

function toggleAlpha(enabled: boolean) {
  const previousIndex = formats.value.indexOf(format.value)
  alpha.value = enabled
  format.value = formats.value[previousIndex]
}
</script>

<template>
  <PreviewFrame name="YmColorPicker">
    <template #preview>
      <YmColorPicker v-if="inline === false" v-model="color" :size="size" :format="format" :color-modes="modes"
        :enable-alpha="alpha" :enable-multiple-gradient="multiple" :show-primary-color-preview="preview"
        :recent-colors="recent" :clearable="clearable" :disabled="disabled" @recent-colors-change="history = $event" />
      <YmColorPickerPanel v-if="inline" v-model="color" :size="size" :format="format" :color-modes="modes"
        :enable-alpha="alpha" :enable-multiple-gradient="multiple" :show-primary-color-preview="preview"
        :recent-colors="recent" :disabled="disabled" @recent-colors-change="history = $event" />
    </template>
    <template #controls>
      <label>内嵌面板 <YmSwitch v-model="inline" /></label>
      <label>可选颜色模式
        <select v-model="mode">
          <option value="both">单色与渐变</option><option value="monochrome">仅单色</option><option value="linear-gradient">仅渐变</option>
        </select>
      </label>
      <label>选择器尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>输出格式
        <select v-model="format"><option v-for="item in formats" :key="item" :value="item">{{ item }}</option></select>
      </label>
      <label>透明通道 <YmSwitch :model-value="alpha" @update:model-value="toggleAlpha($event === true)" /></label>
      <label v-if="mode !== 'monochrome'">允许添加色标 <YmSwitch v-model="multiple" /></label>
      <label>颜色预览 <YmSwitch v-model="preview" /></label>
      <label>最近使用颜色 <YmSwitch v-model="showRecent" /></label>
      <label v-if="!inline">允许清空 <YmSwitch v-model="clearable" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
