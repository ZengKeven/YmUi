<script setup lang="ts" vapor>
import { computed, onScopeDispose, useId, useTemplateRef, watchPostEffect } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import type { MenuItem, MenuValue } from './types'

const props = defineProps<{
  item: MenuItem
  collapsed: boolean
  selected?: MenuValue
  expanded: boolean
  popupOpen: boolean
}>()
const emit = defineEmits<{ select: [value: MenuValue]; toggle: []; open: []; close: [] }>()
const branch = useTemplateRef<HTMLLIElement>('branch')
const panel = useTemplateRef<HTMLDivElement>('panel')
const panelId = useId()
const group = computed(() => Boolean(props.item.children?.length))
const open = computed(() => props.collapsed ? props.popupOpen : group.value && props.expanded)
const current = computed(() => !group.value && props.selected === props.item.value)

let leaveTimer: ReturnType<typeof setTimeout> | undefined
function showPopup() {
  clearTimeout(leaveTimer)
  if (props.collapsed) emit('open')
}
function leaveBranch(event: PointerEvent) {
  clearTimeout(leaveTimer)
  if (props.popupOpen && event.pointerType !== 'touch' && !panel.value?.contains(panel.value.ownerDocument.activeElement)) {
    leaveTimer = setTimeout(() => emit('close'), 140)
  }
}
onScopeDispose(() => clearTimeout(leaveTimer))

function dismiss(returnFocus = false) {
  if (!props.popupOpen) return
  if (returnFocus) branch.value?.querySelector<HTMLElement>('.ym-menu__item')?.focus({ preventScroll: true })
  emit('close')
}
function onBlur(event: FocusEvent) {
  if (!branch.value?.contains(event.relatedTarget as Node | null)) dismiss()
}
function select(value: MenuValue) {
  dismiss(true)
  emit('select', value)
}
function activate() {
  if (!group.value) select(props.item.value)
  else if (props.collapsed) showPopup()
  else emit('toggle')
}

watchPostEffect(onCleanup => {
  const host = branch.value
  const popup = panel.value
  const anchor = host?.firstElementChild
  if (!props.collapsed || !props.popupOpen || !host || !popup || !anchor) return
  const doc = host.ownerDocument
  // 原生顶层浮层保持在菜单 DOM 子树内，既继承主题也能越过滚动侧栏。
  popup.popover = 'manual'
  popup.showPopover()
  const position = () => {
    const rect = anchor.getBoundingClientRect()
    const width = doc.documentElement.clientWidth
    const height = doc.documentElement.clientHeight
    const rightSpace = width - rect.right
    const left = rightSpace >= popup.offsetWidth || rightSpace >= rect.left ? rect.right : rect.left - popup.offsetWidth
    popup.style.left = `${Math.max(0, Math.min(left, width - popup.offsetWidth))}px`
    popup.style.top = `${Math.max(0, Math.min(rect.top, height - popup.offsetHeight))}px`
  }
  const outside = (event: PointerEvent) => {
    if (!event.composedPath().includes(host)) dismiss()
  }
  const escape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault()
      dismiss(host.contains(doc.activeElement))
    }
  }
  position()
  const observer = new ResizeObserver(position)
  observer.observe(anchor)
  observer.observe(popup)
  doc.addEventListener('pointerdown', outside, true)
  doc.addEventListener('keydown', escape)
  doc.addEventListener('scroll', position, true)
  window.addEventListener('resize', position)
  onCleanup(() => {
    observer.disconnect()
    doc.removeEventListener('pointerdown', outside, true)
    doc.removeEventListener('keydown', escape)
    doc.removeEventListener('scroll', position, true)
    window.removeEventListener('resize', position)
    if (popup.matches(':popover-open')) popup.hidePopover()
    popup.popover = null
  })
})
</script>

<template>
  <li ref="branch" class="ym-menu__branch" @pointerenter="$event.pointerType !== 'touch' && showPopup()" @pointerleave="leaveBranch"
    @focusin="showPopup" @focusout="onBlur">
    <YmButton class="ym-menu__item" :class="{ 'ym-menu__item--compact': props.collapsed,
      'ym-menu__item--ancestor': group && props.item.children?.some(child => child.value === props.selected) }"
      :href="group ? undefined : props.item.href" :content="props.collapsed ? undefined : props.item.label"
      :theme="current ? 'primary' : 'default'" :variant="current ? 'base' : 'text'"
      :aria-label="props.item.label" :aria-current="current ? 'page' : undefined"
      :aria-expanded="group ? open : undefined" :aria-controls="group && open ? panelId : undefined"
      @click="activate">
      <template v-if="props.item.icon || props.collapsed" #icon><YmIcon :name="props.item.icon || 'menu'" /></template>
      <template v-if="group && !props.collapsed" #suffix><YmIcon :name="open ? 'chevron-up' : 'chevron-down'" /></template>
    </YmButton>
    <div v-if="open" :id="panelId" ref="panel"
      :class="props.collapsed ? 'ym-menu__popup' : 'ym-menu__inline'">
      <div v-if="props.collapsed" class="ym-menu__title">{{ props.item.label }}</div>
      <ul v-if="group" class="ym-menu__list">
        <li v-for="child in props.item.children" :key="child.value">
          <YmButton class="ym-menu__item" :href="child.href" :content="child.label"
            :theme="props.selected === child.value ? 'primary' : 'default'"
            :variant="props.selected === child.value ? 'base' : 'text'"
            :aria-current="props.selected === child.value ? 'page' : undefined" @click="select(child.value)">
            <template v-if="child.icon" #icon><YmIcon :name="child.icon" /></template>
          </YmButton>
        </li>
      </ul>
    </div>
  </li>
</template>
