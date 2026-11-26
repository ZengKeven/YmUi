<script setup lang="ts" vapor>
import { computed, onScopeDispose, reactive, ref } from 'vue'
import { YmButton, YmChatMarkdown, YmChatMessage, YmTextarea, type ChatMessageStatus, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const content = ref([
  '## 到货安排', '', '> 北门库区下午两点开始收货。', '',
  '- 携带送货单', '- 备好采购单号', '', '查看[对话列表](/chat-list/)。', '',
  '```text', '库区编号 A-07', '```',
].join('\n'))
const size = ref<ControlSize>()
const block = reactive({ type: 'markdown' as const, data: '' })
const status = ref<ChatMessageStatus>()
const running = computed(() => status.value === 'pending' || status.value === 'streaming')
const chunks = [
  '## 收货提醒\n\n> 请提前到场登记。\n\n- 送货单\n- ',
  '采购单号\n\n查看[对话列',
  '表](/chat-list/)。\n\n``',
  '`text\n订单',
  '号 PO-42\n```',
]
let timer: ReturnType<typeof setInterval> | undefined

function finish(next: 'complete' | 'stop') {
  clearInterval(timer)
  status.value = next
}

function start() {
  if (running.value) return
  block.data = ''
  status.value = 'pending'
  let index = 0
  timer = setInterval(() => {
    block.data += chunks[index++]
    status.value = 'streaming'
    if (index === chunks.length) finish('complete')
  }, 400)
}

onScopeDispose(() => clearInterval(timer))
</script>

<template>
  <PreviewFrame name="YmChatMarkdown">
    <template #preview>
      <div class="markdown-preview">
        <YmChatMarkdown :content="content" :size="size" />
      </div>
    </template>
    <template #controls>
      <label class="source-field">Markdown 源文 <YmTextarea v-model="content" :rows="8" /></label>
      <label>正文尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>

    <section class="example-section">
      <h3>分段回复</h3>
      <div class="demo-row">
        <YmButton theme="primary" :disabled="running" @click="start">模拟分段回复</YmButton>
        <YmButton v-if="running" variant="outline" @click="finish('stop')">停止回复</YmButton>
      </div>
      <YmChatMessage v-if="status" class="reply-preview" name="收货助手" :status="status" :content="[block]" variant="base" />
    </section>
  </PreviewFrame>
</template>

<style scoped>
.markdown-preview { width: 100%; min-width: 0; }
.demo-fields .source-field { display: grid; grid-template-columns: minmax(0, 1fr); }
.reply-preview { margin-block-start: 1rem; }
</style>
