<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmSpace, type ControlSize, type SpaceProps } from 'ym-ui-vapor'

const globalSize = ref<ControlSize>('medium')
const size = ref<SpaceProps['size']>()
const vertical = ref(false)
const wrap = ref(false)
const optional = ref(true)
const customSeparator = ref(false)
const presses = ref(0)
const items = ref(['甲', '乙'])
</script>

<template>
  <label>全局间距尺寸
    <select v-model="globalSize"><option>medium</option><option>large</option></select>
  </label>
  <label>组件间距
    <select v-model="size">
      <option :value="undefined">继承</option>
      <option value="extra-small">极小</option>
      <option :value="0">无间距</option>
      <option :value="['small', '1.5rem']">分轴</option>
    </select>
  </label>
  <label><input v-model="vertical" type="checkbox" /> 纵向间距</label>
  <label><input v-model="wrap" type="checkbox" /> 间距换行</label>
  <ConfigProvider :size="globalSize">
    <YmSpace id="space-layout" style="max-width: 110px" align="end" :size="size"
      :direction="vertical ? 'vertical' : 'horizontal'" :break-line="wrap">
      <span class="space-case-item">A</span>
      <span class="space-case-item" style="height: 32px">B</span>
      <span class="space-case-item">C</span>
    </YmSpace>
  </ConfigProvider>

  <label><input v-model="optional" type="checkbox" /> 可选间距项</label>
  <label><input v-model="customSeparator" type="checkbox" /> 自定义分隔符</label>
  <button @click="items.reverse()">反转间距项</button>
  <button @click="items = []">清空间距项</button>
  <YmSpace id="space-dynamic" separator="·">
    <template #default>
      首项
      <span v-if="optional">可选</span>
      <label v-for="item in items" :key="item">{{ item }}<input :aria-label="item" /></label>
    </template>
    <template v-if="customSeparator" #separator>
      <button @click="presses++">分隔 {{ presses }}</button>
    </template>
  </YmSpace>
</template>

<style scoped>
.space-case-item { display: block; flex: none; width: 32px; height: 16px; }
</style>
