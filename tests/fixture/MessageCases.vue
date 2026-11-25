<script setup lang="ts" vapor>
import { ref, useTemplateRef } from 'vue'
import { ConfigProvider, Message, YmMessage, type ControlSize } from 'ym-ui-vapor'

const inlineEvents = ref<string[]>([])
const apiEvents = ref<string[]>([])
const timed = ref(false)
const dark = ref(false)
const square = ref(false)
const surface = ref('#edf2f8')
const size = ref<ControlSize>('medium')
const source = useTemplateRef<HTMLElement>('source')
let first: ReturnType<typeof Message.open> | undefined

function openBatch() {
  first = Message.info({ content: '读取中', duration: 0, onClose: ({ trigger }) => apiEvents.value.push(trigger) })
  Message.success('已保存', 0)
  Message.warning('余额不足', 0)
  Message.error('写入失败', 0)
  Message.question('是否继续', 0)
  Message.loading('处理中', 0)
  Message.open({ content: '底部提示', placement: 'bottom-right', duration: 0 })
}

function tracked() {
  first = Message.success({
    content: '保存成功', closeBtn: '知道了',
    onCloseBtnClick: ({ e }) => apiEvents.value.push(e.type),
    onDurationEnd: () => apiEvents.value.push('timeout'),
    onClose: ({ trigger }) => apiEvents.value.push(trigger),
  }, 800)
}

function external() {
  if (!source.value) return
  Message.info({ content: '外部挂载', source: source.value, duration: 0 })
  Message.info({ content: '显式尺寸', source: source.value, size: 'small', duration: 0 })
}
</script>

<template>
  <main style="margin: 120px 80px">
    <div id="slotted">
      <YmMessage theme="warning" content="后备文字" close-btn="后备按钮" :duration="0"
        @close="inlineEvents.push($event.trigger)" @close-btn-click="inlineEvents.push($event.e.type)">
        <strong>库存不足</strong>
        <template #icon><span>!</span></template>
        <template #closeBtn><span>确认</span></template>
      </YmMessage>
      <YmMessage content="无图标" :icon="false" :duration="0" />
    </div>
    <button @click="timed = true">开始计时</button>
    <div id="timed"><YmMessage v-if="timed" content="自动关闭" close-btn
      @duration-end="inlineEvents.push('timeout')" @close="inlineEvents.push($event.trigger)" /></div>
    <output id="events">{{ inlineEvents.join(',') }}</output>
    <button @click="openBatch">批量提示</button>
    <button @click="tracked">限时反馈</button>
    <button @click="first?.close()">关闭首条</button>
    <button @click="Message.closeAll()">全部关闭</button>
    <output id="api-events">{{ apiEvents.join(',') }}</output>
    <button @click="external">打开指定来源的提示</button>
    <label>消息尺寸 <select v-model="size"><option v-for="s in ['extra-small','small','medium','large']" :key="s">{{ s }}</option></select></label>
    <label>浅色背景 <input v-model="surface" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角面板</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="12"
      :theme="{ light: { surface, text: '#234567' }, dark: { surface: '#28394a', text: '#f1e5db' } }">
      <ConfigProvider :radius="square ? 0 : 7">
        <div ref="source" id="source">
          <button @click="Message.info('ad')">快捷提示</button>
          <YmMessage content="来源面板" :duration="0" />
        </div>
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
