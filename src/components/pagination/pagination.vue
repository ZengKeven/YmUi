<script setup lang="ts" vapor>
import { computed, useModel, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import paginationProps from './props'
import type { PageInfo } from './types'

defineOptions({ name: 'YmPagination' })
const props = defineProps(paginationProps)
const emit = defineEmits<{
  'update:current': [current: number]
  'update:pageSize': [pageSize: number]
  change: [info: PageInfo]
}>()

const current = useModel(props, 'current')
const pageSize = useModel(props, 'pageSize')
const total = computed(() => Number.isFinite(props.total)
  ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.trunc(props.total))) : 0)
const perPage = computed(() => isPageSize(pageSize.value) ? pageSize.value : 10)
const options = computed(() => [...new Set([...props.pageSizeOptions.filter(isPageSize), perPage.value])])
const pageCount = computed(() => pagesFor(perPage.value))
const active = computed(() => Number.isFinite(current.value)
  ? Math.max(1, Math.min(pageCount.value, Math.trunc(current.value))) : 1)

watch([current, active], ([requested, visible]) => {
  if (requested !== visible) current.value = visible
}, { immediate: true })

const pages = computed(() => {
  const last = pageCount.value
  const page = active.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'more-after', last]
  if (page >= last - 3) return [1, 'more-before', last - 4, last - 3, last - 2, last - 1, last]
  return [1, 'more-before', page - 1, page, page + 1, 'more-after', last]
})

function isPageSize(value: number) {
  return Number.isSafeInteger(value) && value > 0
}

function pagesFor(size: number) {
  return Math.max(1, Math.ceil(total.value / size))
}

function selectPage(page: number) {
  const previous = active.value
  if (props.disabled || page === previous || page < 1 || page > pageCount.value) return
  current.value = page
  emit('change', { current: page, previous, pageSize: perPage.value })
}

function changePageSize(event: Event) {
  const size = Number((event.currentTarget as HTMLSelectElement).value)
  if (props.disabled || size === perPage.value || !isPageSize(size)) return
  const previous = active.value
  const page = Math.min(previous, pagesFor(size))
  pageSize.value = size
  if (page !== previous) current.value = page
  emit('change', { current: page, previous, pageSize: size })
}
</script>

<template>
  <nav class="ym-pagination" aria-label="分页" :data-size="props.size">
    <span class="ym-pagination__total">共 {{ total }} 条</span>
    <select class="ym-pagination__size" aria-label="每页条数" :value="perPage"
      :disabled="props.disabled" @change="changePageSize">
      <option v-for="size in options" :key="size" :value="size">{{ size }} 条/页</option>
    </select>
    <div class="ym-pagination__pages">
      <YmButton shape="square" variant="text" aria-label="首页" title="首页"
        :disabled="props.disabled || active === 1" @click="selectPage(1)">
        <template #icon><YmIcon name="first-page" /></template>
      </YmButton>
      <YmButton shape="square" variant="text" aria-label="上一页" title="上一页"
        :disabled="props.disabled || active === 1" @click="selectPage(active - 1)">
        <template #icon><YmIcon name="chevron-left" /></template>
      </YmButton>
      <template v-for="page in pages" :key="page">
        <YmButton v-if="typeof page === 'number'" class="ym-pagination__number"
          :content="String(page)" :variant="page === active ? 'base' : 'text'"
          :aria-label="`第 ${page} 页`" :aria-current="page === active ? 'page' : undefined"
          :disabled="props.disabled" @click="selectPage(page)" />
        <span v-else class="ym-pagination__ellipsis" aria-hidden="true">…</span>
      </template>
      <YmButton shape="square" variant="text" aria-label="下一页" title="下一页"
        :disabled="props.disabled || active === pageCount" @click="selectPage(active + 1)">
        <template #icon><YmIcon name="chevron-right" /></template>
      </YmButton>
      <YmButton shape="square" variant="text" aria-label="尾页" title="尾页"
        :disabled="props.disabled || active === pageCount" @click="selectPage(pageCount)">
        <template #icon><YmIcon name="last-page" /></template>
      </YmButton>
    </div>
  </nav>
</template>
