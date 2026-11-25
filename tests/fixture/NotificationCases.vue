<script setup lang="ts" vapor>
import { ref, useTemplateRef } from 'vue'
import { ConfigProvider, Message, Notification, YmNotification, type ControlSize, type NotificationHandle } from 'ym-ui-vapor'

const events = ref<string[]>([])
const actions = ref(0)
const timed = ref(false)
const size = ref<ControlSize>('medium')
const dark = ref(false)
const square = ref(false)
const surface = ref('#fcf8ee')
const source = useTemplateRef<HTMLElement>('source')
let first: NotificationHandle | undefined

function showCorners() {
  first = Notification.info({ content: '等待收货', duration: 0, onClose: ({ trigger }) => events.value.push(trigger) })
  Notification.success({ title: '核对完成', content: '货品数量一致', duration: 0 })
  Notification.warning({ placement: 'top-left', content: '临近到期', duration: 0 })
  Notification.error({ placement: 'bottom-left', content: '入库失败', duration: 0 })
  Notification.open({ placement: 'bottom-right', content: '库存已更新', footer: '仓库 A', duration: 0 })
  Message.info('独立的全局提示', 0)
}

function showTracked() {
  first = Notification.success({
    title: '同步完成', content: '三个仓库已更新', closeBtn: '知道了',
    onCloseBtnClick: ({ e }) => events.value.push(e.type),
    onDurationEnd: () => events.value.push('timeout'),
    onClose: ({ trigger }) => events.value.push(trigger),
  }, 500)
}

function showFromSource() {
  if (!source.value) return
  Notification.info({ content: '来源通知', source: source.value, duration: 0 })
  Notification.info({ content: '单独尺寸', source: source.value, size: 'small', duration: 0 })
}
</script>

<template>
  <main style="max-width: 600px; margin: 80px auto">
    <section id="slots">
      <YmNotification theme="warning" title="后备标题" content="后备正文" footer="后备页脚" :duration="0"
        @close="events.push($event.trigger)" @close-btn-click="events.push($event.e.type)">
        <template #title><strong>收货异常</strong></template>
        <template #default>实收数量少于订单数量。</template>
        <template #content>后备内容插槽</template>
        <template #icon><span>!</span></template>
        <template #footer><button @click="actions++">查看差异</button></template>
        <template #closeBtn>已阅</template>
      </YmNotification>
      <YmNotification content="后备正文" :duration="0" :icon="false" :close-btn="false">
        <template #content>仅正文插槽</template>
      </YmNotification>
    </section>
    <output id="events">{{ events.join(',') }}</output>
    <output id="actions">{{ actions }}</output>
    <button @click="timed = true">显示计时通知</button>
    <div id="timed">
      <YmNotification v-if="timed" content="稍后自动关闭" @duration-end="events.push('timeout')" @close="events.push($event.trigger)" />
    </div>
    <button @click="showCorners">发布四角通知</button>
    <button @click="showTracked">发布限时通知</button>
    <button @click="first?.close()">关闭第一条通知</button>
    <button @click="Notification.closeAll()">关闭全部通知</button>
    <button @click="Message.closeAll()">关闭全局提示</button>
    <button @click="showFromSource">从指定区域发布</button>
    <label>通知尺寸 <select v-model="size"><option v-for="s in ['extra-small', 'small', 'medium', 'large']" :key="s">{{ s }}</option></select></label>
    <label>浅色表面 <input v-model="surface" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="16"
      :theme="{ light: { surface, text: '#304462' }, dark: { surface: '#2b3647', text: '#f3f1ea' } }">
      <ConfigProvider :radius="square ? 0 : 7">
        <div id="source" ref="source">
          <button @click="Notification.info('ad')">快捷通知</button>
          <YmNotification content="内联通知" :duration="0" />
        </div>
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
