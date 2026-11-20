<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmLayout } from 'ym-ui-vapor'

const logo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="navy"/%3E%3C/svg%3E'
const collapsed = ref(true)
const requests = ref<boolean[]>([])
</script>

<template>
  <div style="width: 800px; height: 300px">
    <YmLayout id="layout" :logo="logo" system-name="库存管理" :collapsed-width="56">
      <template #header>工作台</template>
      <template #aside="{ collapsed }">{{ collapsed ? '简洁导航' : '完整导航' }}</template>
      <template #content><div style="width: 1200px; height: 600px">库存清单</div></template>
    </YmLayout>
  </div>

  <label><input v-model="collapsed" type="checkbox" /> 外部收起侧栏</label>
  <output id="layout-requests">{{ requests.join(',') }}</output>
  <YmLayout id="controlled-layout" style="width: 800px; height: 300px"
    :header-height="64" :aside-width="260" :collapsed="collapsed"
    @update:collapsed="requests.push($event)" />
</template>
