<script setup lang="ts" vapor>
import { computed, nextTick, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { useFormControlState } from '../form/control-state'
import { YmIcon } from '../icon'
import { YmPopup } from '../popup'
import dropdownProps from './props'
import type { DropdownOption } from './types'

defineOptions({ name: 'YmDropdown' })
const props = defineProps(dropdownProps)
const emit = defineEmits<{
  click: [option: DropdownOption, context: { e: MouseEvent }]
  'update:visible': [visible: boolean]
  'visible-change': [visible: boolean]
}>()
defineSlots<{
  default?: () => unknown
  option?: (scope: { option: DropdownOption; index: number }) => unknown
}>()

const localVisible = ref(props.defaultVisible)
const { disabled } = useFormControlState(props, 'action')
const unavailable = computed(() => disabled.value || !props.options.length)
const requested = computed(() => props.visible ?? localVisible.value)
const visible = computed(() => !unavailable.value && requested.value)
const host = useTemplateRef<HTMLElement>('trigger')
const trigger = shallowRef<HTMLElement | null>(null)
const menu = useTemplateRef<HTMLElement>('menu')
const menuId = `ym-dropdown-${useId()}`

function requestVisible(next: boolean) {
  if (next === requested.value || (next && unavailable.value)) return
  if (props.visible === undefined) localVisible.value = next
  emit('update:visible', next)
  emit('visible-change', next)
}
watch(unavailable, disabled => { if (disabled) requestVisible(false) })

// 触发插槽通常已有按钮，让读屏属性和键盘焦点落在同一个元素上。
watch(host, (element, _, onCleanup) => {
  if (!element) {
    trigger.value = null
    return
  }
  const sync = () => {
    trigger.value = element.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex], [role="button"]') ?? element
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(element, { childList: true, subtree: true })
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })

watch([trigger, visible, unavailable], ([element, open, disabled], _, onCleanup) => {
  if (!element) return
  const attributes: Record<string, string | null> = {
    'aria-haspopup': 'menu',
    'aria-expanded': String(open),
    'aria-controls': open ? menuId : null,
  }
  if (disabled) attributes['aria-disabled'] = 'true'
  if (element === host.value) attributes.role = 'button'
  if (element === host.value || (element.getAttribute('role') === 'button' && !element.hasAttribute('tabindex') && element.tabIndex < 0)) {
    attributes.tabindex = disabled ? '-1' : '0'
  }
  const originals = new Map<string, string | null>()
  for (const [name, value] of Object.entries(attributes)) {
    originals.set(name, element.getAttribute(name))
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
  }
  onCleanup(() => {
    for (const [name, value] of originals) {
      if (value === null) element.removeAttribute(name)
      else element.setAttribute(name, value)
    }
  })
}, { flush: 'post' })

function enabledItems() {
  return Array.from(menu.value?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:enabled') ?? [])
}

function onTriggerKey(event: KeyboardEvent) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || unavailable.value) return
  if (event.key === 'Tab') {
    requestVisible(false)
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  if (event.repeat) return
  requestVisible(true)
  nextTick(() => {
    const items = enabledItems()
    const target = (event.key === 'ArrowUp' ? items.at(-1) : items[0]) ?? menu.value
    target?.focus()
  })
}

function onMenuKey(event: KeyboardEvent, close: () => void) {
  if (event.key === 'Tab') {
    // 外挂菜单也从原触发器的位置开始原生 Tab 导航。
    close()
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const items = enabledItems()
  if (!items.length) return
  const index = items.indexOf(menu.value?.ownerDocument.activeElement as HTMLButtonElement)
  let next = 0
  if (event.key === 'End') next = items.length - 1
  if (event.key === 'ArrowDown') next = (index + 1) % items.length
  if (event.key === 'ArrowUp') next = index <= 0 ? items.length - 1 : index - 1
  items[next].focus()
}

function choose(option: DropdownOption, e: MouseEvent, close: () => void) {
  if (option.disabled || unavailable.value) return
  if (props.hideAfterItemClick) {
    close()
    emit('click', option, { e })
    return
  }
  const panel = menu.value
  const item = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('button[role="menuitem"]') : null
  const index = item && panel?.ownerDocument.activeElement === item ? enabledItems().indexOf(item) : -1
  // 执行操作时，该项可能被禁用或移除。先让焦点留在菜单内。
  if (panel && index >= 0) panel.focus({ preventScroll: true })
  emit('click', option, { e })
  if (!panel || !item || index < 0) return
  nextTick(() => {
    if (menu.value !== panel || panel.ownerDocument.activeElement !== panel) return
    const items = enabledItems()
    const next = items.includes(item) ? item : items[Math.min(index, items.length - 1)]
    next?.focus()
  })
}
</script>

<template>
  <YmPopup class="ym-dropdown" :visible="visible" :disabled="unavailable" :trigger="props.trigger"
    :placement="props.placement" :attach="props.attach" :size="props.size" overlay-class-name="ym-dropdown__panel"
    @update:visible="requestVisible">
    <template #default>
      <span ref="trigger" class="ym-dropdown__trigger" @keydown.capture="onTriggerKey">
        <slot><YmButton variant="outline" :disabled="unavailable">更多操作</YmButton></slot>
      </span>
    </template>
    <template #content="{ close }">
      <div :id="menuId" ref="menu" class="ym-dropdown__menu" role="menu" aria-label="操作菜单" tabindex="-1"
        :style="{ maxHeight: `${props.maxHeight}px` }" @keydown="onMenuKey($event, close)">
        <template v-for="(option, index) in props.options" :key="option.value">
          <YmButton class="ym-dropdown__item" variant="text" role="menuitem" tabindex="-1"
            :data-active="option.active || undefined" :data-intent="option.theme" :disabled="option.disabled"
            @click="choose(option, $event, close)">
            <template v-if="option.prefixIcon" #icon><YmIcon :name="option.prefixIcon" /></template>
            <slot name="option" :option="option" :index="index">{{ option.content }}</slot>
          </YmButton>
          <div v-if="option.divider" class="ym-dropdown__divider" role="separator" />
        </template>
      </div>
    </template>
  </YmPopup>
</template>
