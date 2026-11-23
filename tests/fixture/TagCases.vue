<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmIcon, YmTag, type ControlSize } from 'ym-ui-vapor'

const label = ref('待审核')
const disabled = ref(false)
const removeOnClose = ref(false)
const visible = ref(true)
const closes = ref(0)
const bubbles = ref(0)
const submits = ref(0)
const size = ref<ControlSize>('large')
const flat = ref(false)
const dark = ref(false)
const primary = ref('#126547')
const maxWidth = ref<number | string>()

function close(event: MouseEvent) {
  if (event instanceof MouseEvent && event.type === 'click') closes.value++
  if (removeOnClose.value) visible.value = false
}
</script>

<template>
  <section id="tag-cases">
    <YmTag id="tag-plain" content="草稿" />
    <YmTag id="tag-slot" content="备用文案" closable>
      <template #icon><YmIcon name="success" /></template>
      <strong>{{ label }}</strong>
    </YmTag>
    <label>标签文案 <input v-model="label" /></label>

    <label>标签限宽
      <select v-model="maxWidth">
        <option :value="undefined">容器宽度</option>
        <option :value="96">像素</option>
        <option value="75%">百分比</option>
      </select>
    </label>
    <form style="width: 120px" @click="bubbles++" @submit.prevent="submits++">
      <YmTag v-if="visible" id="tag-limited" content="已入库的配送订单和库存状态" closable
        :max-width="maxWidth" :disabled="disabled" close-label="移除库存状态" @close="close">
        <template #icon><YmIcon name="warehouse" /></template>
      </YmTag>
    </form>
    <output id="tag-events">{{ closes }}/{{ bubbles }}/{{ submits }}</output>
    <label><input v-model="disabled" type="checkbox" /> 禁用库存标签</label>
    <label><input v-model="removeOnClose" type="checkbox" /> 关闭时移除库存标签</label>

    <label>标签全局尺寸
      <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label>标签浅色主色 <input v-model="primary" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 标签深色模式</label>
    <label><input v-model="flat" type="checkbox" /> 全局直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary, onAccent: '#f9f3ee' }, dark: { primary: '#9abeef', onAccent: '#102030' } }">
      <ConfigProvider :radius="flat ? 0 : 9">
        <YmTag id="tag-inherited" theme="primary" closable>继承配置</YmTag>
        <YmTag id="tag-explicit" size="small" theme="primary" shape="mark">局部尺寸</YmTag>
        <YmTag id="tag-round" shape="round">两端圆角</YmTag>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
