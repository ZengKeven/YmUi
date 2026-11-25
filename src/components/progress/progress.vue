<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, ref, useId, useTemplateRef, watch } from 'vue'
import { YmIcon } from '../icon'
import { resolveProgressColor } from './colors'
import progressProps from './props'
import type { ProgressStatus } from './types'

defineOptions({ name: 'YmProgress' })
const props = defineProps(progressProps)
defineSlots<{ label?: (scope: { percentage: number; status: ProgressStatus | 'default' }) => unknown }>()

const percentage = computed(() => Number.isFinite(props.percentage) ? Math.min(100, Math.max(0, props.percentage)) : 0)
const status = computed(() => props.status ?? (percentage.value === 100 ? 'success' : 'default'))
const statusIcon = computed(() => props.status && props.status !== 'active' && props.theme !== 'plump' ? props.status : undefined)
const statusText = { active: '进行中', success: '成功', warning: '警告', error: '错误' }
const color = computed(() => resolveProgressColor(props.color))
const gradientId = `ym-progress-gradient-${useId()}`
const diameter = computed(() => props.size != null && Number.isFinite(Number(props.size)) ? `${Math.max(0, Number(props.size))}px` : undefined)
const stroke = computed(() => {
  const value = props.strokeWidth
  if (value == null || value === '') return undefined
  return Number.isFinite(Number(value)) ? `${Math.max(0, Number(value))}px` : value
})

const fill = useTemplateRef<HTMLElement>('fill')
const label = useTemplateRef<HTMLElement>('label')
const labelInside = ref(false)
const labelWidth = ref(0)
watch([() => props.theme, fill, label], ([theme, bar, text], _, onCleanup) => {
  if (theme !== 'plump' || !bar || !text) return
  const measure = () => {
    labelWidth.value = text.offsetWidth
    labelInside.value = bar.clientWidth >= labelWidth.value + 8
  }
  measure()
  const observer = new ResizeObserver(measure)
  observer.observe(bar)
  observer.observe(text)
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })
</script>

<template>
  <div class="ym-progress" role="progressbar" aria-label="进度" aria-valuemin="0" aria-valuemax="100"
    :aria-valuenow="percentage" :aria-valuetext="props.status ? `${percentage}%（${statusText[props.status]}）` : undefined"
    :data-theme="props.theme" :data-status="status" :data-size="diameter ? undefined : props.size"
    :style="{ '--ym-progress-value': percentage + '%', '--ym-progress-diameter': diameter,
      '--ym-progress-stroke': stroke, '--ym-progress-track': props.trackColor }">
    <svg v-if="props.theme === 'circle'" class="ym-progress__ring" aria-hidden="true" focusable="false">
      <defs v-if="color.stops.length">
        <linearGradient :id="gradientId">
          <stop v-for="(stop, index) in color.stops" :key="index" :offset="stop.offset + '%'" :stop-color="stop.color" />
        </linearGradient>
      </defs>
      <circle class="ym-progress__ring-track" cx="50%" cy="50%" />
      <circle v-if="percentage > 0" class="ym-progress__ring-fill" cx="50%" cy="50%" pathLength="100"
        stroke-dasharray="100" :stroke-dashoffset="100 - percentage"
        :style="{ stroke: color.stops.length ? `url(#${gradientId})` : color.solid }" />
    </svg>
    <div v-else class="ym-progress__track">
      <div ref="fill" class="ym-progress__fill" :style="{ background: color.background }"></div>
    </div>
    <span v-if="props.label !== false" ref="label" class="ym-progress__label"
      :data-inside="props.theme === 'plump' && labelInside || undefined"
      :style="props.theme === 'plump' ? { '--ym-progress-label-width': labelWidth + 'px' } : undefined">
      <slot name="label" :percentage="percentage" :status="status">
        <template v-if="typeof props.label === 'string'">{{ props.label }}</template>
        <YmIcon v-else-if="statusIcon" :name="statusIcon" size="1em" />
        <template v-else>{{ percentage }}%</template>
      </slot>
    </span>
  </div>
</template>
