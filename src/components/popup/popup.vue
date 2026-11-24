<script lang="ts">
// 同一文档中若有多个浮层，Esc 只关闭最后打开的一个。
const openPanels = new WeakMap<Document, HTMLElement[]>()
// 外挂的子浮层仍属于原触发器，点击子选项时也属于父浮层内部。
const panelOwners = new WeakMap<HTMLElement, HTMLElement>()
function belongsTo(host: HTMLElement, target: EventTarget | null): boolean {
  let node = target instanceof Element ? target : null
  while (node) {
    if (host.contains(node)) return true
    const parentPanel: HTMLElement | null = node.closest('.ym-popup__panel')
    node = parentPanel ? panelOwners.get(parentPanel) ?? null : null
  }
  return false
}
</script>

<script setup lang="ts" vapor>
import { computed, onScopeDispose, ref, shallowRef, useId, useTemplateRef, watch, type CSSProperties } from 'vue'
import { inheritPopupTheme, resolveAttachment } from './attachment'
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
const attachment = computed(() => visible.value && props.attach && anchor.value
  ? resolveAttachment(props.attach, anchor.value) : null)
const inherited = shallowRef<CSSProperties>()
const style = computed(() => typeof props.overlayStyle !== 'function' ? props.overlayStyle
  : anchor.value && panel.value ? props.overlayStyle(anchor.value, panel.value) : undefined)
watch([attachment, root], ([target, host], _, onCleanup) => {
  inherited.value = undefined
  if (target && host) onCleanup(inheritPopupTheme(host, next => { inherited.value = next }))
}, { flush: 'post' })
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
    if (props.trigger === 'hover' || props.trigger === 'focus') requestVisible(true)
  }
}

function context(e: MouseEvent) {
  if (props.trigger !== 'context-menu' || props.disabled) return
  e.preventDefault()
  requestVisible(!visible.value)
}

watch([() => props.trigger, visible], () => clearTimeout(leaveTimer))
watch(() => props.disabled, disabled => { if (disabled) localVisible.value = false })
onScopeDispose(() => clearTimeout(leaveTimer))

function position() {
  if (anchor.value && panel.value) positionPanel(anchor.value, panel.value, props.placement, props.showArrow)
}
watch([() => props.placement, () => props.showArrow], position, { flush: 'post' })

watch([panel, attachment], ([element], _, onCleanup) => {
  const host = root.value
  const trigger = anchor.value
  if (!element || !host || !trigger) return
  const doc = host.ownerDocument
  panelOwners.set(element, host)
  element.popover = 'manual'
  if (!element.matches(':popover-open')) element.showPopover()
  position()
  const stack = openPanels.get(doc) ?? []
  openPanels.set(doc, stack)
  stack.push(element)

  const outside = (e: PointerEvent) => {
    if (!e.composedPath().includes(host) && !belongsTo(host, e.composedPath()[0])) requestVisible(false)
  }
  const focusOut = (e: FocusEvent) => {
    if ((props.trigger === 'hover' || props.trigger === 'focus') && belongsTo(host, e.target) && !belongsTo(host, e.relatedTarget)) requestVisible(false)
  }
  const pointerOut = (e: PointerEvent) => {
    if (props.trigger === 'hover' && belongsTo(host, e.target) && !belongsTo(host, e.relatedTarget)) leave(e)
  }
  const pointerOver = (e: PointerEvent) => {
    if (props.trigger === 'hover' && belongsTo(host, e.target)) clearTimeout(leaveTimer)
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
  doc.addEventListener('pointerout', pointerOut, true)
  doc.addEventListener('pointerover', pointerOver, true)
  doc.addEventListener('focusout', focusOut, true)
  doc.addEventListener('keydown', escape)
  doc.addEventListener('scroll', position, true)
  doc.defaultView?.addEventListener('resize', position)
  onCleanup(() => {
    stack.splice(stack.indexOf(element), 1)
    observer.disconnect()
    doc.removeEventListener('pointerdown', outside, true)
    doc.removeEventListener('pointerout', pointerOut, true)
    doc.removeEventListener('pointerover', pointerOver, true)
    doc.removeEventListener('focusout', focusOut, true)
    doc.removeEventListener('keydown', escape)
    doc.removeEventListener('scroll', position, true)
    doc.defaultView?.removeEventListener('resize', position)
    if (element.matches(':popover-open')) element.hidePopover()
    panelOwners.delete(element)
  })
}, { flush: 'post' })
</script>

<template>
  <div ref="root" class="ym-popup" :data-size="props.size" @pointerenter="enter" @focusin="focusIn">
    <div ref="anchor" class="ym-popup__trigger" @click="props.trigger === 'click' && requestVisible(!visible)"
      @mousedown="props.trigger === 'mousedown' && $event.button === 0 && requestVisible(!visible)" @contextmenu="context">
      <slot :visible="visible" :panel-id="panelId" />
    </div>
    <Teleport v-if="visible" :disabled="!attachment" :to="attachment ?? 'body'">
      <div :id="panelId" ref="panel" class="ym-popup__panel" :class="props.overlayClassName"
        :data-arrow="props.showArrow || undefined" :style="[inherited, { zIndex: props.zIndex }, style]">
        <div v-if="props.showArrow" class="ym-popup__scroll">
          <slot name="content" :close="close">{{ props.content }}</slot>
        </div>
        <slot v-else name="content" :close="close">{{ props.content }}</slot>
      </div>
    </Teleport>
  </div>
</template>
