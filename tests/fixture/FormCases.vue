<script setup lang="ts" vapor>
import { computed, reactive, ref, useTemplateRef } from 'vue'
import {
  ConfigProvider, YmButton, YmCheckboxGroup, YmColorPicker, YmDatePicker, YmForm, YmFormItem, YmInput, YmRadioGroup, YmSelect, YmTimePicker, YmTreeSelect,
  YmInputNumber, YmRate, YmSwitch, type ControlSize, type FormInstance, type FormRule,
} from 'ym-ui-vapor'

const form = useTemplateRef<FormInstance>('form')
const emptyForm = useTemplateRef<FormInstance>('emptyForm')
const emptyData = reactive<{ num?: number | null; choice?: number; enabled?: boolean; score?: number }>({})
const waitForSwitch = ref(false)
let approveSwitch: (() => void) | undefined
function switchApproval() {
  if (!waitForSwitch.value) return true
  return new Promise<boolean>(resolve => { approveSwitch = () => resolve(true) })
}
const data = reactive({
  profile: { email: '' }, warehouse: '', labels: ['出库'], lines: [{ id: 1, code: '' }],
  login: '', note: '原备注',
})
const showLines = ref(false)
const showEntryFields = ref(false)
const allowNative = ref(false)
const rules = computed(() => ({
  profile: { email: [{ required: true, message: '表单级邮箱规则' }] },
  warehouse: [{ required: true, message: '请选择仓库' }],
  lines: data.lines.map(() => ({ code: [{ required: true, message: '请填写商品编号' }] })),
}))
const emailRules: FormRule[] = [
  { required: true, message: '请填写邮箱', trigger: 'blur' },
  { email: true, message: '邮箱格式有误', trigger: 'blur' },
]
const locations = [{ label: '上海仓', value: 'sh' }, { label: '杭州仓', value: 'hz' }]
const requests = ref(0)
const pendingRequests: Array<() => void> = []
const finishedSubmits = ref(0)
async function submitAndWait() {
  await form.value!.submit()
  finishedSubmits.value++
}
const codeRules: FormRule[] = [{
  validator(value, context) {
    if (value !== '待查询') return true
    requests.value++
    return new Promise(resolve => {
      pendingRequests.push(() => resolve({ result: false, message: '编码冲突 ' + context.name }))
    })
  },
}]

const result = ref('')
const events = ref<string[]>([])
const disabled = ref(false)
const readOnly = ref(false)
const dark = ref(false)
const size = ref<ControlSize>('medium')
const square = ref(false)
const danger = ref('#922448')
const fields = ['profile.email']
const rulesForm = useTemplateRef<FormInstance>('rulesForm')
const examples: { name: string; rule: FormRule; valid: unknown; invalid: unknown }[] = [
  { name: '数量', rule: { required: true }, valid: 0, invalid: [] },
  { name: '确认', rule: { boolean: true }, valid: false, invalid: 'true' },
  { name: '分数', rule: { number: true }, valid: 1.5, invalid: '1.5' },
  { name: '名称', rule: { whitespace: true }, valid: '门店', invalid: '  ' },
  { name: '长度', rule: { len: 3 }, valid: '中a', invalid: '中ab' },
  { name: '起订量', rule: { min: 10 }, valid: 10, invalid: 9 },
  { name: '限额', rule: { max: 0 }, valid: 0, invalid: 1 },
  { name: '状态', rule: { enum: ['ok', 'new'] }, valid: 'new', invalid: 'old' },
  { name: '编号', rule: { pattern: /^ID\d+$/g }, valid: 'ID12', invalid: 'IDabc' },
  { name: '日期', rule: { date: { format: 'YYYY-MM-DD', strictMode: true } }, valid: '2024-02-29', invalid: '2025-02-29' },
  { name: '邮箱', rule: { email: true }, valid: 'user@example.com', invalid: '@example.com' },
  { name: '网站', rule: { url: { protocols: ['https'], require_protocol: true } }, valid: 'https://example.com', invalid: 'http://example.com' },
  { name: '手机', rule: { telnumber: true }, valid: '13800138000', invalid: '1380013800' },
  { name: '证件', rule: { idcard: true }, valid: '11010519491231002X', invalid: '1234' },
]
const samples = reactive(Object.fromEntries(examples.map(({ name, valid }) => [name, valid])))
const sampleRules = Object.fromEntries(examples.map(({ name, rule }) => [name, [rule]]))
const failedSamples = ref('')

