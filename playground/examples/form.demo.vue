<script setup lang="ts" vapor>
import { reactive, ref } from 'vue'
import {
  YmButton, YmForm, YmFormItem, YmInput, YmSelect, YmSpace, YmSwitch,
  type FormProps, type FormRules, type FormSubmitContext,
} from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const data = reactive({ delivery: { contact: '', method: '' } })
const rules: FormRules = {
  delivery: {
    contact: [{ required: true, trigger: 'all', message: '请填写联系人' }],
    method: [{ required: true, message: '请选择配送方式' }],
  },
}
const deliveryOptions = [{ label: '快递', value: 'express' }, { label: '自提', value: 'pickup' }]
const layout = ref<FormProps['layout']>('vertical')
const align = ref<FormProps['labelAlign']>('right')
const size = ref<FormProps['size']>()
const disabled = ref(false)
const readOnly = ref(false)
const showError = ref(true)
const feedback = ref('')

function submit({ validateResult }: FormSubmitContext) {
  feedback.value = validateResult === true ? '已提交' : showError.value ? '' : '校验未通过'
}
</script>

<template>
  <PreviewFrame name="YmForm">
    <template #preview>
      <div class="form-example">
        <YmForm :data="data" :rules="rules" :layout="layout" :size="size" :label-align="align"
          :disabled="disabled" :readonly="readOnly" :show-error-message="showError"
          @submit="submit" @reset="feedback = '已重置'">
          <YmFormItem v-slot="{ controlProps }" name="delivery.contact" for="form-demo-contact" label="联系人">
            <YmInput v-bind="controlProps" v-model="data.delivery.contact" placeholder="请输入联系人" />
          </YmFormItem>
          <YmFormItem v-slot="{ controlProps }" name="delivery.method" label="配送方式">
            <YmSelect v-bind="controlProps" v-model="data.delivery.method" :options="deliveryOptions" placeholder="请选择配送方式" />
          </YmFormItem>
          <YmFormItem>
            <YmSpace size="small">
              <YmButton type="submit">提交</YmButton>
              <YmButton type="reset" theme="default" variant="outline">重置</YmButton>
            </YmSpace>
          </YmFormItem>
        </YmForm>
        <output v-if="feedback" class="form-feedback">{{ feedback }}</output>
      </div>
    </template>
    <template #controls>
      <label>表单布局
        <select v-model="layout"><option value="vertical">纵向</option><option value="inline">行内</option></select>
      </label>
      <label>标签对齐
        <select v-model="align">
          <option value="right">靠右</option><option value="left">靠左</option><option value="top">顶部</option>
        </select>
      </label>
      <label>表单尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>禁用表单 <YmSwitch v-model="disabled" /></label>
      <label>只读表单 <YmSwitch v-model="readOnly" /></label>
      <label>显示校验信息 <YmSwitch v-model="showError" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.form-example { width: 100%; }
.form-feedback { display: block; margin-top: .75rem; font-size: var(--ym-control-font-size); }
</style>
