<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmSelect, type SelectOption, type SelectValue } from 'ym-ui-vapor'

const options = [
  { value: 0, label: 'Alpha 总仓', code: 'WH01' },
  { value: 'paused', label: '停用仓库', code: 'WH02', disabled: true },
  { value: '0', label: 'Bravo 分仓', code: 'WH03' },
  { value: 3, label: 'Charlie 分仓', code: 'WH04' },
]
const selected = ref<SelectValue>(0)
const many = ref<SelectValue>([])
const updates = ref<SelectValue[]>([])
const changes = ref<SelectValue[]>([])
const searches = ref<string[]>([])
const remoteCompleted = ref('')
const locations = Array.from({ length: 40 }, (_, value) => ({ value, label: `货位 ${value}` }))
const compact = ref(false)
const dark = ref(false)
const surface = ref('#f5f0e0')

function filterByCode(query: string, option: SelectOption) {
  return String(option.code).toLowerCase().includes(query.toLowerCase())
}

async function remoteSearch(query: string): Promise<SelectOption[]> {
  // 此服务不支持取消，允许测试精确控制响应顺序。
  const response = await fetch('/select-remote?query=' + encodeURIComponent(query))
  if (!response.ok) throw new Error('查询失败')
  const result = await response.json()
  remoteCompleted.value = query
  return result
}
</script>

<template>
  <section id="select-cases">
    <YmSelect v-model="selected" aria-label="单选仓库" :options="options"
      @update:model-value="updates.push($event)" @change="changes.push($event)" />
    <output id="select-updates">{{ JSON.stringify(updates) }}</output>
    <output id="select-changes">{{ JSON.stringify(changes) }}</output>
    <button @click="selected = 3">切换默认仓库</button>
    <YmSelect aria-label="锁定仓库" :model-value="0" :options="options" />
    <YmSelect aria-label="禁用仓库" disabled multiple :options="options" :default-value="[3]" />

    <YmSelect v-model="many" aria-label="多选仓库" multiple :max="2" :options="options">
      <template #option="{ option }"><strong>{{ option.label }}</strong> <small>{{ option.code }}</small></template>
    </YmSelect>
    <output id="select-many">{{ JSON.stringify(many) }}</output>
    <YmSelect aria-label="按名称筛选" filterable :options="options" @search="searches.push($event)" />
    <output id="select-searches">{{ JSON.stringify(searches) }}</output>
    <YmSelect aria-label="按编码筛选" :filter="filterByCode" :options="options" />
    <YmSelect aria-label="远程仓库" :remote-method="remoteSearch" />
    <output id="select-remote-completed">{{ remoteCompleted }}</output>

    <form id="select-form"><button type="reset">重置货位</button></form>
    <YmSelect form="select-form" name="location" aria-label="货位" multiple filterable :options="locations" :default-value="[34]" />

    <button @click="compact = !compact">切换选择器尺寸圆角</button>
    <button @click="dark = !dark">切换选择器模式</button>
    <label>选择器浅色背景 <input v-model="surface" type="color" /></label>
    <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { surface }, dark: { surface: '#294059', text: '#ccddee' } }">
      <ConfigProvider :radius="compact ? 0 : 12">
        <YmSelect aria-label="继承配置的仓库" multiple :options="options" :default-value="['paused']" />
        <YmSelect aria-label="局部尺寸的仓库" size="small" multiple :options="options" :default-value="[0]" />
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