async function checkSamples() {
  const checked = await rulesForm.value!.validateOnly()
  failedSamples.value = checked === true ? '通过' : Object.keys(checked).join(',')
}

async function inspect(show: boolean) {
  const response = show
    ? await form.value!.validate({ fields })
    : await form.value!.validateOnly({ fields })
  result.value = JSON.stringify(response)
}

function reportSubmit(context: { e?: Event; validateResult: true | object; firstError?: string }) {
  const names = context.validateResult === true ? '通过' : Object.keys(context.validateResult).join(',')
  events.value.push(['提交', context.e?.type, String(context.e?.defaultPrevented), names, context.firstError].join('/'))
}
</script>

<template>
  <main>
    <label><input v-model="disabled" type="checkbox"> 禁用控件</label>
    <label><input v-model="readOnly" type="checkbox"> 只读控件</label>
    <label><input v-model="showLines" type="checkbox"> 展示明细</label>
    <label><input v-model="allowNative" type="checkbox"> 允许原生表单行为</label>
    <label><input v-model="dark" type="checkbox"> 深色</label>
    <label><input v-model="square" type="checkbox"> 直角</label>
    <label>全局尺寸 <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select></label>
    <label>浅色错误色 <input v-model="danger" type="color"></label>
    <ConfigProvider :size="size" :radius="12" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { danger }, dark: { danger: '#f3aabb' } }">
      <ConfigProvider :radius="square ? 0 : 3">
        <YmForm id="order" ref="form" :data="data" :rules="rules" :disabled="disabled" :readonly="readOnly" :prevent-submit-default="!allowNative"
          @validate="events.push('校验')" @submit="reportSubmit" @reset="events.push('重置')">
          <template #statusIcon="{ name, status }"><span :data-feedback="name">{{ status }}</span></template>
          <YmFormItem for="order-email" name="profile.email" :rules="emailRules" help="备用说明" label="备用标签">
            <template #label>通知邮箱</template>
            <template #help>接收出库通知</template>
            <template #default="{ controlProps }"><YmInput v-bind="controlProps" v-model="data.profile.email" /></template>
          </YmFormItem>
          <YmFormItem for="order-warehouse" label="仓库" name="warehouse" :status-icon="false">
            <YmSelect id="order-warehouse" v-model="data.warehouse" :options="locations" aria-label="仓库" />
          </YmFormItem>
          <YmFormItem for="order-note" label="备注" name="note">
            <YmInput id="order-note" v-model="data.note" />
          </YmFormItem>
          <YmFormItem for="order-comment" label="独立备注">
            <YmInput id="order-comment" :disabled="false" :readonly="false" />
          </YmFormItem>
          <YmFormItem for="order-login" label="账号" name="login" :rules="codeRules">
            <YmInput id="order-login" v-model="data.login" />
          </YmFormItem>
          <YmFormItem v-if="showLines" v-for="(line, i) in data.lines" :key="line.id"
            :label="'行' + line.id" :for="'code-' + line.id" :name="'lines[' + i + '].code'">
            <YmInput :id="'code-' + line.id" v-model="line.code" />
          </YmFormItem>
          <YmFormItem label="分类" name="labels"><output id="labels">{{ data.labels.join(',') }}</output></YmFormItem>
          <input v-if="allowNative" aria-label="原生备注" value="默认备注">
          <YmFormItem><YmButton type="submit">保存订单</YmButton><YmButton type="reset">清空表单</YmButton></YmFormItem>
        </YmForm>
        <YmForm id="compact" :data="{}" size="small"><YmFormItem label="局部尺寸"><YmInput /></YmFormItem></YmForm>
      </ConfigProvider>
    </ConfigProvider>
    <button type="button" @click="inspect(false)">静默检查邮箱</button>
    <button type="button" @click="inspect(true)">检查邮箱</button>
    <button type="button" @click="form?.submit({ showErrorMessage: false })">静默提交</button>
    <button type="button" @click="form?.setValidateMessage({ 'profile.email': [{ type: 'warning', message: '邮件系统维护中' }] })">设置服务端提示</button>
    <button type="button" @click="form?.clearValidate(fields)">清除邮箱校验</button>
    <button type="button" @click="form?.clearValidate(['login'])">清除账号校验</button>
    <button type="button" @click="form?.reset({ type: 'initial', fields: ['labels', 'note'] })">还原分类备注</button>
    <button type="button" @click="form?.reset({ type: 'initial' })">还原全部字段</button>
    <button type="button" @click="data.labels.push('冷链')">追加分类</button>
    <button type="button" @click="data.lines.push({ id: 2, code: '' })">增加明细</button>
    <button type="button" @click="data.lines.shift()">移除首行</button>
    <button type="button" @click="pendingRequests.splice(0).forEach(finish => finish())">返回旧结果</button>
    <button type="button" @click="submitAndWait">等待提交</button>
    <output id="finished-submits">{{ finishedSubmits }}</output>
    <output id="requests">{{ requests }}</output>
    <output id="result">{{ result }}</output>
    <output id="events">{{ events.join('|') }}</output>
    <YmForm ref="rulesForm" :data="samples" :rules="sampleRules">
      <YmFormItem v-for="item in examples" :key="item.name" :name="item.name" :label="item.name">
        <span>{{ samples[item.name] }}</span>
      </YmFormItem>
    </YmForm>
    <button type="button" @click="checkSamples">检查规则样本</button>
    <button type="button" @click="examples.forEach(item => samples[item.name] = item.invalid)">使用无效样本</button>
    <output id="samples">{{ failedSamples }}</output>
    <section id="empty-values">
      <YmForm ref="emptyForm" :data="emptyData">
        <YmFormItem name="num"><YmInputNumber v-model="emptyData.num" aria-label="数量" /></YmFormItem>
        <YmFormItem name="choice">
          <YmSelect v-model="emptyData.choice" aria-label="类型" :options="[{ label: '成品', value: 3 }]" />
        </YmFormItem>
        <YmFormItem name="enabled"><YmSwitch v-model="emptyData.enabled" :before-change="switchApproval" aria-label="启用" /></YmFormItem>
        <YmFormItem name="score"><YmRate v-model="emptyData.score" aria-label="评分" /></YmFormItem>
      </YmForm>
      <button type="button" @click="emptyForm?.reset({ fields: ['num'] })">只清数量</button>
      <button type="button" @click="emptyForm?.reset()">全部清空</button>
      <button type="button" @click="emptyForm?.reset({ type: 'initial' })">全部还原</button>
      <label><input v-model="waitForSwitch" type="checkbox"> 等待开关确认</label>
      <button type="button" @click="approveSwitch?.()">确认开关</button>
      <output>{{ JSON.stringify(emptyData) }}</output>
    </section>
    <button type="button" @click="showEntryFields = true">展示提交字段</button>
    <YmForm v-if="showEntryFields" id="entry-fields" :disabled="disabled" :readonly="readOnly">
      <YmSelect name="warehouse" multiple filterable :default-value="['sh', 'hz']" :options="locations" aria-label="提交仓库" />
      <YmTreeSelect name="tree" default-value="hz" :options="locations" filterable />
      <YmDatePicker name="date" default-value="2026-11-25" />
      <YmDatePicker name="dates" mode="range" :default-value="['2026-11-25', '2026-11-28']" />
      <YmTimePicker name="time" format="HH:mm" default-value="08:00" />
      <YmTimePicker name="times" mode="range" format="HH:mm" :default-value="['08:00', '17:00']" />
      <YmCheckboxGroup name="checks" :options="['甲', '乙']" :default-value="['甲']" />
      <YmRadioGroup name="delivery" :options="['快递', '自提']" default-value="快递" />
      <YmColorPicker :input-props="{ name: 'color' }" default-value="#112233" />
      <YmSelect name="explicit" :disabled="false" default-value="sh" :options="locations" />
    </YmForm>
  </main>
</template>
