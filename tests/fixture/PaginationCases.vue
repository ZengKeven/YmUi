<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmPagination } from 'ym-ui-vapor'

const current = ref(1)
const pageSize = ref(10)
const total = ref(231)
const disabled = ref(false)
const dark = ref(false)
const compact = ref(false)
const localSize = ref(false)
const primary = ref('#236547')
const changes = ref<string[]>([])

function recordChange(event: { current: number; previous: number; pageSize: number }) {
  changes.value.push(`${event.previous}→${event.current}/${event.pageSize}`)
}
</script>

<template>
  <div id="pagination-default"><YmPagination :total="61" /></div>
  <div id="pagination-cases">
    <label>分页数据条数 <input v-model.number="total" type="number" /></label>
    <label><input v-model="disabled" type="checkbox" /> 禁用分页</label>
    <label><input v-model="dark" type="checkbox" /> 分页深色模式</label>
    <label><input v-model="compact" type="checkbox" /> 分页紧凑配置</label>
    <label><input v-model="localSize" type="checkbox" /> 分页局部尺寸</label>
    <label>分页浅色主色 <input v-model="primary" type="color" /></label>
    <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="compact ? 'small' : 'large'"
      :theme="{ light: { primary }, dark: { primary: '#99bbdd' } }">
      <ConfigProvider :radius="compact ? 0 : 13">
        <YmPagination v-model:current="current" v-model:page-size="pageSize" :total="total"
          :page-size-options="[10, 20, 50]" :disabled="disabled"
          :size="localSize ? 'extra-small' : undefined" @change="recordChange" />
      </ConfigProvider>
    </ConfigProvider>
    <output id="pagination-model">{{ current }}/{{ pageSize }}</output>
    <output id="pagination-changes">{{ changes.join(',') }}</output>
  </div>
</template>
