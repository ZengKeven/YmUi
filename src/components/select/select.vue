<script setup lang="ts" vapor generic="Option extends SelectOption = SelectOption, Multiple extends boolean = false, Clearable extends boolean = false">
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import type { FormResetType } from '../form/types'
import { computed, nextTick, provide, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmCheckbox } from '../checkbox'
import { checkboxGroupKey } from '../checkbox/context'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmLoading } from '../loading'
import { YmPopup } from '../popup'
import { YmTag } from '../tag'
import { useSelectOptions } from './options'
import selectProps from './props'
import type { SelectKey, SelectOption, SelectValue } from './types'

defineOptions({ name: 'YmSelect', inheritAttrs: false })
const props = defineProps(selectProps)
const { disabled, nativeDisabled, readOnly } = useFormControlState(props, 'choice')
// 下拉选项由 Select 管理，即使它位于外部复选框组内。
provide(checkboxGroupKey, undefined)
type Choice = Multiple extends true ? Option['value'][] : Option['value'] | (Clearable extends true ? null : never)
const emit = defineEmits<{
  'update:modelValue': [value: Choice]
  change: [value: Choice]
  clear: [context: { e: MouseEvent }]
  search: [query: string]
}>()
defineSlots<{
  option?: (scope: { option: Option; index: number; selected: boolean; disabled: boolean }) => unknown
}>()

const listId = `ym-select-${useId()}`
const editor = useTemplateRef<{ focus(): void }>('editor')
const control = useTemplateRef<HTMLElement>('control')
const list = useTemplateRef<HTMLElement>('list')
const open = ref(false)
const query = ref('')
const searchable = computed(() => Boolean(props.filterable || props.filter || props.remoteMethod))
const { options, status, remoteOptions } = useSelectOptions(props, open, query)
const initial = props.defaultValue ?? null
const local = shallowRef<SelectValue>(initial)
const selection = computed(() => {
  const value = props.modelValue === undefined ? local.value : props.modelValue
  if (Array.isArray(value)) return props.multiple ? value : value.slice(0, 1)
  return value == null ? [] : [value]
})
const selected = computed(() => new Set(selection.value))
const atLimit = computed(() => props.multiple && props.max > 0 && selected.value.size >= props.max)

// 仅缓存当前选中的选项，切换远程结果后仍可回显标签。
const selectedItems = computed<SelectOption[]>((previous) => {
  const known = new Map<SelectKey, SelectOption>()
  for (const item of previous ?? []) known.set(item.value, item)
  for (const item of props.options) known.set(item.value, item)
  if (props.remoteMethod) for (const item of remoteOptions.value) known.set(item.value, item)
  return selection.value.map(value => known.get(value) ?? { value, label: String(value) })
})
const label = computed(() => props.multiple ? '' : selectedItems.value[0]?.label ?? '')
const inputText = computed(() => open.value && searchable.value ? query.value : label.value)
const placeholder = computed(() => props.multiple && selectedItems.value.length ? '' : label.value || props.placeholder)
const lockedValues = computed(() => props.multiple ? selectedItems.value.filter(item => item.disabled).map(item => item.value) : [])
const hasRemovableValue = computed(() => selection.value.length > lockedValues.value.length)
const showClear = computed(() => props.clearable && !disabled.value && (hasRemovableValue.value || query.value.length > 0))

function blocked(option: SelectOption) {
  return Boolean(option.disabled || (atLimit.value && !selected.value.has(option.value)))
}
const enabled = computed(() => options.value.filter(option => !blocked(option)))
const active = ref<SelectKey | null>(null)
const activeIndex = computed(() => options.value.findIndex(option => option.value === active.value))
watch([open, enabled], ([isOpen, items]) => {
  if (!isOpen) active.value = null
  else if (!items.some(item => item.value === active.value)) {
    active.value = (items.find(item => selected.value.has(item.value)) ?? items[0])?.value ?? null
  }
}, { flush: 'sync' })

function setOpen(next: boolean) {
  open.value = next && !disabled.value
  if (!open.value) query.value = ''
}
watch(disabled, disabled => { if (disabled) setOpen(false) })
watch(searchable, allowed => { if (!allowed) query.value = '' })

function resetSelection(type: FormResetType) {
  local.value = type === 'initial' ? initial : null
  setOpen(false)
}
onFormFieldReset(resetSelection)
watch([control, () => props.form], ([element], _, onCleanup) => {
  const form = element?.querySelector('input')?.form
  if (!form) return
  const reset = (event: Event) => {
    nextTick(() => {
      if (event.defaultPrevented || control.value !== element) return
      resetSelection('initial')
    })
  }
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })

function activate(toggle: boolean) {
  if (disabled.value) return
  const next = toggle ? !open.value : true
  editor.value?.focus()
  setOpen(next)
}

function search(text: string) {
  if (disabled.value || !searchable.value) return
  setOpen(true)
  query.value = text
  emit('search', text)
}

function beforeInput(e: Event) {
  if (open.value || !searchable.value || disabled.value) return
  // 确认单选后输入框可能仍有焦点。键入、粘贴或输入法输入均从新查询开始。
  const input = e.target as HTMLInputElement
  input.select()
  setOpen(true)
}

function updateSelection(next: SelectValue) {
  if (props.modelValue === undefined) local.value = next
  emit('update:modelValue', next as Choice)
  emit('change', next as Choice)
}

function clear(e: MouseEvent) {
  e.stopPropagation()
  if (!showClear.value) return
  const hadQuery = query.value.length > 0
  editor.value?.focus()
  setOpen(false)
  if (hasRemovableValue.value) updateSelection(props.multiple ? [...lockedValues.value] : null)
  if (hadQuery) emit('search', '')
  emit('clear', { e })
}

