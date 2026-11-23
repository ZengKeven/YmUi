<script lang="ts">
// 同一文档中若有多个浮层，Esc 只关闭最后打开的一个。
const openPanels = new WeakMap<Document, HTMLElement[]>()
</script>

<script setup lang="ts" vapor>
import { computed, onScopeDispose, ref, useId, useTemplateRef, watch } from 'vue'
import { positionPanel } from './position'
import popupProps from './props'

defineOptions({ name: 'YmPopup' })
const props = defineProps(popupProps)
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'visible-change': [visible: boolean]
}>()
defineSlots<{
  default?: (scope: { visible: boolean; panelId: string }) => unknown
  content?: (scope: { close: () => void }) => unknown
}>()

const root = useTemplateRef<HTMLElement>('root')
const anchor = useTemplateRef<HTMLElement>('anchor')
const panel = useTemplateRef<HTMLElement>('panel')
const panelId = useId()
const localVisible = ref(props.defaultVisible)
const visible = computed(() => !props.disabled && (props.visible ?? localVisible.value))
let triggerFocus: HTMLElement | null = null
let leaveTimer: ReturnType<typeof setTimeout> | undefined

function requestVisible(next: boolean) {
  if (props.disabled || next === visible.value) return
  if (props.visible === undefined) localVisible.value = next
  emit('update:visible', next)
  emit('visible-change', next)
}

function close() {
  if (panel.value?.contains(panel.value.ownerDocument.activeElement)) {
    const target = triggerFocus && anchor.value?.contains(triggerFocus) ? triggerFocus
      : anchor.value?.querySelector<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]')
    target?.focus({ preventScroll: true })
  }
  requestVisible(false)
}

function enter(e: PointerEvent) {
  clearTimeout(leaveTimer)
  if (props.trigger === 'hover' && e.pointerType !== 'touch') requestVisible(true)
}

function leave(e: PointerEvent) {
  if (props.trigger !== 'hover' || e.pointerType === 'touch' || panel.value?.contains(panel.value.ownerDocument.activeElement)) return
  clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => requestVisible(false), 140)
}

function focusIn(e: FocusEvent) {
  clearTimeout(leaveTimer)
  if (e.target instanceof HTMLElement && anchor.value?.contains(e.target)) {
    triggerFocus = e.target
    if (props.trigger === 'hover') requestVisible(true)
  }
}

function focusOut(e: FocusEvent) {
  if (props.trigger === 'hover' && !root.value?.contains(e.relatedTarget as Node | null)) requestVisible(false)
}

watch([() => props.trigger, visible], () => clearTimeout(leaveTimer))
watch(() => props.disabled, disabled => { if (disabled) localVisible.value = false })
onScopeDispose(() => clearTimeout(leaveTimer))

function position() {
  if (anchor.value && panel.value) positionPanel(anchor.value, panel.value, props.placement)
}
watch(() => props.placement, position, { flush: 'post' })

watch(panel, (element, _, onCleanup) => {
  const host = root.value
  const trigger = anchor.value
  if (!element || !host || !trigger) return
  const doc = host.ownerDocument
  // 进入原生顶层后仍位于触发器的 DOM 子树中，浮层可以越过裁剪并继承主题。
  element.popover = 'manual'
  element.showPopover()
  position()
  const stack = openPanels.get(doc) ?? []
  openPanels.set(doc, stack)
  stack.push(element)

  const outside = (e: PointerEvent) => {
    if (!e.composedPath().includes(host)) requestVisible(false)
  }
  const escape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !e.defaultPrevented && stack.at(-1) === element) {
      e.preventDefault()
      close()
    }
  }
  const observer = new ResizeObserver(position)
  observer.observe(trigger)
  observer.observe(element)
  doc.addEventListener('pointerdown', outside, true)
  doc.addEventListener('keydown', escape)
  doc.addEventListener('scroll', position, true)
  doc.defaultView?.addEventListener('resize', position)
  onCleanup(() => {
    stack.splice(stack.indexOf(element), 1)
    observer.disconnect()
    doc.removeEventListener('pointerdown', outside, true)
    doc.removeEventListener('keydown', escape)
    doc.removeEventListener('scroll', position, true)
    doc.defaultView?.removeEventListener('resize', position)
    if (element.matches(':popover-open')) element.hidePopover()
  })
}, { flush: 'post' })
</script>

<template>
  <div ref="root" class="ym-popup" :data-size="props.size" @pointerenter="enter" @pointerleave="leave"
    @focusin="focusIn" @focusout="focusOut">
    <div ref="anchor" class="ym-popup__trigger" @click="props.trigger === 'click' && requestVisible(!visible)">
      <slot :visible="visible" :panel-id="panelId" />
    </div>
    <div v-if="visible" :id="panelId" ref="panel" class="ym-popup__panel" :class="props.overlayClassName">
      <slot name="content" :close="close">{{ props.content }}</slot>
    </div>
  </div>
</template>
