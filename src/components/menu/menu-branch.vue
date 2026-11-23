<script setup lang="ts" vapor>
import { computed, useId } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmPopup } from '../popup'
import MenuChildren from './menu-children.vue'
import type { MenuItem, MenuValue } from './types'

const props = defineProps<{
  item: MenuItem
  collapsed: boolean
  selected?: MenuValue
  expanded: boolean
  popupOpen: boolean
}>()
const emit = defineEmits<{ select: [value: MenuValue]; toggle: []; open: []; close: [] }>()
const inlineId = useId()
const group = computed(() => Boolean(props.item.children?.length))
const open = computed(() => props.collapsed ? props.popupOpen : group.value && props.expanded)
const current = computed(() => !group.value && props.selected === props.item.value)

function activate() {
  if (!group.value) {
    if (props.popupOpen) emit('close')
    emit('select', props.item.value)
  } else if (props.collapsed) emit('open')
  else emit('toggle')
}
</script>

<template>
  <li class="ym-menu__branch">
    <YmPopup :visible="props.popupOpen" :disabled="!props.collapsed" trigger="hover" placement="right"
      overlay-class-name="ym-menu__popup" @update:visible="$event ? emit('open') : emit('close')">
      <template #default="{ panelId }">
        <YmButton class="ym-menu__item" :class="{ 'ym-menu__item--compact': props.collapsed,
          'ym-menu__item--ancestor': group && props.item.children?.some(child => child.value === props.selected) }"
          :href="group ? undefined : props.item.href" :content="props.collapsed ? undefined : props.item.label"
          :theme="current ? 'primary' : 'default'" :variant="current ? 'base' : 'text'"
          :aria-label="props.item.label" :aria-current="current ? 'page' : undefined"
          :aria-expanded="group ? open : undefined" :aria-controls="group && open ? (props.collapsed ? panelId : inlineId) : undefined"
          @click="activate">
          <template v-if="props.item.icon || props.collapsed" #icon><YmIcon :name="props.item.icon || 'menu'" /></template>
          <template v-if="group && !props.collapsed" #suffix><YmIcon :name="open ? 'chevron-up' : 'chevron-down'" /></template>
        </YmButton>
      </template>
      <template #content="{ close }">
        <div class="ym-menu__title">{{ props.item.label }}</div>
        <MenuChildren v-if="props.item.children?.length" :items="props.item.children" :selected="props.selected"
          @select="close(); emit('select', $event)" />
      </template>
    </YmPopup>
    <div v-if="!props.collapsed && open && props.item.children" :id="inlineId" class="ym-menu__inline">
      <MenuChildren :items="props.item.children" :selected="props.selected" @select="emit('select', $event)" />
    </div>
  </li>
</template>
