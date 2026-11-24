<script setup lang="ts" vapor>
import { computed, ref, watch } from 'vue'
import { YmInput, type InputProps } from '../input'

const props = defineProps<{
  value: string | number
  label: string
  min?: number
  max?: number
  unit?: string
  maxlength?: number
  disabled?: boolean
  inputProps?: InputProps
}>()
const emit = defineEmits<{ commit: [value: string | number] }>()
const draft = ref<string | null>(null)
const text = computed(() => draft.value ?? `${props.value}${props.unit ?? ''}`)
watch(() => props.value, () => { draft.value = null })

function commit() {
  if (draft.value === null) return
  const raw = draft.value.trim()
  draft.value = null
  if (props.disabled || props.inputProps?.readonly || !raw) return
  if (props.max === undefined) {
    if (raw !== props.value) emit('commit', raw)
    return
  }
  const number = Number(raw.replace(/[%°]$/, ''))
  if (!Number.isFinite(number)) return
  const value = Math.max(props.min ?? 0, Math.min(props.max, number))
  if (value !== props.value) emit('commit', value)
}

function keydown(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return
  if (event.key === 'Enter') {
    event.preventDefault()
    commit()
  } else if (props.max !== undefined && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault()
    const current = Number.parseFloat(draft.value ?? String(props.value))
    draft.value = String((Number.isFinite(current) ? current : 0) + (event.key === 'ArrowUp' ? 1 : -1))
    commit()
  }
}
</script>

<template>
  <YmInput v-bind="props.inputProps" align="center" type="text" :model-value="text" :aria-label="props.label"
    :disabled="props.disabled || props.inputProps?.disabled" :maxlength="props.maxlength" :title="text"
    :inputmode="props.max !== undefined ? 'decimal' : 'text'" @update:model-value="draft = $event"
    @blur="commit" @keydown="keydown" />
</template>
