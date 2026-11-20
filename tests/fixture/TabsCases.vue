<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmIcon, YmTabPanel as TTabPanel, YmTabs } from 'ym-ui-vapor'

const current = ref<string | number>(0)
const changes = ref<(string | number)[]>([])
const updates = ref<(string | number)[]>([])
const notes = ref(0)
const refreshes = ref(0)
const compact = ref(false)
const dark = ref(false)
const localSize = ref(false)
const primary = ref('#236547')
</script>

<template>
  <div id="tabs-cases">
    <button @click="current = 'notes'">外部切换事项</button>
    <label><input v-model="dark" type="checkbox" /> 选项卡深色模式</label>
    <label><input v-model="compact" type="checkbox" /> 选项卡紧凑配置</label>
    <label><input v-model="localSize" type="checkbox" /> 选项卡局部尺寸</label>
    <label>选项卡浅色主色 <input v-model="primary" type="color" /></label>
    <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="compact ? 'small' : 'large'"
      :theme="{ light: { primary }, dark: { primary: '#99bbdd' } }">
      <ConfigProvider :radius="compact ? 0 : 13">
        <YmTabs v-model="current" :size="localSize ? 'extra-small' : undefined"
          @update:model-value="updates.push($event)" @change="changes.push($event)">
          <t-tab-panel :value="0" label="工作首页">
            <template #label><YmIcon name="home" /> 首页</template>
            <template #action><button @click="refreshes++">刷新首页 {{ refreshes }}</button></template>
            <h3>工作台</h3>
            <label>未保存草稿 <input /></label>
          </t-tab-panel>
          <t-tab-panel value="calendar" label="日程"><ul><li>采购评审</li></ul></t-tab-panel>
          <t-tab-panel value="notes" label="事项">
            <template #action><input aria-label="筛选事项" /></template>
            <button @click="notes++">登记事项</button><output>{{ notes }}</output>
          </t-tab-panel>
        </YmTabs>
      </ConfigProvider>
    </ConfigProvider>
    <output id="tabs-model">{{ current }}</output>
    <output id="tabs-updates">{{ JSON.stringify(updates) }}</output>
    <output id="tabs-changes">{{ JSON.stringify(changes) }}</output>
  </div>
  <div id="tabs-nested">
    <YmTabs>
      <t-tab-panel value="overview" label="概览">
        <YmTabs>
          <t-tab-panel value="overview" label="本周">本周统计</t-tab-panel>
          <t-tab-panel value="上周">上周统计</t-tab-panel>
        </YmTabs>
      </t-tab-panel>
      <t-tab-panel value="history" label="操作记录">编辑记录</t-tab-panel>
    </YmTabs>
  </div>
  <div v-for="layout in ['fixed', 'percentage', 'flex', 'auto']" :id="`tabs-fill-${layout}`" :key="layout">
    <header v-if="layout === 'flex'">详情页</header>
    <div class="tabs-fill-host">
      <YmTabs>
        <t-tab-panel value="summary" label="摘要">基本信息</t-tab-panel>
        <t-tab-panel value="details" label="明细">
          <div style="height: 640px">详细记录</div>
        </t-tab-panel>
      </YmTabs>
      <footer v-if="layout === 'flex'">操作栏</footer>
    </div>
  </div>
</template>

<style scoped>
#tabs-fill-fixed .tabs-fill-host { height: 288px; }
#tabs-fill-percentage { height: 320px; }
#tabs-fill-percentage .tabs-fill-host { height: 100%; }
#tabs-fill-flex { display: flex; flex-direction: column; height: 360px; }
#tabs-fill-flex .tabs-fill-host { display: flex; flex-direction: column; flex: 1; min-height: 0; }
#tabs-fill-flex header { flex: 0 0 40px; }
#tabs-fill-flex footer { flex: 0 0 36px; }
</style>
