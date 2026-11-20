<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, type App, type VaporComponent } from 'vue'
import { useRoute } from 'vitepress'

const props = defineProps<{ name: string }>()
const host = useTemplateRef<HTMLElement>('host')
const route = useRoute()
let demo: App | undefined

onMounted(async () => {
  if (import.meta.env.SSR) return
  const examples = import.meta.glob<{ default: VaporComponent }>('../../examples/*.demo.vue')
  const [{ createVaporApp }, { default: component }] = await Promise.all([
    import('vue'), examples[`../../examples/${props.name}.demo.vue`](),
  ])
  if (host.value) {
    demo = createVaporApp(component)
    demo.mount(host.value)
    const anchor = document.getElementById(route.hash.slice(1))
    if (anchor && host.value.contains(anchor)) anchor.scrollIntoView()
  }
})
onBeforeUnmount(() => demo?.unmount())
</script>

<template>
  <div ref="host" class="component-demo vp-raw" />
</template>
