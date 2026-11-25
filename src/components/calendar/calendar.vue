<script setup lang="ts" vapor>
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { computed, inject, nextTick, onMounted, onScopeDispose, provide, ref, useId, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmSelect } from '../select'
import { addDays, dateKey, inMonth, localDate, lunarLabel, parseDate } from './dates'
import { holidayFor } from './holidays'
import calendarProps from './props'
import { calendarPairKey, calendarRangeKey } from './range'
import type { CalendarCell } from './types'

defineOptions({ name: 'YmCalendar' })
const props = defineProps(calendarProps)
const { disabled } = useFormControlState(props, 'choice')
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  select: [value: string]
  monthChange: [month: string]
}>()
defineSlots<{ cell?: (cell: CalendarCell) => unknown }>()

const range = inject(calendarRangeKey, undefined)
const pair = inject(calendarPairKey, undefined)
// 日期格插槽中嵌套的其他日历拥有各自的选区。
if (range) provide(calendarRangeKey, undefined)
if (pair) provide(calendarPairKey, undefined)
const local = ref(props.defaultValue)
onFormFieldReset(type => { local.value = type === 'initial' ? props.defaultValue : undefined })
const selected = computed(() => props.modelValue === undefined ? local.value : props.modelValue)
const today = ref(dateKey(new Date()))
let midnightTimer: ReturnType<typeof setTimeout> | undefined
function refreshToday() {
  const now = new Date()
  today.value = dateKey(now)
  midnightTimer = setTimeout(refreshToday, addDays(now, 1).getTime() - now.getTime())
}
onMounted(refreshToday)
onScopeDispose(() => clearTimeout(midnightTimer))

// 光标决定正在浏览的月，翻月和键盘移动都不会写入选中值。
const cursor = ref(parseDate(selected.value) ?? new Date())
const cursorKey = computed(() => dateKey(cursor.value))
const year = computed(() => cursor.value.getFullYear())
const month = computed(() => cursor.value.getMonth())
const shownMonth = computed(() => cursorKey.value.slice(0, 7))
const isCard = computed(() => props.theme === 'card')
const toolbarOrder = computed(() => isCard.value
  ? ['month', 'year', 'previous', 'today', 'next']
  : ['previous', 'year', 'month', 'next', 'today'])
const grid = useTemplateRef<HTMLElement>('grid')
const calendarId = `ym-calendar-${useId()}`

function focus(date?: string) {
  const day = parseDate(date)
  if (day && date !== cursorKey.value) {
    placeCursor(day, true)
    return
  }
  const button = grid.value?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
  button?.focus()
}
defineExpose({ focus })

function placeCursor(date: Date, moveFocus = false) {
  if (date.getFullYear() < 1 || date.getFullYear() > 9999) return
  cursor.value = date
  if (moveFocus) nextTick(focus)
}
function navigate(date: Date, moveFocus = false) {
  if (date.getFullYear() < 1 || date.getFullYear() > 9999) return
  if (pair && dateKey(date).slice(0, 7) !== shownMonth.value) {
    pair.navigate(shownMonth.value, date, moveFocus)
  } else {
    placeCursor(date, moveFocus)
  }
}
function monthAllowed(targetYear: number, targetMonth: number) {
  const date = localDate(targetYear, targetMonth, 1)
  return date.getFullYear() >= 1 && date.getFullYear() <= 9999 && (pair?.allowsMonth(shownMonth.value, dateKey(date).slice(0, 7)) ?? true)
}
watch(selected, value => {
  const date = parseDate(value)
  if (date && dateKey(date) !== cursorKey.value) {
    const element = grid.value
    placeCursor(date, !!element?.contains(element.ownerDocument.activeElement))
  }
})
watch(shownMonth, value => emit('monthChange', value))

const years = computed(() => {
  const first = Math.max(1, year.value - 10)
  const last = Math.min(9999, year.value + 10)
  return Array.from({ length: last - first + 1 }, (_, i) => ({ value: first + i, label: `${first + i}${isCard.value ? '' : '年'}` }))
})
const months = computed(() => Array.from({ length: 12 }, (_, i) => ({
  value: i + 1, label: `${i + 1}${isCard.value ? ' 月' : '月'}`, disabled: !monthAllowed(year.value, i),
})))
const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
const weekdays = computed(() => Array.from({ length: 7 }, (_, i) => weekdayNames[(props.firstDayOfWeek + i) % 7]))
const weeks = computed(() => {
  const first = localDate(year.value, month.value, 1)
  const offset = (first.getDay() - props.firstDayOfWeek + 7) % 7
  return Array.from({ length: 6 }, (_, row) => Array.from({ length: 7 }, (_, column) => {
    const date = addDays(first, row * 7 + column - offset)
    const value = dateKey(date)
    const outsideRange = date.getFullYear() < 1 || date.getFullYear() > 9999
    const inMonth = date.getMonth() === month.value
    const spillover = !!pair && !inMonth
    const holiday = props.showHoliday ? holidayFor(value) : undefined
    const note = holiday?.firstDay ? holiday.name : props.showLunar && !outsideRange ? lunarLabel(date) : undefined
    const id = `${calendarId}-${value}`
    const descriptionIds = [note && `${id}-note`, holiday && `${id}-badge`].filter(Boolean).join(' ')
    return {
      date, value, note, holiday, id, descriptionIds, inMonth, spillover,
      today: !spillover && value === today.value, selected: !spillover && (range?.value?.selected(value) ?? (value === selected.value)),
      blocked: spillover || outsideRange || !!props.disabledDate?.(date), outsideRange,
    }
  }))
})

