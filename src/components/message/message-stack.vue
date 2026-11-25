<script setup lang="ts" vapor>
import YmMessage from './message.vue'
import type { MessageEntry } from './service'

const props = defineProps<{ entries: MessageEntry[] }>()
</script>

<template>
  <div v-for="entry in props.entries" :key="entry.id" class="ym-message__entry" :style="entry.style.value">
    <YmMessage v-bind="entry.props" @close="entry.dismiss" />
  </div>
</template>
