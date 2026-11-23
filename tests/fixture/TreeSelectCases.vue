<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmTreeSelect } from 'ym-ui-vapor'

const options = [
  { value: 'east', label: '华东大区', children: [
    { value: 'shanghai', label: '上海配送中心', children: [
      { value: 0, label: '虹桥仓' }, { value: '0', label: '浦东仓' },
      { value: 2, label: '停用仓', disabled: true },
    ] },
  ] },
  { value: 'south', label: '华南大区', disabled: true, children: [
    { value: 'guangzhou', label: '广州仓' },
  ] },
]
const many = ref<(number | string)[]>([])
const levels = ref([1, 2])
const changes = ref<(number | string)[][]>([])
const searches = ref<string[]>([])
const dark = ref(false)
const compact = ref(false)
const surface = ref('#f5f0e0')
</script>

<template>
  <section id="tree-select-cases">
    <YmTreeSelect v-model="many" multiple filterable aria-label="区域多选" :options="options"
      :disabled-levels="levels" @change="changes.push($event)" @search="searches.push($event)" />
    <output id="tree-many">{{ JSON.stringify(many) }}</output>
    <output id="tree-changes">{{ JSON.stringify(changes) }}</output>
    <output id="tree-searches">{{ JSON.stringify(searches) }}</output>
    <button @click="levels = [2]">仅禁选第二级</button>
    <button @click="levels = []">允许各层级选择</button>
    <YmTreeSelect aria-label="键盘选仓" :options="options" />
    <YmTreeSelect aria-label="锁定区域" :options="options" model-value="east" />
    <YmTreeSelect aria-label="已禁用的区域" disabled multiple :options="options" :default-value="[0]" />

    <form id="tree-form"><button type="reset">重置区域表单</button></form>
    <YmTreeSelect aria-label="表单区域" form="tree-form" name="region" multiple filterable
      :options="options" :default-value="['east']" />

    <label>树面板浅色背景 <input v-model="surface" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 树选择器深色模式</label>
    <label><input v-model="compact" type="checkbox" /> 树选择器紧凑配置</label>
    <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="compact ? 'small' : 'large'"
      :theme="{ light: { surface }, dark: { surface: '#294059', text: '#ccddee' } }">
      <ConfigProvider :radius="compact ? 0 : 12">
        <YmTreeSelect aria-label="继承配置的区域" :options="options" />
        <YmTreeSelect aria-label="固定尺寸的区域" size="extra-small" :options="options" />
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
