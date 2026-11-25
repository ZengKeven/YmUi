<script setup lang="ts" vapor>
import YmNotification from './notification.vue'
import type { NotificationEntry } from './service'

const props = defineProps<{ entries: NotificationEntry[] }>()
</script>

<template>
  <div v-for="entry in props.entries" :key="entry.id" class="ym-notification__entry" :style="entry.style.value">
    <YmNotification v-bind="entry.props" @close="entry.dismiss" />
  </div>
</template>