function browse(targetYear: number, targetMonth: number) {
  if (!disabled.value) navigate(inMonth(cursor.value, targetYear, targetMonth))
}

function choose(cell: CalendarCell & { blocked: boolean }) {
  if (disabled.value || cell.blocked) return
  placeCursor(cell.date, !cell.inMonth)
  if (!cell.selected) {
    if (props.modelValue === undefined) local.value = cell.value
    emit('update:modelValue', cell.value)
    emit('change', cell.value)
  }
  emit('select', cell.value)
}

function keydown(event: KeyboardEvent, date: Date) {
  if (disabled.value || event.altKey || event.ctrlKey || event.metaKey) return
  const weekOffset = (date.getDay() - props.firstDayOfWeek + 7) % 7
  let target: Date
  switch (event.key) {
    case 'ArrowLeft': target = addDays(date, -1); break
    case 'ArrowRight': target = addDays(date, 1); break
    case 'ArrowUp': target = addDays(date, -7); break
    case 'ArrowDown': target = addDays(date, 7); break
    case 'Home': target = addDays(date, -weekOffset); break
    case 'End': target = addDays(date, 6 - weekOffset); break
    case 'PageUp': target = inMonth(date, date.getFullYear(), date.getMonth() - 1); break
    case 'PageDown': target = inMonth(date, date.getFullYear(), date.getMonth() + 1); break
    default: return
  }
  event.preventDefault()
  navigate(target, true)
}
</script>

<template>
  <section class="ym-calendar" :data-theme="props.theme" :data-size="props.size"
    :data-show-lunar="props.showLunar || undefined" :data-show-holiday="props.showHoliday || undefined">
    <div class="ym-calendar__toolbar">
      <template v-for="control in toolbarOrder" :key="control">
        <YmSelect v-if="control === 'month'" class="ym-calendar__month" aria-label="月份" :options="months"
          :model-value="month + 1" :disabled="disabled" @update:model-value="browse(year, $event - 1)" />
        <YmSelect v-else-if="control === 'year'" class="ym-calendar__year" aria-label="年份" :options="years"
          :model-value="year" :disabled="disabled" @update:model-value="browse($event, month)" />
        <YmButton v-else-if="control === 'previous'" variant="text" shape="square" aria-label="上个月" title="上个月"
          :disabled="disabled || !monthAllowed(year, month - 1)" @click="browse(year, month - 1)">
          <template #icon><YmIcon name="chevron-left" /></template>
        </YmButton>
        <YmButton v-else-if="control === 'next'" variant="text" shape="square" aria-label="下个月" title="下个月"
          :disabled="disabled || !monthAllowed(year, month + 1)" @click="browse(year, month + 1)">
          <template #icon><YmIcon name="chevron-right" /></template>
        </YmButton>
        <YmButton v-else class="ym-calendar__today" variant="text" :shape="isCard ? 'square' : 'rectangle'"
          aria-label="今天" title="今天" :disabled="disabled" @click="navigate(new Date())">
          <template v-if="isCard" #icon>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2" />
            </svg>
          </template>
          <template v-if="!isCard">今天</template>
        </YmButton>
      </template>
    </div>
    <div ref="grid" class="ym-calendar__grid" role="grid" :aria-label="`${year}年${month + 1}月`"
      :aria-multiselectable="range ? true : undefined" @pointerleave="range?.preview(null)">
      <div class="ym-calendar__week" role="row">
        <span v-for="label in weekdays" :key="label" class="ym-calendar__weekday" role="columnheader"
          :aria-label="`周${label}`">{{ isCard ? label : `周${label}` }}</span>
      </div>
      <div v-for="week in weeks" :key="week[0].value" class="ym-calendar__week" role="row">
        <div v-for="cell in week" :key="cell.value" class="ym-calendar__cell" role="gridcell" :aria-selected="cell.selected">
          <button class="ym-calendar__day" type="button" :aria-label="cell.value" :aria-pressed="cell.selected"
            :data-range="cell.spillover ? undefined : range?.position(cell.value)" :aria-hidden="cell.spillover || undefined"
            @pointerenter="range?.preview(cell.blocked ? null : cell.value)" @focus="range?.preview(cell.blocked ? null : cell.value)"
            :aria-describedby="cell.descriptionIds || undefined"
            :data-outside="!cell.inMonth || undefined" :aria-current="cell.today ? 'date' : undefined"
            :disabled="disabled || cell.outsideRange || cell.spillover" :aria-disabled="cell.blocked || undefined"
            :tabindex="cell.value === cursorKey ? 0 : -1" @keydown="keydown($event, cell.date)" @click="choose(cell)">
            <span class="ym-calendar__day-heading">
              <span class="ym-calendar__day-content">
                <slot name="cell" :date="cell.date" :value="cell.value" :today="cell.today" :selected="cell.selected" :in-month="cell.inMonth">
                  <span class="ym-calendar__number">{{ cell.date.getDate() }}</span>
                </slot>
              </span>
              <span v-if="cell.holiday" :id="`${cell.id}-badge`" class="ym-calendar__badge"
                :data-workday="cell.holiday.workday || undefined" :title="cell.holiday.name"
                :aria-label="cell.holiday.workday ? '补班' : '放假'">{{ cell.holiday.workday ? '班' : '休' }}</span>
            </span>
            <span v-if="cell.note" :id="`${cell.id}-note`"
              :class="cell.holiday?.firstDay ? 'ym-calendar__holiday-name' : 'ym-calendar__lunar'">{{ cell.note }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
