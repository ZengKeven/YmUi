<script lang="ts">
import { defineComponent } from 'vue'
import type { ChatToolCallRendererProps } from 'ym-ui-vapor'

// 普通 script 保留 VDOM 编译路径，用于验证 Vapor 和普通 Vue 组件混用。
export default defineComponent({
  props: ['toolCallId', 'toolCallName', 'status', 'args', 'result', 'respond'] satisfies (keyof ChatToolCallRendererProps)[],
  data: () => ({ selected: false }),
  methods: {
    // 模拟异步确认表单保留了当前卡片的回调。
    deferChoice(respond: NonNullable<ChatToolCallRendererProps['respond']>) {
      window.addEventListener('confirm-deferred-choice', () => respond(true), { once: true })
    },
  },
})
</script>

<template>
  <section :aria-label="toolCallId" :data-renderer="toolCallName">
    <span role="status">{{ status }}</span>
    <output aria-label="参数">{{ JSON.stringify(args) }}</output>
    <output aria-label="结果">{{ JSON.stringify(result) }}</output>
    <button type="button" :aria-pressed="selected" @click="selected = !selected">标记</button>
    <template v-if="respond">
      <button type="button" @click="respond(false)">拒绝</button>
      <button type="button" @click="deferChoice(respond)">稍后确认</button>
    </template>
  </section>
</template>