function leaveControl(e: FocusEvent) {
  if (!(e.relatedTarget instanceof Node && control.value?.contains(e.relatedTarget))) setOpen(false)
}

function keepEditorFocus(e: MouseEvent) {
  if (e.target instanceof Element && e.target.closest('.ym-select__clear')) e.preventDefault()
}

function choose(option: SelectOption) {
  if (disabled.value || blocked(option)) return
  const exists = selected.value.has(option.value)
  if (props.multiple || !exists) {
    let next: SelectValue = option.value
    if (props.multiple) next = exists ? selection.value.filter(value => value !== option.value) : [...selection.value, option.value]
    updateSelection(next)
  }
  if (!props.multiple) setOpen(false)
}

function move(direction: number) {
  const items = enabled.value
  if (!items.length) return
  const index = items.findIndex(item => item.value === active.value)
  const start = index < 0 && direction < 0 ? 0 : index
  active.value = items[(start + direction + items.length) % items.length].value
  nextTick(scrollToActive)
}

function scrollToActive() {
  list.value?.children[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
}
// YmPopup 在挂载后的更新队列中进入顶层，随后才能滚动到已选项。
watch([list, options], () => nextTick(scrollToActive), { flush: 'post' })

function keydown(e: KeyboardEvent) {
  if (disabled.value || e.isComposing || e.keyCode === 229) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (open.value) move(e.key === 'ArrowDown' ? 1 : -1)
    else {
      setOpen(true)
      if (e.key === 'ArrowUp') active.value = enabled.value.at(-1)?.value ?? null
    }
  } else if (e.key === 'Enter' || (e.key === ' ' && !searchable.value)) {
    e.preventDefault()
    if (!open.value) setOpen(true)
    else if (activeIndex.value >= 0) choose(options.value[activeIndex.value])
  }
}
</script>

<template>
  <YmPopup v-bind="props.popupProps" class="ym-select" :class="props.class" :style="props.style"
    :size="props.size ?? props.popupProps?.size" trigger="manual" :visible="open" :disabled="disabled"
    :overlay-class-name="['ym-select__panel', props.popupProps?.overlayClassName]" @update:visible="setOpen">
    <div ref="control" class="ym-select__control" :data-open="open || undefined" :data-disabled="nativeDisabled || undefined"
      :data-borderless="props.borderless || undefined" @click="activate(!searchable)" @focusout="leaveControl" @mousedown="keepEditorFocus">
      <div class="ym-select__values">
        <template v-if="props.multiple">
          <YmTag v-for="item in selectedItems" :key="item.value" :content="item.label"
            variant="light" closable :disabled="disabled || item.disabled"
            @mousedown.prevent @close="choose(item)" />
        </template>
        <YmInput ref="editor" v-bind="$attrs" type="text" class="ym-select__field" role="combobox" autocomplete="off"
          :model-value="inputText" :placeholder="placeholder" :disabled="nativeDisabled" :readonly="readOnly || !searchable" :form="props.form"
          :aria-expanded="open" aria-haspopup="listbox" :aria-controls="open ? listId : undefined"
          :aria-activedescendant="open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined"
          :aria-autocomplete="searchable ? 'list' : 'none'"
          @update:model-value="search" @beforeinput="beforeInput" @focus="searchable && setOpen(true)"
          @keydown="keydown" />
      </div>
      <YmButton v-if="showClear" class="ym-select__clear" type="button" variant="text" theme="default" shape="square"
        aria-label="清空选择" @click="clear"><YmIcon name="close" /></YmButton>
      <span class="ym-select__arrow" aria-hidden="true" @mousedown.prevent @click.stop="activate(true)">
        <YmIcon :name="open ? 'chevron-up' : 'chevron-down'" />
      </span>
    </div>
    <template v-if="props.name">
      <input v-for="value in selection" :key="value" type="hidden"
        :name="props.name" :value="value" :form="props.form" :disabled="nativeDisabled" />
    </template>
    <template #content>
      <div :id="listId" ref="list" role="listbox" :aria-multiselectable="props.multiple || undefined"
        :aria-busy="status === 'loading' || undefined" :aria-label="props.placeholder">
        <div v-for="(item, index) in options" :id="`${listId}-${index}`" :key="item.value" role="option"
          class="ym-select__option" :data-active="active === item.value || undefined"
          :aria-labelledby="`${listId}-${index}-label`"
          :aria-selected="selected.has(item.value)" :aria-disabled="blocked(item) || undefined"
          @pointermove="!blocked(item) && (active = item.value)" @mousedown.prevent @click="choose(item)">
          <span v-if="props.multiple" class="ym-select__option-check" @click.stop>
            <YmCheckbox :model-value="selected.has(item.value)" :disabled="blocked(item)" :tabindex="-1"
              :aria-labelledby="`${listId}-${index}-label`" @update:model-value="choose(item)" />
          </span>
          <span :id="`${listId}-${index}-label`" class="ym-select__option-label">
            <slot name="option" :option="item as Option" :index="index" :selected="selected.has(item.value)" :disabled="blocked(item)">{{ item.label }}</slot>
          </span>
        </div>
      </div>
      <div v-if="!options.length" class="ym-select__status" role="status">
        <YmLoading v-if="status === 'loading'" text="加载中" />
        <template v-else>{{ status === 'error' ? '加载失败' : '暂无选项' }}</template>
      </div>
    </template>
  </YmPopup>
</template>
