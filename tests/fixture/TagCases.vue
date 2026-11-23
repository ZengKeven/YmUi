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

    <form @click="bubbles++" @submit.prevent="submits++">
      <YmTag v-if="visible" content="已入库" closable :disabled="disabled"
        close-label="移除库存状态" @close="close" />
    </form>
    <output id="tag-events">{{ closes }}/{{ bubbles }}/{{ submits }}</output>
    <label><input v-model="disabled" type="checkbox" /> 禁用库存标签</label>
    <label><input v-model="removeOnClose" type="checkbox" /> 关闭时移除库存标签</label>

    <label>标签全局尺寸
      <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label>标签浅色主色 <input v-model="primary" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 标签深色模式</label>
    <label><input v-model="flat" type="checkbox" /> 标签直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary, onAccent: '#f9f3ee' }, dark: { primary: '#9abeef', onAccent: '#102030' } }">
      <ConfigProvider :radius="flat ? 0 : 9">
        <YmTag id="tag-inherited" theme="primary">继承配置</YmTag>
        <YmTag id="tag-explicit" size="small" theme="primary">局部尺寸</YmTag>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
