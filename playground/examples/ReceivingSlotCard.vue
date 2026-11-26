<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmButton, YmDescriptions, YmDescriptionsItem, YmSpace, YmTag, type ChatToolCallRendererProps } from '../../src'

const props = defineProps<ChatToolCallRendererProps>()
const choices = computed(() => {
  const args = props.args
  return args && typeof args === 'object' && 'slots' in args && Array.isArray(args.slots)
    ? args.slots.filter((slot): slot is string => typeof slot === 'string') : []
})
const title = computed(() => {
  const args = props.args
  const warehouse = args && typeof args === 'object' && 'warehouse' in args && typeof args.warehouse === 'string'
    ? args.warehouse : '仓库'
  return warehouse + '收货预约'
})
const reservation = computed(() => {
  const data = props.result
  if (data && typeof data === 'object' && 'slot' in data && typeof data.slot === 'string') {
    return { slot: data.slot, gate: 'gate' in data && typeof data.gate === 'string' ? data.gate : undefined }
  }
})
const states = {
  executing: { label: '查询中', theme: 'primary' },
  'awaiting-input': { label: '待确认', theme: 'warning' },
  complete: { label: '可预约', theme: 'success' },
  error: { label: '查询失败', theme: 'danger' },
  stop: { label: '查询已中断', theme: 'default' },
} as const
const statusLabel = computed(() => props.toolCallName === 'confirm_receiving_slot' && props.status === 'complete'
  ? '已确认' : states[props.status].label)
</script>

<template>
  <section class="receiving-slot-card" :aria-label="title">
    <header>
      <strong>{{ title }}</strong>
      <YmTag role="status" variant="light" :theme="states[props.status].theme" :content="statusLabel" />
    </header>
    <YmDescriptions v-if="props.status === 'complete' && reservation" :column="1">
      <YmDescriptionsItem label="收货时段" :content="reservation.slot" />
      <YmDescriptionsItem v-if="reservation.gate" label="登记入口" :content="reservation.gate" />
    </YmDescriptions>
    <YmSpace v-if="props.status === 'awaiting-input'" break-line>
      <YmButton v-for="slot in choices" :key="slot" variant="outline" :disabled="!props.respond"
        @click="props.respond?.({ slot })">确认 {{ slot }}</YmButton>
    </YmSpace>
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
