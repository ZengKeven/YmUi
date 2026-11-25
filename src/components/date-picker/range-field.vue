<script setup lang="ts" vapor>
import { computed, useAttrs, useTemplateRef } from 'vue'
import { YmIcon } from '../icon'

type Endpoint = 'start' | 'end'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  startValue?: string | null
  endValue?: string | null
  formValue: string
  active: Endpoint
  open: boolean
  dialogId: string
  placeholder?: string
  borderless?: boolean
  disabled?: boolean
  readonly?: boolean
  name?: string
  form?: string
  id?: string
  tabindex?: string | number
}>()
const emit = defineEmits<{ activate: [endpoint: Endpoint, keyboard: boolean] }>()
const attrs = useAttrs()
const describedBy = computed(() => typeof attrs['aria-describedby'] === 'string' ? attrs['aria-describedby'] : undefined)
const start = useTemplateRef<HTMLInputElement>('start')
const end = useTemplateRef<HTMLInputElement>('end')

function click(event: MouseEvent) {
  if (props.disabled || props.readonly) return
  const endpoint = event.target === start.value ? 'start' : event.target === end.value ? 'end' : props.active
  const input = endpoint === 'start' ? start.value : end.value
  input?.focus()
  emit('activate', endpoint, false)
}

function keydown(event: KeyboardEvent, endpoint: Endpoint) {
  if (props.disabled || props.readonly || !['ArrowDown', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  emit('activate', endpoint, true)
}
</script>

<template>
  <span aria-label="日期范围" v-bind="$attrs" class="ym-input ym-date-picker__range-field" role="group"
    :data-open="props.open || undefined" :data-disabled="props.disabled || undefined"
    :data-borderless="props.borderless || undefined" @click.stop="click">
    <input ref="start" :id="props.id" class="ym-input__control" role="combobox" type="text" readonly
      aria-label="开始日期" aria-haspopup="dialog" :aria-describedby="describedBy"
      :aria-expanded="props.open" :aria-controls="props.open ? props.dialogId : undefined"
      :data-active="props.open && props.active === 'start' || undefined" :value.attr="props.startValue ?? ''"
      :placeholder="props.placeholder ?? '请选择日期'" :tabindex="props.tabindex" :form="props.form" :disabled="props.disabled"
      @keydown="keydown($event, 'start')" />
    <span class="ym-date-picker__separator" aria-hidden="true">–</span>
    <input ref="end" class="ym-input__control" role="combobox" type="text" readonly
      aria-label="结束日期" aria-haspopup="dialog" :aria-describedby="describedBy"
      :aria-expanded="props.open" :aria-controls="props.open ? props.dialogId : undefined"
      :data-active="props.open && props.active === 'end' || undefined" :value.attr="props.endValue ?? ''"
      :placeholder="props.placeholder ?? '请选择日期'" :tabindex="props.tabindex" :form="props.form" :disabled="props.disabled"
      @keydown="keydown($event, 'end')" />
    <YmIcon name="calendar" />
    <input v-if="props.name" type="hidden" :name="props.name" :form="props.form" :disabled="props.disabled" :value="props.formValue" />
  </span>
</template>
