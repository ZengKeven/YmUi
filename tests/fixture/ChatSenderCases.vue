<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmChatSender } from 'ym-ui-vapor'

const draft = ref('')
const loading = ref(false)
const disabled = ref(false)
const sendDisabled = ref(false)
const stopMode = ref(false)
const compact = ref(false)
const dark = ref(false)
const surface = ref('#efefe0')
const sends = ref<string[]>([])
const stops = ref<string[]>([])
const edits = ref<string[]>([])
const focusEvents = ref<string[]>([])
const offered = ref('')
const namedDraft = ref('备选问题')

function describeEvent(value: string, { e }: { e: Event }) {
  return `${e.type}|${value}`
}
</script>

<template>
  <section id="composer">
    <YmChatSender v-model="draft" value="备用值" placeholder="输入消息" :loading="loading" :disabled="disabled"
      :send-btn-disabled="sendDisabled" :stop-disabled="stopMode"
      @send="(value, context) => sends.push(describeEvent(value, context))"
      @stop="(value, context) => stops.push(describeEvent(value, context))"
      @change="(value, context) => edits.push(describeEvent(value, context))"
      @focus="(value, context) => focusEvents.push(describeEvent(value, context))"
      @blur="(value, context) => focusEvents.push(describeEvent(value, context))" />
    <output id="draft">{{ draft }}</output>
    <output id="sends">{{ JSON.stringify(sends) }}</output>
    <output id="stops">{{ JSON.stringify(stops) }}</output>
    <output id="edits">{{ JSON.stringify(edits) }}</output>
    <output id="focus-events">{{ JSON.stringify(focusEvents) }}</output>
  </section>
  <label><input type="checkbox" v-model="loading" />正在生成</label>
  <label><input type="checkbox" v-model="sendDisabled" />禁止发送</label>
  <label><input type="checkbox" v-model="stopMode" />显示停止按钮</label>
  <label><input type="checkbox" v-model="disabled" />禁用发送框</label>
  <button @click="draft = '外部草稿'">载入草稿</button>

  <form id="draft-form"><button type="reset">重置提问</button></form>
  <section id="uncontrolled">
    <YmChatSender default-value="初始草稿"
      :textarea-props="{ form: 'draft-form', id: 'question-draft', 'aria-label': '待发送提问', autosize: { minRows: 1, maxRows: 3 } }"
      @send="(value, context) => sends.push(describeEvent(value, context))" />
  </section>
  <section id="named-draft">
    <YmChatSender v-model:value="namedDraft" />
    <output>{{ namedDraft }}</output>
    <button @click="namedDraft = '下一条问题'">替换备选问题</button>
  </section>
  <section id="controlled">
    <YmChatSender value="固定草稿" @update:model-value="offered = $event" />
    <output>{{ offered }}</output>
  </section>
  <section id="slots">
    <YmChatSender default-value="提要" :disabled="disabled" :loading="loading"
      @send="(value, context) => sends.push(describeEvent(value, context))"
      @stop="(value, context) => stops.push(describeEvent(value, context))">
      <template #header>草稿箱</template>
      <template #inner-header>采购助手</template>
      <template #input-prefix>给采购组</template>
      <template #footer-prefix>内部对话</template>
      <template #suffix="{ send, stop, disabled: inactive, loading: generating }">
        <button type="button" :aria-disabled="inactive" @click="generating ? stop($event) : send($event)">
          {{ generating ? '中断提要' : '提交提要' }}
        </button>
      </template>
    </YmChatSender>
  </section>

  <label><input type="checkbox" v-model="dark" />深色主题</label>
  <label><input type="checkbox" v-model="compact" />紧凑尺寸</label>
  <label>表面颜色<input type="color" v-model="surface" /></label>
  <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { surface }, dark: { surface: '#273549' } }">
    <ConfigProvider :radius="compact ? 0 : 11">
      <section id="inherited"><YmChatSender /></section>
      <section id="local"><YmChatSender size="small" /></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
