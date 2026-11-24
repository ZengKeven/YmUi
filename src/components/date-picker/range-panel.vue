<script setup lang="ts" vapor>
import { nextTick, provide, ref, useTemplateRef, watch } from 'vue'
import { YmCalendar, type CalendarCell, type CalendarProps } from '../calendar'
import { dateKey, localDate, parseDate } from '../calendar/dates'
import { calendarPairKey } from '../calendar/range'
import type { DateRangeValue } from './types'

const props = defineProps<{
  value: DateRangeValue | null
  showLunar?: boolean
  showHoliday?: boolean
  firstDayOfWeek?: CalendarProps['firstDayOfWeek']
  disabledDate?: CalendarProps['disabledDate']
}>()
const emit = defineEmits<{ select: [date: string] }>()
defineSlots<{ cell?: (cell: CalendarCell) => unknown }>()
const calendars = useTemplateRef<{ focus(date?: string): void }[]>('calendars')

function adjacentMonth(date: Date, step: number) {
  return dateKey(localDate(date.getFullYear(), date.getMonth() + step, 1))
}

function initialCursors(): [string, string] {
  const start = parseDate(props.value?.[0]) ?? new Date()
  const first = dateKey(start)
  const end = props.value?.[1]
  if (end && end.slice(0, 7) > first.slice(0, 7)) return [first, end]
  if (first.startsWith('9999-12')) return [adjacentMonth(start, -1), first]
  return [first, adjacentMonth(start, 1)]
}

const cursors = ref(initialCursors())
watch([() => props.value?.[0], () => props.value?.[1]], () => { cursors.value = initialCursors() })

function navigate(fromMonth: string, date: Date, moveFocus: boolean) {
  const next = dateKey(date)
  const month = next.slice(0, 7)
  const side = fromMonth === cursors.value[0].slice(0, 7) ? 0 : 1
  const other = side === 0 ? 1 : 0
  const otherMonth = cursors.value[other].slice(0, 7)
  // 键盘穿过月末时，将焦点交给已显示目标日期的日历，保留两个面板的位置。
  if (moveFocus && month === otherMonth) {
    calendars.value?.[other].focus(next)
    return
  }
  if (side === 0) {
    if (month === '9999-12') cursors.value = [adjacentMonth(date, -1), next]
    else cursors.value = [next, month >= otherMonth ? adjacentMonth(date, 1) : cursors.value[1]]
  } else {
    if (month === '0001-01') cursors.value = [next, adjacentMonth(date, 1)]
    else cursors.value = [month <= otherMonth ? adjacentMonth(date, -1) : cursors.value[0], next]
  }
  if (moveFocus) nextTick(() => focusDate(next, side))
}

provide(calendarPairKey, {
  navigate,
  allowsMonth(fromMonth, month) {
    return fromMonth === cursors.value[0].slice(0, 7) ? month < '9999-12' : month > '0001-01'
  },
})

function focusDate(date: string | undefined, side: 0 | 1) {
  const matching = date && cursors.value.findIndex(cursor => cursor.slice(0, 7) === date.slice(0, 7))
  if (matching === 0 || matching === 1) calendars.value?.[matching].focus(date)
  else calendars.value?.[side].focus()
}

function focus(endpoint: 'start' | 'end') {
  const side = endpoint === 'start' ? 0 : 1
  const endpointDate = props.value?.[side]
  if (endpointDate) {
    const month = endpointDate.slice(0, 7)
    if (cursors.value.some(cursor => cursor.startsWith(month))) focusDate(endpointDate, side)
    else navigate(cursors.value[side].slice(0, 7), parseDate(endpointDate)!, true)
    return
  }
  const cursor = parseDate(cursors.value[side])!
  if (props.disabledDate?.(cursor)) {
    const first = localDate(cursor.getFullYear(), cursor.getMonth(), 1)
    while (first.getMonth() === cursor.getMonth()) {
      if (!props.disabledDate(first)) {
        focusDate(dateKey(first), side)
        return
      }
      first.setDate(first.getDate() + 1)
    }
  }
  focusDate(cursors.value[side], side)
}
defineExpose({ focus })
</script>

<template>
  <div class="ym-date-picker__calendars">
    <YmCalendar v-for="(cursor, side) in cursors" :key="side" ref="calendars" theme="card" :model-value="cursor"
      :show-lunar="props.showLunar" :show-holiday="props.showHoliday" :first-day-of-week="props.firstDayOfWeek"
      :disabled-date="props.disabledDate" @select="emit('select', $event)">
      <template v-if="$slots.cell" #cell="cell"><slot name="cell" v-bind="cell" /></template>
    </YmCalendar>
  </div>
</template>
