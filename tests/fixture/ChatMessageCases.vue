<script setup lang="ts" vapor>
import { computed, reactive, ref } from 'vue'
import { ConfigProvider, YmChatMessage, type ChatMessageData, type ChatMessageProps,
  type ChatToolCallContent } from 'ym-ui-vapor'

const content: ChatMessageProps['content'] = [
  { type: 'text', data: '第一行\n第二行' },
  { type: 'text', data: '<em>已收货</em>' },
]
const avatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"%3E%3Crect width="8" height="8" fill="teal"/%3E%3C/svg%3E'
const record: ChatMessageData = {
  id: 'msg-21', role: 'user', name: '收货员', datetime: '周三 12:20', content: '请确认到货时间',
  avatar: { src: '/chat-avatar.svg', alt: '收货头像', fallback: avatar },
}
const streamed = reactive({
  id: 'msg-22', status: 'streaming', content: [{ type: 'text', data: '正在核对' }],
  avatar: { src: avatar, alt: '排期助手头像' },
} satisfies ChatMessageData)
const override = ref(false)
const right = ref(false)
const customHeader = ref(false)
const customContent = ref(false)
const body = ref('')
const status = ref<ChatMessageProps['status']>('pending')
const compact = ref(false)
const dark = ref(false)
const square = ref(false)
const textColor = ref('#403429')
const toolStatus = ref<ChatToolCallContent['status']>()
const toolMessage = computed<ChatMessageData>(() => {
  const current: ChatToolCallContent = {
    type: 'toolcall', status: toolStatus.value,
    data: { toolCallId: 'stock-1', toolCallName: '查询库存', args: { skus: ['<em>零件</em>'] } },
  }
  if (toolStatus.value === 'complete') current.data.result = false
  if (toolStatus.value === 'error') current.data.result = '查询失败\n<em>请重试</em>'
  return {
    id: 'tools', status: 'streaming', content: [
      current,
      { type: 'toolcall', status: 'complete', data: { toolCallId: 'count', args: null, result: 0 } },
      ...(toolStatus.value === 'complete' ? [{ type: 'markdown' as const, data: '## 库存回复' }] : []),
    ],
  }
})
</script>

<template>
  <label><input v-model="right" type="checkbox" />靠右显示</label>
  <section id="plain">
    <YmChatMessage :content="content" :avatar="avatar" name="赵宁" datetime="今天 16:38"
      :placement="right ? 'right' : 'left'" />
  </section>
  <label><input v-model="override" type="checkbox" />覆盖消息字段</label>
  <section id="record">
    <YmChatMessage :message="record" :name="override ? '' : undefined" :role="override ? 'system' : undefined"
      :content="override ? '新的到货日期' : undefined" />
  </section>
  <section id="streamed">
    <YmChatMessage :message="streamed" />
    <button @click="streamed.content[0].data += '入库记录'">追加文字</button>
    <button @click="streamed.avatar.src = '/chat-avatar.svg'">切到失效头像</button>
    <button @click="streamed.avatar.src = avatar">恢复头像</button>
  </section>

  <label>消息状态
    <select v-model="status"><option>pending</option><option>streaming</option><option>stop</option>
      <option>error</option><option>complete</option></select>
  </label>
  <label>状态正文<input v-model="body" /></label>
  <section id="state"><YmChatMessage name="仓库助手" :status="status" :content="body" /></section>

  <label><input v-model="customHeader" type="checkbox" />整体标题</label>
  <label><input v-model="customContent" type="checkbox" />具名正文</label>
  <section id="slots">
    <YmChatMessage :avatar="avatar" name="属性昵称" datetime="属性时间" content="属性正文">
      <template v-if="customHeader" #header><strong>自定义标题</strong></template>
      <template #avatar><span>头像插槽</span></template>
      <template #name><span>昵称插槽</span></template>
      <template #datetime><span>时间插槽</span></template>
      <template v-if="customContent" #content><span>具名正文插槽</span></template>
      <template #default><span>默认正文插槽</span></template>
      <template #actionbar><button>复制消息</button></template>
    </YmChatMessage>
  </section>

  <label>正文颜色<input v-model="textColor" type="color" /></label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label><input v-model="compact" type="checkbox" />紧凑尺寸</label>
  <label><input v-model="square" type="checkbox" />直角气泡</label>
  <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'" :radius="18"
    :theme="{ light: { text: textColor }, dark: { text: '#f5f0da' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <section id="inherited"><YmChatMessage variant="outline" content="继承配置" /></section>
      <section id="local"><YmChatMessage size="small" variant="outline" content="局部尺寸" /></section>
      <section id="toolcalls">
        <label>调用状态<select v-model="toolStatus">
          <option value="executing">进行中</option><option value="complete">成功</option>
          <option value="error">失败</option><option value="stop">已中断</option>
        </select></label>
        <YmChatMessage :message="toolMessage">
          <template #actionbar="{ copyText }"><span class="copy-text">{{ copyText }}</span></template>
        </YmChatMessage>
      </section>
    </ConfigProvider>
  </ConfigProvider>
</template>
