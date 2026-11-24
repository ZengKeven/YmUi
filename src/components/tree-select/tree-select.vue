<script setup lang="ts" vapor generic="Key extends SelectKey = SelectKey, Multiple extends boolean = false">
import { computed, nextTick, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { YmCheckbox } from '../checkbox'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmPopup } from '../popup'
import type { SelectKey } from '../select'
import { YmTag } from '../tag'
import treeSelectProps from './props'
import { buildTreeRows, visibleTreeRows, type TreeRow } from './tree-data'
import type { TreeSelectValue } from './types'

defineOptions({ name: 'YmTreeSelect', inheritAttrs: false })
const props = defineProps(treeSelectProps)
type Choice = Multiple extends true ? Key[] : Key
const emit = defineEmits<{
  'update:modelValue': [value: Choice]
  change: [value: Choice]
  search: [query: string]
}>()

const treeId = `ym-tree-select-${useId()}`
const editor = useTemplateRef<{ focus(): void }>('editor')
const control = useTemplateRef<HTMLElement>('control')
const tree = useTemplateRef<HTMLElement>('tree')
const open = ref(false)
const query = ref('')
const expanded = ref(new Set<SelectKey>())
const foldedMatches = ref(new Set<SelectKey>())
const activeKey = ref<SelectKey | null>(null)
const rows = computed(() => buildTreeRows(props.options, props.disabledLevels))
const byKey = computed(() => new Map(rows.value.map(row => [row.option.value, row])))

const initial = props.defaultValue ?? null
const local = shallowRef<TreeSelectValue>(initial)
const selection = computed(() => {
  const value = props.modelValue === undefined ? local.value : props.modelValue
  if (Array.isArray(value)) return props.multiple ? value : value.slice(0, 1)
  return value == null ? [] : [value]
})
const selected = computed(() => new Set(selection.value))
const labelFor = (key: SelectKey) => byKey.value.get(key)?.option.label ?? String(key)
const singleLabel = computed(() => !props.multiple && selection.value.length ? labelFor(selection.value[0]) : '')
const inputText = computed(() => open.value && props.filterable ? query.value : singleLabel.value)

// 搜索使用自己的展开状态，清空关键词即可回到原来的树。
const filtering = computed(() => Boolean(props.filterable && query.value.trim()))
const matches = computed(() => filtering.value ? visibleTreeRows(rows.value, expanded.value, query.value) : rows.value)
const matchedBranches = computed(() => new Set(matches.value.flatMap(row => row.parent ? [row.parent.option.value] : [])))
const expandedKeys = computed(() => filtering.value
  ? new Set([...matchedBranches.value].filter(key => !foldedMatches.value.has(key)))
  : expanded.value)
const visible = computed(() => visibleTreeRows(matches.value, expandedKeys.value, ''))
const activeIndex = computed(() => visible.value.findIndex(row => row.option.value === activeKey.value))
const activeRow = computed(() => visible.value[activeIndex.value])
const nodeId = (row: TreeRow) => `${treeId}-node-${row.index}`
const isBranch = (row: TreeRow) => filtering.value ? matchedBranches.value.has(row.option.value) : row.hasChildren

function setOpen(next: boolean) {
  if (next && props.disabled) return
  if (next && !open.value) {
    const current = byKey.value.get(selection.value[0])
    for (let parent = current?.parent; parent; parent = parent.parent) expanded.value.add(parent.option.value)
    activeKey.value = current?.option.value ?? null
  }
  open.value = next
  if (!next) query.value = ''
}
watch(() => props.disabled, disabled => { if (disabled) setOpen(false) })
watch(() => props.filterable, filterable => { if (!filterable) query.value = '' })
watch(query, () => foldedMatches.value.clear(), { flush: 'sync' })
watch([visible, open], ([items, isOpen]) => {
  if (!isOpen) activeKey.value = null
  else if (!items.some(row => row.option.value === activeKey.value)) activeKey.value = items[0]?.option.value ?? null
}, { flush: 'sync' })

function focusAndOpen(toggle: boolean) {
  if (props.disabled) return
  const next = toggle ? !open.value : true
  editor.value?.focus()
  setOpen(next)
}

function search(text: string) {
  if (!props.filterable || props.disabled) return
  setOpen(true)
  query.value = text
  emit('search', text)
}

function beforeInput(event: Event) {
  if (!open.value && props.filterable && !props.disabled) {
    (event.target as HTMLInputElement).select()
    setOpen(true)
  }
}

function choose(key: SelectKey) {
  if (props.disabled || byKey.value.get(key)?.disabled) return
  const exists = selected.value.has(key)
  if (props.multiple || !exists) {
    let next: TreeSelectValue = key
    if (props.multiple) next = exists ? selection.value.filter(value => value !== key) : [...selection.value, key]
    if (props.modelValue === undefined) local.value = next
    emit('update:modelValue', next as Choice)
    emit('change', next as Choice)
  }
  if (!props.multiple) setOpen(false)
}

function toggleBranch(row: TreeRow) {
  const key = row.option.value
  activeKey.value = key
  const changed = filtering.value ? foldedMatches.value : expanded.value
  if (changed.has(key)) changed.delete(key)
  else changed.add(key)
}

