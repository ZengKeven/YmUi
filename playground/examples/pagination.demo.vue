<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmPagination, YmSwitch, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const total = ref(137)
const current = ref(1)
const pageSize = ref(10)
const size = ref<ControlSize>()
const disabled = ref(false)
const firstRecord = computed(() => (current.value - 1) * pageSize.value + 1)
const lastRecord = computed(() => Math.min(current.value * pageSize.value, total.value))
</script>

<template>
  <PreviewFrame name="YmPagination">
    <template #preview>
      <div class="pagination-demo">
        <YmPagination v-model:current="current" v-model:page-size="pageSize"
          :total="total" :size="size" :disabled="disabled" />
        <output aria-live="polite">
          <template v-if="total">显示第 {{ firstRecord }}–{{ lastRecord }} 条</template>
          <template v-else>暂无记录</template>
        </output>
      </div>
    </template>
    <template #controls>
      <label>总条数
        <select v-model="total">
          <option :value="137">137</option>
          <option :value="23">23</option>
          <option :value="0">0</option>
        </select>
      </label>
      <label>分页尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.pagination-demo {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 1rem;
}
</style>
