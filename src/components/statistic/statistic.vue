<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmIcon } from '../icon'
import { YmLoading } from '../loading'
import { useStatisticAnimation } from './animation'
import statisticProps from './props'
import type { StatisticInstance } from './types'

defineOptions({ name: 'YmStatistic' })
const props = defineProps(statisticProps)
defineSlots<{
  title?: () => unknown
  prefix?: () => unknown
  unit?: () => unknown
  suffix?: () => unknown
  extra?: () => unknown
}>()
const { displayValue, start } = useStatisticAnimation(props)
defineExpose<StatisticInstance>({ start })

const plain = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20, useGrouping: false })
function fractionDigits(value: number) {
  return plain.formatToParts(value).find(part => part.type === 'fraction')?.value.length ?? 0
}
const fixedPlaces = computed(() => props.decimalPlaces !== undefined && statisticProps.decimalPlaces.validator(props.decimalPlaces)
  ? props.decimalPlaces : undefined)
const formatter = computed(() => new Intl.NumberFormat('en-US', {
  minimumFractionDigits: fixedPlaces.value ?? 0,
  maximumFractionDigits: fixedPlaces.value ?? Math.max(fractionDigits(props.value), fractionDigits(props.animation?.valueFrom ?? 0)),
  useGrouping: Boolean(props.separator),
}))
const text = computed(() => {
  const value = displayValue.value
  if (props.format) return props.format(value)
  return formatter.value.format(value).replaceAll(',', () => props.separator)
})
const colors = new Map([
  ['black', 'var(--ym-color-text)'], ['blue', 'var(--ym-color-primary)'],
  ['red', 'var(--ym-color-danger)'], ['orange', 'var(--ym-color-warning)'], ['green', 'var(--ym-color-success)'],
])
const contentColor = computed(() => colors.get(props.color ?? '') ?? props.color)
const trendIcon = computed(() => props.trend === 'increase' ? 'trend-up' : 'trend-down')
const trendLabel = computed(() => props.trend === 'increase' ? '上升' : '下降')
</script>

<template>
  <div class="ym-statistic ym-theme" :data-size="props.size" :aria-busy="props.loading || undefined">
    <div v-if="$slots.title || props.title" class="ym-statistic__title"><slot name="title">{{ props.title }}</slot></div>
    <div v-if="props.loading" class="ym-statistic__loading"><YmLoading /></div>
    <div v-else class="ym-statistic__content" :style="{ color: contentColor }">
      <span v-if="$slots.prefix || props.prefix || (props.trend && props.trendPlacement === 'left')" class="ym-statistic__prefix">
        <slot name="prefix">
          <template v-if="props.prefix">{{ props.prefix }}</template>
          <YmIcon v-else :name="trendIcon" :aria-label="trendLabel" size="1em" />
        </slot>
      </span>
      <span class="ym-statistic__value">{{ text }}</span>
      <span v-if="$slots.unit || props.unit" class="ym-statistic__unit"><slot name="unit">{{ props.unit }}</slot></span>
      <span v-if="$slots.suffix || props.suffix || (props.trend && props.trendPlacement === 'right')" class="ym-statistic__suffix">
        <slot name="suffix">
          <template v-if="props.suffix">{{ props.suffix }}</template>
          <YmIcon v-else :name="trendIcon" :aria-label="trendLabel" size="1em" />
        </slot>
      </span>
    </div>
    <div v-if="$slots.extra || props.extra" class="ym-statistic__extra"><slot name="extra">{{ props.extra }}</slot></div>
  </div>
</template>
