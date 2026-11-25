<script setup lang="ts" vapor>
import { computed, onBeforeUnmount, ref, shallowRef, useId, useTemplateRef, watch, type CSSProperties } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { inheritPopupTheme, resolveAttachment } from '../popup/attachment'
import { useDialogMount } from './mount'
import dialogProps from './props'
import type { DialogActionContext, DialogCloseTrigger } from './types'

defineOptions({ name: 'YmDialog', inheritAttrs: false })
const props = defineProps(dialogProps)
type Action = 'confirm' | 'cancel'
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: [context: DialogActionContext]
  'action-error': [context: { action: Action; error: unknown }]
}>()
const slots = defineSlots<{
  header?: () => unknown
  default?: () => unknown
  body?: () => unknown
  footer?: (scope: { confirm: (e?: Event) => void; cancel: (e?: Event) => void; pending: Action | null }) => unknown
}>()

const titleId = useId()
const source = useTemplateRef<HTMLElement>('source')
const panel = useTemplateRef<HTMLDialogElement>('panel')
const localVisible = ref(props.defaultVisible)
const visible = computed(() => props.visible ?? localVisible.value)
const pending = ref<Action | null>(null)
const attachment = computed(() => {
  const origin = source.value
  if (!visible.value || !origin) return null
  const target = resolveAttachment(props.attach, origin)
  return target?.isConnected ? target : origin.ownerDocument.body
})
const mount = useDialogMount(attachment, panel)
const inherited = shallowRef<CSSProperties>()
const hasTitle = computed(() => Boolean(props.header || slots.header))
function length(value?: number | string) { return typeof value === 'number' ? value + 'px' : value }
const dimensions = computed(() => ({ '--ym-dialog-width': length(props.width), '--ym-dialog-top': length(props.top) }))

watch([attachment, source], ([target, origin], _, onCleanup) => {
  if (target && origin) onCleanup(inheritPopupTheme(origin, style => { inherited.value = style }))
}, { flush: 'post' })

// 原生模态栈负责背景隔离及 Tab 导航。关闭子框时将焦点还给实际打开它的控件。
watch(panel, (element, _, onCleanup) => {
  if (!element?.isConnected) return
  const doc = element.ownerDocument
  const opener = doc.activeElement
  if (!element.matches(':modal')) {
    if (element.open) element.close()
    element.showModal()
  }
  const active = doc.activeElement
  if (active === element || (!active?.hasAttribute('autofocus') && active?.closest('.ym-dialog__footer, .ym-dialog__close'))) {
    const field = element.querySelector<HTMLElement>('.ym-dialog__body :is(input:not([type=hidden]), textarea, select):enabled')
    const focusTarget = field ?? element
    focusTarget.focus({ preventScroll: true })
  }
  onCleanup(() => {
    if (element.open) element.close()
    if (opener instanceof HTMLElement && opener.isConnected && (doc.activeElement === doc.body || element.contains(doc.activeElement))) {
      opener.focus({ preventScroll: true })
    }
  })
}, { flush: 'post' })

let opening = 0
function invalidate() {
  opening++
  pending.value = null
}
watch(visible, invalidate, { flush: 'sync' })
onBeforeUnmount(invalidate)

async function act(trigger: DialogCloseTrigger, e: Event) {
  if (!visible.value || pending.value) return
  const version = opening
  const action = trigger === 'confirm' ? 'confirm' : 'cancel'
  const context = { trigger, e }
  pending.value = action
  try {
    const handler = action === 'confirm' ? props.onConfirm : props.onCancel
    if (await handler?.(context) === false || opening !== version) return
    if (props.visible === undefined) localVisible.value = false
    emit('update:visible', false)
    emit('close', context)
  } catch (error) {
    if (opening === version) emit('action-error', { action, error })
  } finally {
    if (opening === version) pending.value = null
  }
}
function confirm(e: Event = new Event('confirm')) { return act('confirm', e) }
function cancel(e: Event = new Event('cancel')) { return act('cancel', e) }

function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && (e.repeat || e.isComposing || e.keyCode === 229)) {
    e.preventDefault()
    return
  }
  if (e.defaultPrevented || e.isComposing || e.keyCode === 229 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  if (e.key !== 'Enter' || !(e.target instanceof Element) || e.target.closest('dialog') !== panel.value) return
  // 按钮和链接保留原生激活行为，多行输入保留换行，下拉控件自行处理选项。
  if (e.target.closest('button, a[href], select, textarea, summary, input:is([type=submit],[type=button],[type=reset],[type=image]), [role="button"], [role="combobox"]')
    || (e.target as HTMLElement).isContentEditable) return
  const button = panel.value?.querySelector<HTMLElement>('.ym-dialog__footer [data-dialog-confirm]')
  if (pending.value && button) { e.preventDefault(); return }
  if (!button || button.matches(':disabled, [aria-disabled=true], [hidden]') || !button.getClientRects().length) return
  e.preventDefault()
  if (e.repeat) return
  if (slots.footer) button.click()
  else confirm(e)
}

let pressedBackdrop = false
function onBackdrop(e: MouseEvent) {
  const element = panel.value
  if (!element || e.target !== element) return false
  const rect = element.getBoundingClientRect()
  return e.clientX < rect.left || e.clientX >= rect.right || e.clientY < rect.top || e.clientY >= rect.bottom
}
function clickBackdrop(e: MouseEvent) {
  if (props.closeOnOverlayClick && pressedBackdrop && onBackdrop(e)) act('overlay', e)
  pressedBackdrop = false
}
</script>

<template>
  <span ref="source" class="ym-dialog__source" hidden></span>
  <Teleport v-if="mount" :to="mount">
    <div class="ym-dialog__theme" :style="inherited">
      <dialog ref="panel" class="ym-dialog ym-theme" :data-size="props.size"
        :data-placement="props.top != null ? 'top' : props.placement" :style="dimensions"
        :aria-labelledby="hasTitle ? titleId : undefined" :aria-label="hasTitle ? undefined : '对话框'"
        v-bind="$attrs" @keydown="keydown" @cancel.prevent="props.closeBtn && act('esc', $event)"
        @pointerdown="pressedBackdrop = onBackdrop($event)" @click="clickBackdrop">
        <header v-if="hasTitle || props.closeBtn" class="ym-dialog__header">
          <div v-if="hasTitle" :id="titleId" class="ym-dialog__title"><slot name="header">{{ props.header }}</slot></div>
          <YmButton v-if="props.closeBtn" class="ym-dialog__close" variant="text" shape="square" aria-label="关闭对话框"
            :disabled="!!pending" @click="act('close-btn', $event)"><YmIcon name="close" /></YmButton>
        </header>
        <div class="ym-dialog__body"><slot><slot name="body">{{ props.body }}</slot></slot></div>
        <footer v-if="$slots.footer || props.confirmBtn || props.cancelBtn" class="ym-dialog__footer">
          <slot name="footer" :confirm="confirm" :cancel="cancel" :pending="pending">
            <YmButton v-if="props.cancelBtn" variant="outline" :loading="pending === 'cancel'" :disabled="pending === 'confirm'"
              @click="cancel">{{ typeof props.cancelBtn === 'string' ? props.cancelBtn : '取消' }}</YmButton>
            <YmButton v-if="props.confirmBtn" data-dialog-confirm :loading="pending === 'confirm'" :disabled="pending === 'cancel'"
              @click="confirm">{{ typeof props.confirmBtn === 'string' ? props.confirmBtn : '确定' }}</YmButton>
          </slot>
        </footer>
      </dialog>
    </div>
  </Teleport>
</template>
