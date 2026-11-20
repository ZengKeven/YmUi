<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmLayout, YmMenu, type MenuItem } from 'ym-ui-vapor'

const items: MenuItem[] = [
  { value: 'overview', label: '营运总览', icon: 'dashboard' },
  { value: 'warehouse', label: '仓储作业', icon: 'warehouse', children: [
    { value: 0, label: '入库登记', icon: 'inventory' },
    { value: 'outbound', label: '出库记录', icon: 'distribution', href: '#outbound-records' },
  ] },
  { value: 'reports', label: '营运报表', icon: 'reports', href: '#menu-reports' },
]
const selected = ref<string | number>('overview')
const expanded = ref<(string | number)[]>([])
const changes = ref<(string | number)[]>([])
const dark = ref(false)
const compact = ref(false)
const localSize = ref(false)
const accent = ref('#236547')
</script>

<template>
  <div id="menu-cases">
    <label><input v-model="dark" type="checkbox" /> 菜单深色模式</label>
    <label><input v-model="compact" type="checkbox" /> 菜单紧凑配置</label>
    <label><input v-model="localSize" type="checkbox" /> 菜单局部尺寸</label>
    <label>菜单浅色主色 <input v-model="accent" type="color" /></label>
    <output id="menu-selection">{{ selected }}</output>
    <output id="menu-changes">{{ changes.join(',') }}</output>
    <output id="menu-expanded">{{ expanded.join(',') }}</output>
    <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="compact ? 'small' : 'large'"
      :theme="{ light: { primary: accent, surface: '#f5f6f7' }, dark: { primary: '#99bbdd', surface: '#20242e' } }">
      <ConfigProvider :radius="compact ? 0 : 13">
        <YmLayout style="width: 600px; height: 320px" :collapsed-width="56">
          <template #aside="{ collapsed }">
            <YmMenu v-model="selected" v-model:expanded="expanded" :items="items" :collapsed="collapsed"
              :size="localSize ? 'extra-small' : undefined" @update:model-value="changes.push($event)" />
          </template>
          <template #content>菜单测试内容</template>
        </YmLayout>
      </ConfigProvider>
    </ConfigProvider>
  </div>
</template>
