<script setup lang="ts" vapor>
import { computed, useId, useModel } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import stepsProps from './props'
import type { StepOption, StepStatus, StepValue } from './types'

defineOptions({ name: 'YmSteps' })
const props = defineProps(stepsProps)
const emit = defineEmits<{
  'update:current': [current: StepValue]
  change: [current: StepValue, previous: StepValue, context: { e: MouseEvent }]
}>()
type StepSlot = (scope: { option: StepOption; index: number; status: StepStatus }) => unknown
const slots = defineSlots<{ icon?: StepSlot; title?: StepSlot; content?: StepSlot; extra?: StepSlot }>()

const model = useModel(props, 'current')
const id = useId()
const current = computed(() => model.value ?? props.options[0]?.value ?? 0)
const statusLabels = { default: '待开始', process: '进行中', finish: '已完成', error: '出错' }

const steps = computed(() => {
  const options = props.options
  const value = current.value
  const finished = value === 'FINISH' || (value === options.length && options.every(option => option.value === undefined))
  const active = finished ? options.length : options.findIndex((option, i) => (option.value ?? i) === value)
  const items = options.map((option, index) => {
    let status: StepStatus = 'default'
    if (option.status && option.status !== 'default') status = option.status
    else if (index < active) status = 'finish'
    else if (index === active) status = 'process'
    return { option, index, status, value: option.value ?? index, active: index === active }
  })
  return props.sequence === 'reverse' ? items.reverse() : items
})

function select(value: StepValue, e: MouseEvent) {
  const previous = current.value
  if (props.readonly || value === previous) return
  model.value = value
  emit('change', value, previous, { e })
}
</script>

<template>
  <ol class="ym-steps" aria-label="步骤条" role="list" :data-size="props.size"
    :data-layout="props.layout" :data-sequence="props.sequence" :data-separator="props.separator">
    <li v-for="(step, position) in steps" :key="step.value" class="ym-steps__item"
      :aria-current="step.active ? 'step' : undefined" :aria-describedby="props.readonly ? `${id}-${step.index}` : undefined"
      :data-status="step.status">
      <component :is="props.readonly ? 'span' : YmButton" class="ym-steps__heading"
        :variant="props.readonly ? undefined : 'text'" :aria-describedby="props.readonly ? undefined : `${id}-${step.index}`"
        @click="select(step.value, $event)">
        <span class="ym-steps__anchor" aria-hidden="true">
          <span class="ym-steps__marker"
            :class="{ 'ym-steps__marker--dot': props.theme === 'dot' && !step.option.icon && !slots.icon }">
            <slot name="icon" :option="step.option" :index="step.index" :status="step.status">
              <YmIcon v-if="step.option.icon" :name="step.option.icon" />
              <template v-else-if="props.theme !== 'dot'">
                <YmIcon v-if="step.status === 'finish'" name="success" />
                <YmIcon v-else-if="step.status === 'error'" name="close" />
                <template v-else>{{ step.index + 1 }}</template>
              </template>
            </slot>
          </span>
        </span>
        <span class="ym-steps__title">
          <slot name="title" :option="step.option" :index="step.index" :status="step.status">{{ step.option.title }}</slot>
        </span>
      </component>
      <span :id="`${id}-${step.index}`" hidden>{{ statusLabels[step.status] }}</span>
      <div v-if="step.option.content || slots.content" class="ym-steps__content">
        <slot name="content" :option="step.option" :index="step.index" :status="step.status">{{ step.option.content }}</slot>
      </div>
      <div v-if="step.option.extra || slots.extra" class="ym-steps__extra">
        <slot name="extra" :option="step.option" :index="step.index" :status="step.status">{{ step.option.extra }}</slot>
      </div>
      <span v-if="position < steps.length - 1" class="ym-steps__connector" aria-hidden="true">
        <YmIcon v-if="props.separator === 'arrow'" :name="props.layout === 'vertical' ? 'chevron-down' : 'chevron-right'" />
      </span>
    </li>
  </ol>
</template>
