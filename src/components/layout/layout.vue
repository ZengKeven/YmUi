<script setup lang="ts" vapor>
import { useModel } from 'vue'
import LayoutAside from './aside.vue'
import LayoutHeader from './header.vue'
import LayoutContent from './content.vue'
import layoutProps from './props'

defineOptions({ name: 'YmLayout' })
const props = defineProps(layoutProps)
defineEmits<{ 'update:collapsed': [collapsed: boolean] }>()
defineSlots<{
  header?: () => unknown
  aside?: (state: { collapsed: boolean }) => unknown
  content?: () => unknown
}>()
const collapsed = useModel(props, 'collapsed')
</script>

<template>
  <div class="ym-layout" :style="{
    '--ym-layout-header-height': `${props.headerHeight}px`,
    '--ym-layout-aside-width': `${props.asideWidth}px`,
    '--ym-layout-collapsed-width': `${props.collapsedWidth}px`,
  }">
    <LayoutAside :logo="props.logo" :system-name="props.systemName" :collapsed="collapsed"
      @toggle="collapsed = !collapsed">
      <slot name="aside" :collapsed="collapsed" />
    </LayoutAside>
    <div class="ym-layout__body">
      <LayoutHeader><slot name="header" /></LayoutHeader>
      <LayoutContent><slot name="content" /></LayoutContent>
    </div>
  </div>
</template>
