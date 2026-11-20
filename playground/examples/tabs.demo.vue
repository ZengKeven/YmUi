<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmIcon, YmTabPanel as TTabPanel, YmTabs, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const active = ref<string | number>('home')
const size = ref<ControlSize>()
const showIcons = ref(true)
</script>

<template>
  <PreviewFrame name="YmTabs">
    <template #preview>
      <YmTabs v-model="active" :size="size">
        <t-tab-panel value="home">
          <template #label><YmIcon v-if="showIcons" name="home" />首页</template>
          今天有 2 项日程。
        </t-tab-panel>
        <t-tab-panel value="schedule">
          <template #label><YmIcon v-if="showIcons" name="calendar" />日程</template>
          <ul class="tabs-demo-agenda">
            <li><time>09:30</time> 采购例会</li>
            <li><time>14:00</time> 库存盘点</li>
          </ul>
        </t-tab-panel>
        <t-tab-panel value="tasks">
          <template #label><YmIcon v-if="showIcons" name="list-view" />事项</template>
          <label class="tabs-demo-note">事项备注
            <input type="text" placeholder="记录待办事项" />
          </label>
        </t-tab-panel>
      </YmTabs>
    </template>
    <template #controls>
      <label>选项卡尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示图标 <input v-model="showIcons" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.tabs-demo-agenda { display: grid; gap: .4em; margin: 0; padding: 0; list-style: none; }
.tabs-demo-agenda time { margin-inline-end: .5em; font-variant-numeric: tabular-nums; }
.tabs-demo-note { display: flex; flex-wrap: wrap; align-items: center; gap: .5em; }
.tabs-demo-note input {
  max-width: 100%;
  padding: .25em .5em;
  border: 1px solid var(--ym-color-border);
  border-radius: var(--ym-radius);
  background: var(--ym-color-surface);
  color: var(--ym-color-text);
  font: inherit;
}
</style>
