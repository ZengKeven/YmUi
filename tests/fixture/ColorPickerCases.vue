<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmColorPicker, YmColorPickerPanel, type ColorObject, type ColorPickerChangeTrigger } from 'ym-ui-vapor'

const value = ref('#ff0000')
const optional = ref<string>()
const gradient = ref('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)')
const changes = ref<{ value: string; trigger: ColorPickerChangeTrigger; color: ColorObject }[]>([])
const updates = ref<string[]>([])
const recent = ref<string[]>(['green'])
const palette = ref<ColorObject>()
const clears = ref(0)
const disabled = ref(false)
const alpha = ref(false)
const multiple = ref(true)
const exampleSwatches = ref(false)
const samples = ['red', 'linear-gradient(90deg, red 0%, blue 100%)']
const surface = ref('#f5f0e0')
const dark = ref(false)
const compact = ref(false)

function changed(value: string, context: { color: ColorObject; trigger: ColorPickerChangeTrigger }) {
  changes.value.push({ value, ...context })
}
function cleared({ e }: { e: MouseEvent }) {
  if (e instanceof MouseEvent) clears.value++
}
</script>

<template>
  <section id="picker">
    <YmColorPicker v-model="value" value="black" format="HEX" clearable borderless :disabled="disabled"
      :input-props="{ placeholder: '输入色值' }" :swatch-colors="['red', '#0000ff']"
      @update:model-value="updates.push('picker-model')" @update:value="updates.push('picker-value')"
      @change="changed" @clear="cleared" />
    <label><input v-model="disabled" type="checkbox" />禁用颜色选择器</label>
    <button @click="value = 'green'">设置外部颜色</button>
    <output id="model">{{ value }}</output>
    <output id="clears">{{ clears }}</output>
  </section>
  <section id="custom">
    <YmColorPicker default-value="red" format="HEX" :default-recent-colors="['purple']"
      :select-input-props="{ disabled: true }"
      :popup-props="{ overlayClassName: 'custom-color-popup', overlayStyle: { padding: '7px' } }">
      <button>自定义颜色触发器</button>
    </YmColorPicker>
  </section>
  <section id="fixed">
    <YmColorPicker value="#123456" format="HEX" :swatch-colors="['red']" @change="changed"
      @update:model-value="updates.push('alias-model')" @update:value="updates.push('alias-value')" />
  </section>
  <section id="optional">
    <YmColorPicker v-model="optional" value="red" default-value="green" format="HEX"
      :swatch-colors="['#0000ff']" @update:value="updates.push('optional-alias')" />
    <output>{{ optional }}</output>
  </section>
  <section id="mono">
    <label><input v-model="alpha" type="checkbox" />启用透明通道</label>
    <button @click="recent.splice(0)">清空最近色数组</button>
    <YmColorPickerPanel default-value="red" :color-modes="['monochrome']" :enable-alpha="alpha" :disabled="disabled"
      :show-primary-color-preview="false" :recent-colors="recent" :swatch-colors="['#0000ff']"
      @update:model-value="updates.push('local-model')" @update:value="updates.push('local-value')"
      @change="changed" @recent-colors-change="recent = $event" @palette-bar-change="palette = $event.color" />
  </section>
  <section id="gradient">
    <label><input v-model="multiple" type="checkbox" />可增加渐变色标</label>
    <label><input v-model="exampleSwatches" type="checkbox" />显示混合色样</label>
    <YmColorPickerPanel v-model="gradient" value="red" :color-modes="['linear-gradient']" :enable-multiple-gradient="multiple"
      @update:model-value="updates.push('panel-model')" @update:value="updates.push('panel-value')"
      :recent-colors="exampleSwatches ? samples : false" :swatch-colors="exampleSwatches ? samples : null" @change="changed" />
    <output id="gradient-model">{{ gradient }}</output>
  </section>
  <section id="globals">
    <label><input v-model="dark" type="checkbox" />深色模式</label>
    <label><input v-model="compact" type="checkbox" />紧凑尺寸和直角</label>
    <label>浅色背景<input v-model="surface" type="color" /></label>
    <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { surface }, dark: { surface: '#294059', text: '#ccddee' } }">
      <ConfigProvider :radius="compact ? 0 : 12">
        <div id="global-inherited"><YmColorPicker default-value="#123456" /></div>
        <div id="global-local"><YmColorPicker size="small" default-value="#123456" /></div>
        <div id="global-attached">
          <YmColorPicker default-value="red" :popup-props="{ attach: '#color-overlay-target', trigger: 'context-menu' }"
            :select-input-props="{ popupProps: { overlayClassName: 'color-format-list' } }" />
        </div>
      </ConfigProvider>
    </ConfigProvider>
  </section>
  <ConfigProvider size="small" mode="dark" :radius="27" :theme="{ dark: { surface: '#101010', text: '#eeeeee' } }">
    <div id="color-overlay-target"></div>
  </ConfigProvider>
  <output id="changes">{{ JSON.stringify(changes) }}</output>
  <output id="updates">{{ updates.join(',') }}</output>
  <output id="palette">{{ JSON.stringify(palette) }}</output>
  <output id="recent-model">{{ JSON.stringify(recent) }}</output>
</template>
