<script setup lang="ts" vapor>
import { computed, ref, watch } from 'vue'
import { YmSelect, YmSwitch, type ControlSize, type SelectValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const warehouses = [
  { value: 'sh', label: '上海仓', code: 'SHA' },
  { value: 'hz', label: '杭州仓', code: 'HGH' },
  { value: 'cd', label: '成都仓', code: 'CTU' },
  { value: 'wh', label: '武汉仓', code: 'WUH', disabled: true },
]
const warehouse = ref<SelectValue>(null)
const multiple = ref(false)
const max = ref(2)
const limit = computed(() => multiple.value ? max.value : undefined)
const searchMode = ref('local')
const custom = ref(true)
const disabled = ref(false)
const size = ref<ControlSize>()

watch(multiple, enabled => {
  const current = warehouse.value
  if (enabled && !Array.isArray(current)) warehouse.value = current === null ? [] : [current]
  if (!enabled && Array.isArray(current)) warehouse.value = current[0] ?? null
})

async function searchWarehouses(query: string, signal: AbortSignal) {
  await new Promise<void>(resolve => setTimeout(resolve, 150))
  signal.throwIfAborted()
  const term = query.trim().toLowerCase()
  return warehouses.filter(item => item.label.includes(term) || item.code.toLowerCase().includes(term))
}
</script>

<template>
  <PreviewFrame name="YmSelect">
    <template #preview>
      <YmSelect v-if="searchMode !== 'remote'" v-model="warehouse" :options="warehouses" :multiple="multiple" :max="limit"
        :filterable="searchMode === 'local'" :disabled="disabled" :size="size" aria-label="配送仓库" placeholder="选择配送仓库">
        <template v-if="custom" #option="{ option }">
          <span>{{ option.label }}</span> <small>{{ option.code }}</small>
        </template>
      </YmSelect>
      <YmSelect v-if="searchMode === 'remote'" v-model="warehouse" :remote-method="searchWarehouses" :options="warehouses"
        :multiple="multiple" :max="limit" :disabled="disabled" :size="size" aria-label="配送仓库" placeholder="搜索仓名或代码">
        <template v-if="custom" #option="{ option }">
          <span>{{ option.label }}</span> <small>{{ option.code }}</small>
        </template>
      </YmSelect>
    </template>
    <template #controls>
      <label>多选 <YmSwitch v-model="multiple" /></label>
      <label v-if="multiple">最多可选
        <select v-model="max">
          <option :value="0">不限</option><option :value="1">1 项</option><option :value="2">2 项</option>
        </select>
      </label>
      <label>搜索方式
        <select v-model="searchMode">
          <option value="none">关闭搜索</option><option value="local">本地过滤</option><option value="remote">远程搜索</option>
        </select>
      </label>
      <label>显示仓库代码 <YmSwitch v-model="custom" /></label>
      <label>选择器尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
