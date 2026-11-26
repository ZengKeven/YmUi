<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmDescriptions, YmDescriptionsItem, YmTag, type ChatToolCallRendererProps } from '../../src'

const props = defineProps<ChatToolCallRendererProps>()
const title = computed(() => {
  const args = props.args
  const warehouse = args && typeof args === 'object' && 'warehouse' in args && typeof args.warehouse === 'string'
    ? args.warehouse : '仓库'
  return warehouse + '收货预约'
})
const reservation = computed(() => {
  const data = props.result
  if (data && typeof data === 'object' && 'slot' in data && 'gate' in data
    && typeof data.slot === 'string' && typeof data.gate === 'string') {
    return { slot: data.slot, gate: data.gate }
  }
})
const states = {
  executing: { label: '查询中', theme: 'primary' },
  complete: { label: '可预约', theme: 'success' },
  error: { label: '查询失败', theme: 'danger' },
  stop: { label: '查询已中断', theme: 'default' },
} as const
</script>

<template>
  <section class="receiving-slot-card" :aria-label="title">
    <header>
      <strong>{{ title }}</strong>
      <YmTag role="status" variant="light" :theme="states[props.status].theme" :content="states[props.status].label" />
    </header>
    <YmDescriptions v-if="props.status === 'complete' && reservation" :column="1">
      <YmDescriptionsItem label="收货时段" :content="reservation.slot" />
      <YmDescriptionsItem label="登记入口" :content="reservation.gate" />
    </YmDescriptions>
    <p v-if="props.status === 'error' && typeof props.result === 'string'">{{ props.result }}</p>
  </section>
</template>

<style scoped>
.receiving-slot-card {
  display: grid;
  gap: .5em;
  padding: .75em var(--ym-control-padding);
  margin-block-end: .5em;
  border: 1px solid var(--ym-color-border);
  border-inline-start: 3px solid var(--ym-color-primary);
  border-radius: var(--ym-radius);
  background: var(--ym-color-surface);
}
.receiving-slot-card header { display: flex; align-items: center; flex-wrap: wrap; gap: .75em; }
.receiving-slot-card p { margin: 0; }
</style>
