<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { buildTreeRows, visibleTreeRows, type TreeRow } from '../tree-select/tree-data'
import treeProps from './props'
import type { TreeNode, TreeValue } from './types'

defineOptions({ name: 'YmTree' })
const props = defineProps(treeProps)
const emit = defineEmits<{
  'update:modelValue': [value: TreeValue]
  change: [value: TreeValue, node: TreeNode]
}>()

const localValue = ref(props.defaultValue)
const selected = computed(() => props.modelValue === undefined ? localValue.value : props.modelValue)
const query = ref('')
const filtering = computed(() => props.filterable && !!query.value.trim())
const rows = computed(() => buildTreeRows(props.data, []))
const expanded = ref(new Set(props.defaultExpanded))
const foldedMatches = ref(new Set<TreeValue>())

// 搜索展开命中路径，期间的折叠操作仅作用于当前搜索结果。
const matches = computed(() => filtering.value ? visibleTreeRows(rows.value, expanded.value, query.value) : rows.value)
const matchedBranches = computed(() => new Set(matches.value.flatMap(row => row.parent ? [row.parent.option.value] : [])))
const openBranches = computed(() => filtering.value
  ? new Set([...matchedBranches.value].filter(key => !foldedMatches.value.has(key)))
  : expanded.value)
const visible = computed(() => visibleTreeRows(matches.value, openBranches.value, ''))

watch(query, () => foldedMatches.value.clear(), { flush: 'sync' })
watch(() => props.filterable, enabled => { if (!enabled) query.value = '' })

// 定位外部指定的分类。数据刷新但路径相同时，保留用户手动折叠的分支。
const selectedPath = computed(() => {
  const path: TreeValue[] = []
  let row: TreeRow | null | undefined = rows.value.find(row => row.option.value === selected.value)
  while (row) {
    path.push(row.option.value)
    row = row.parent
  }
  return path
})
watch(selectedPath, (path, previous) => {
  if (filtering.value || (previous?.length === path.length && path.every((key, i) => key === previous[i]))) return
  for (const key of path.slice(1)) expanded.value.add(key)
}, { immediate: true })

const list = useTemplateRef<HTMLElement>('list')
const cursor = ref<TreeValue>()
const tabStop = computed(() => visible.value.find(row => row.option.value === cursor.value)
  ?? visible.value.find(row => row.option.value === selected.value) ?? visible.value[0])

function focusRow(row?: TreeRow) {
  if (!row) return
  const el = list.value?.children[visible.value.indexOf(row)]
  if (el instanceof HTMLElement) el.focus()
}

watch(visible, items => {
  const host = list.value
  if (host?.contains(host.ownerDocument.activeElement) && !items.some(row => row.option.value === cursor.value)) {
    nextTick(() => focusRow(tabStop.value))
  }
})

function isBranch(row: TreeRow) {
  return filtering.value ? matchedBranches.value.has(row.option.value) : row.hasChildren
}
function toggle(row: TreeRow) {
  const key = row.option.value
  const keys = filtering.value ? foldedMatches.value : expanded.value
  if (keys.has(key)) keys.delete(key)
  else keys.add(key)
  focusRow(row)
}
function activate(node: TreeNode) {
  if (node.value === selected.value) return
  if (props.modelValue === undefined) localValue.value = node.value
  emit('update:modelValue', node.value)
  emit('change', node.value, node)
}
function navigate(event: KeyboardEvent, row: TreeRow, index: number) {
  if (event.target !== event.currentTarget || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
  const items = visible.value
  switch (event.key) {
    case 'ArrowUp': focusRow(items[index - 1]); break
    case 'ArrowDown': focusRow(items[index + 1]); break
    case 'Home': focusRow(items[0]); break
    case 'End': focusRow(items.at(-1)); break
    case 'ArrowRight':
      if (isBranch(row)) {
        if (openBranches.value.has(row.option.value)) focusRow(items[index + 1])
        else toggle(row)
      }
      break
    case 'ArrowLeft':
      if (isBranch(row) && openBranches.value.has(row.option.value)) toggle(row)
      else focusRow(row.parent ?? undefined)
      break
    case 'Enter':
    case ' ': activate(row.option); break
    default: return
  }
  event.preventDefault()
}
</script>

<template>
  <div class="ym-tree ym-theme" :data-size="props.size">
    <YmInput v-if="props.filterable" v-model="query" class="ym-tree__filter" :placeholder="props.filterPlaceholder"
      :aria-label="props.filterPlaceholder || '过滤节点'" autocomplete="off" />
    <div ref="list" class="ym-tree__list" role="tree" :aria-label="($attrs['aria-label'] as string) ?? '树形控件'"
      :aria-labelledby="$attrs['aria-labelledby'] as string | undefined"
      @focusout="!list?.contains($event.relatedTarget as Node | null) && (cursor = undefined)">
      <div v-for="(row, index) in visible" :key="row.option.value" class="ym-tree__node" role="treeitem"
        :tabindex="tabStop === row ? 0 : -1" :aria-level="row.level" :aria-label="row.option.label"
        :aria-selected="row.option.value === selected" :aria-expanded="isBranch(row) ? openBranches.has(row.option.value) : undefined"
        :style="{ '--ym-tree-level': row.level }" @focus="cursor = row.option.value"
        @click="activate(row.option)" @keydown="navigate($event, row, index)">
        <button v-if="isBranch(row)" class="ym-tree__toggle" type="button" tabindex="-1"
          :aria-label="`${openBranches.has(row.option.value) ? '收起' : '展开'} ${row.option.label}`"
          @mousedown.prevent @click.stop="toggle(row)">
          <YmIcon :name="openBranches.has(row.option.value) ? 'chevron-down' : 'chevron-right'" />
        </button>
        <span v-else class="ym-tree__toggle" aria-hidden="true" />
        <span class="ym-tree__label">{{ row.option.label }}</span>
      </div>
    </div>
    <div v-if="!visible.length" class="ym-tree__empty" role="status">{{ filtering && rows.length ? '无匹配节点' : '暂无数据' }}</div>
  </div>
</template>