function scrollToActive() {
  tree.value?.children[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
}
watch([tree, visible], () => nextTick(scrollToActive), { flush: 'post' })

function keydown(event: KeyboardEvent) {
  if (props.disabled || event.isComposing || event.keyCode === 229) return
  const { key } = event
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) setOpen(true)
    else {
      const index = Math.max(0, Math.min(visible.value.length - 1, activeIndex.value + (key === 'ArrowDown' ? 1 : -1)))
      activeKey.value = visible.value[index]?.option.value ?? null
      nextTick(scrollToActive)
    }
    return
  }
  const row = activeRow.value
  if (key === 'Enter' || (key === ' ' && !props.filterable)) {
    event.preventDefault()
    if (!open.value) setOpen(true)
    else if (row) choose(row.option.value)
  } else if (key === 'Tab') setOpen(false)
  else if (open.value && row && !query.value && (key === 'ArrowLeft' || key === 'ArrowRight')) {
    event.preventDefault()
    const right = key === 'ArrowRight'
    if (isBranch(row) && expandedKeys.value.has(row.option.value) !== right) toggleBranch(row)
    else {
      const next = right ? visible.value[activeIndex.value + 1] : row.parent
      if (next && (!right || next.parent === row)) activeKey.value = next.option.value
    }
    nextTick(scrollToActive)
  }
}

watch([control, () => props.form], ([element], _, onCleanup) => {
  const form = element?.querySelector('input')?.form
  if (!form) return
  const reset = (event: Event) => nextTick(() => {
    if (event.defaultPrevented || control.value !== element) return
    if (props.modelValue === undefined) local.value = initial
    setOpen(false)
  })
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })
</script>

<template>
  <YmPopup class="ym-tree-select" :class="props.class" :style="props.style" :size="props.size" trigger="manual"
    :visible="open" :disabled="props.disabled" overlay-class-name="ym-tree-select__panel" @update:visible="setOpen">
    <div ref="control" class="ym-tree-select__control" :data-open="open || undefined"
      :data-disabled="props.disabled || undefined" :data-borderless="props.borderless || undefined"
      @click="focusAndOpen(!props.filterable)">
      <div class="ym-tree-select__values">
        <template v-if="props.multiple">
          <YmTag v-for="key in selection" :key="key" :content="labelFor(key)" variant="light" closable
            :disabled="props.disabled || byKey.get(key)?.disabled" @mousedown.prevent @close="choose(key)" />
        </template>
        <YmInput ref="editor" v-bind="$attrs" class="ym-tree-select__field" role="combobox" autocomplete="off"
          :model-value="inputText" :placeholder="props.multiple && selection.length ? '' : singleLabel || props.placeholder"
          :disabled="props.disabled" :readonly="!props.filterable" :form="props.form"
          aria-haspopup="tree" :aria-expanded="open" :aria-controls="open ? treeId : undefined"
          :aria-autocomplete="props.filterable ? 'list' : 'none'" :aria-activedescendant="open && activeRow ? nodeId(activeRow) : undefined"
          @update:model-value="search" @beforeinput="beforeInput" @focus="props.filterable && setOpen(true)"
          @blur="setOpen(false)" @keydown="keydown" />
      </div>
      <span class="ym-tree-select__arrow" aria-hidden="true" @mousedown.prevent @click.stop="focusAndOpen(true)">
        <YmIcon :name="open ? 'chevron-up' : 'chevron-down'" />
      </span>
    </div>
    <template v-if="props.name">
      <input v-for="key in selection" :key="key" type="hidden" :name="props.name" :value="key"
        :form="props.form" :disabled="props.disabled" />
    </template>
    <template #content>
      <div :id="treeId" ref="tree" role="tree" :aria-label="props.placeholder" :aria-multiselectable="props.multiple || undefined">
        <div v-for="row in visible" :id="nodeId(row)" :key="row.option.value" class="ym-tree-select__node"
          role="treeitem" :aria-label="row.option.label" :aria-level="row.level" :aria-disabled="row.disabled || undefined"
          :aria-expanded="isBranch(row) ? expandedKeys.has(row.option.value) : undefined"
          :aria-selected="selected.has(row.option.value)" :data-active="activeKey === row.option.value || undefined"
          :style="{ '--ym-tree-level': row.level }" @pointermove="activeKey = row.option.value"
          @mousedown.prevent @click="choose(row.option.value)">
          <button v-if="isBranch(row)" type="button" class="ym-tree-select__toggle" tabindex="-1" aria-disabled="false"
            :aria-label="`${expandedKeys.has(row.option.value) ? '收起' : '展开'} ${row.option.label}`" @click.stop="toggleBranch(row)">
            <YmIcon :name="expandedKeys.has(row.option.value) ? 'chevron-down' : 'chevron-right'" />
          </button>
          <span v-else class="ym-tree-select__toggle" aria-hidden="true" />
          <span v-if="props.multiple" @click.stop>
            <YmCheckbox :model-value="selected.has(row.option.value)" :disabled="row.disabled" :aria-label="row.option.label"
              :tabindex="-1" @update:model-value="choose(row.option.value)" />
          </span>
          <span class="ym-tree-select__label">{{ row.option.label }}</span>
          <YmIcon v-if="!props.multiple && selected.has(row.option.value)" name="success" />
        </div>
      </div>
      <div v-if="!visible.length" class="ym-tree-select__status" role="status">暂无选项</div>
    </template>
  </YmPopup>
</template>
