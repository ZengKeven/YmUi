<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmButton, YmIcon, YmTag, type TagProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const initialWarehouses = ['上海仓', '杭州仓']
const warehouses = ref([...initialWarehouses])
const theme = ref<TagProps['theme']>('primary')
const variant = ref<TagProps['variant']>('light')
const size = ref<TagProps['size']>()
const closable = ref(true)
const disabled = ref(false)
const showIcon = ref(true)

function remove(warehouse: string) {
  warehouses.value = warehouses.value.filter(item => item !== warehouse)
}
</script>

<template>
  <PreviewFrame name="YmTag">
    <template #preview>
      <div class="demo-row">
        <YmTag v-for="warehouse in warehouses" :key="warehouse" :content="warehouse"
          :theme="theme" :variant="variant" :size="size" :closable="closable" :disabled="disabled"
          :close-label="`移除 ${warehouse}`" @close="remove(warehouse)">
          <template v-if="showIcon" #icon><YmIcon name="warehouse" /></template>
        </YmTag>
        <span v-if="!warehouses.length" role="status">已移除全部仓库</span>
      </div>
    </template>
    <template #controls>
      <label>标签主题
        <select v-model="theme">
          <option value="default">默认</option><option value="primary">主要</option><option value="success">成功</option>
          <option value="warning">警告</option><option value="danger">危险</option>
        </select>
      </label>
      <label>标签样式
        <select v-model="variant">
          <option value="dark">实心</option><option value="light">浅色</option>
          <option value="outline">描边</option><option value="light-outline">浅色描边</option>
        </select>
      </label>
      <label>标签尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示图标 <input v-model="showIcon" type="checkbox" /></label>
      <label>可关闭 <input v-model="closable" type="checkbox" /></label>
      <label>禁用 <input v-model="disabled" type="checkbox" /></label>
      <YmButton v-if="warehouses.length < initialWarehouses.length" variant="outline"
        @click="warehouses = [...initialWarehouses]">恢复标签</YmButton>
    </template>
  </PreviewFrame>
</template>
