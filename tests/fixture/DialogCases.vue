<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmDialog, YmInput, YmSelect, type ControlSize, type DialogActionContext } from 'ym-ui-vapor'

const edit = ref(false)
const editAttach = ref<string>()
const moves = ref(0)
const child = ref(false)
const plain = ref(false)
const themed = ref(false)
const defaultOpen = ref(false)
const markConfirm = ref(false)
const showClose = ref(true)
const showConfirm = ref(true)
const overlay = ref(false)
const text = ref('原始内容')
const remark = ref('')
const category = ref('')
const size = ref<ControlSize>('small')
const localSize = ref(false)
const mode = ref(false)
const square = ref(false)
const surface = ref('#e1e8ef')
const events = ref<string[]>([])
const params = new URLSearchParams(window.location.search)
const attach = params.get('attach') === 'node' ? document.getElementById('external')!
  : params.get('attach') === 'getter' ? () => document.getElementById('external') : '#external'

function record(context: DialogActionContext) {
  events.value.push(context.trigger)
}

async function request(context: DialogActionContext) {
  events.value.push('start-' + context.trigger)
  const response = await fetch('/fixture-dialog-request/' + context.trigger)
  if (!response.ok) throw new Error('保存失败')
  const result = await response.json()
  return result.allow as boolean
}
</script>

<template>
  <button @click="plain = true">打开确认框</button>
  <button @click="edit = true">编辑收货单</button>
  <button @click="themed = true">打开主题框</button>
  <button @click="defaultOpen = true">打开非受控对话框</button>
  <label><input type="checkbox" v-model="showClose" />允许关闭</label>
  <label><input type="checkbox" v-model="showConfirm" />允许确认</label>
  <label><input type="checkbox" v-model="overlay" />点击遮罩关闭</label>
  <output id="events">{{ events.join(',') }}</output>

  <YmDialog v-model:visible="plain" header="确认收货" body="是否将货品入库？"
    :close-btn="showClose" :confirm-btn="showConfirm" :close-on-overlay-click="overlay"
    @close="record" />

  <YmDialog v-if="defaultOpen" default-visible header="原有标题" body="原有正文" @close="record">
    <template #header><strong>替换标题</strong></template>
    <template #body>后备内容</template>
    <template #default>
      <p>优先的正文</p>
      <input aria-label="凭证号" />
      <label><input type="checkbox" v-model="markConfirm" />指定回车按钮</label>
    </template>
    <template #footer="{ confirm }">
      <button :data-dialog-confirm="markConfirm ? '' : undefined"
        @click="events.push('custom-click'); confirm($event)">自定义确定</button>
    </template>
  </YmDialog>

  <YmDialog v-model:visible="edit" header="编辑收货单" confirm-btn="保存" cancel-btn="放弃" :attach="editAttach"
    @confirm="request" @cancel="request" @close="record" @action-error="events.push('error-' + $event.action)">
    <YmInput v-model="text" aria-label="收货人" />
    <textarea aria-label="备注" v-model="remark"></textarea>
    <YmSelect v-model="category" aria-label="类别" :options="[{ label: '纸张', value: 'paper' }]" />
    <button @click="child = true">核对地址</button>
    <button @click="edit = false">业务收起表单</button>
    <YmDialog v-model:visible="child" header="核对地址" @close="events.push('child-' + $event.trigger)">
      确认当前地址？
      <button @click="editAttach = '#external'; moves++">切换父框挂载点</button>
      <output>{{ moves }}</output>
    </YmDialog>
  </YmDialog>

  <ConfigProvider :size="size" :radius="14" :mode="mode ? 'dark' : 'light'"
    :theme="{ light: { surface, text: '#123456' }, dark: { surface: '#223344', text: '#d9e7f0' } }">
    <ConfigProvider :radius="square ? 0 : 9">
      <YmDialog v-model:visible="themed" header="主题设置" :attach="attach" :width="420" placement="top"
        :top="60" :size="localSize ? 'medium' : undefined">
        <label>全局尺寸 <select v-model="size">
          <option v-for="s in ['extra-small', 'small', 'medium', 'large']" :key="s">{{ s }}</option>
        </select></label>
        <label><input v-model="localSize" type="checkbox" />组件使用中号</label>
        <label><input v-model="mode" type="checkbox" />深色</label>
        <label><input v-model="square" type="checkbox" />直角</label>
        <label>浅色背景 <input type="color" v-model="surface" /></label>
      </YmDialog>
    </ConfigProvider>
  </ConfigProvider>
</template>
