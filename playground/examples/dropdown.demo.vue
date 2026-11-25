<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmButton, YmDropdown, YmIcon, YmSwitch, type DropdownOption, type DropdownProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const trigger = ref<DropdownProps['trigger']>('hover')
const placement = ref<DropdownProps['placement']>('bottom-left')
const size = ref<DropdownProps['size']>()
const disabled = ref(false)
const hideAfterItemClick = ref(true)

const pinned = ref(false)
const othersOpen = ref(true)
const options = computed<DropdownOption[]>(() => [
  { value: 'pin', content: pinned.value ? '取消固定当前页签' : '固定当前页签', active: pinned.value, divider: true },
  { value: 'close', content: '关闭其他页签', prefixIcon: 'close', theme: 'error', disabled: !othersOpen.value },
  { value: 'restore', content: '恢复其他页签', prefixIcon: 'undo', disabled: othersOpen.value },
])

function handleAction(option: DropdownOption) {
  if (option.value === 'pin') pinned.value = !pinned.value
  if (option.value === 'close') othersOpen.value = false
  if (option.value === 'restore') othersOpen.value = true
}
</script>

<template>
  <PreviewFrame name="YmDropdown">
    <template #preview>
      <div class="dropdown-demo">
        <div class="dropdown-demo__tabs" aria-live="polite">
          <strong>采购订单{{ pinned ? '（已固定）' : '' }}</strong>
          <template v-if="othersOpen"><span>入库单</span><span>库存查询</span></template>
        </div>
        <YmDropdown :options="options" :trigger="trigger" :placement="placement" :size="size"
          :hide-after-item-click="hideAfterItemClick" :disabled="disabled" @click="handleAction">
          <YmButton variant="outline" :size="size" :disabled="disabled">
            页签操作 <YmIcon name="chevron-down" />
          </YmButton>
        </YmDropdown>
      </div>
    </template>
    <template #controls>
      <label>触发方式
        <select v-model="trigger">
          <option value="hover">悬停</option><option value="click">点击</option>
          <option value="focus">聚焦</option><option value="context-menu">右键</option>
        </select>
      </label>
      <label>菜单位置
        <select v-model="placement">
          <option value="bottom-left">下方靠左</option><option value="bottom-right">下方靠右</option>
          <option value="top-left">上方靠左</option><option value="top-right">上方靠右</option>
        </select>
      </label>
      <label>菜单尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>执行后收起 <YmSwitch v-model="hideAfterItemClick" /></label>
      <label>禁用菜单 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.dropdown-demo,
.dropdown-demo__tabs { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; }
.dropdown-demo { width: 100%; justify-content: space-between; }
.dropdown-demo__tabs { color: var(--ym-color-text); }
.dropdown-demo__tabs strong { color: var(--ym-color-primary); }
</style>
