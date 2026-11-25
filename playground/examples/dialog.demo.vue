<script setup lang="ts" vapor>
import { reactive, ref, useTemplateRef } from 'vue'
import { YmButton, YmDialog, YmForm, YmFormItem, YmInput, YmSpace, YmSwitch, YmTextarea,
  type ControlSize, type DialogPlacement, type FormInstance, type FormRules } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const confirmOpen = ref(false)
const formOpen = ref(false)
const templateOpen = ref(false)
const placement = ref<DialogPlacement>('center')
const attach = ref('body')
const size = ref<ControlSize>()
const closeBtn = ref(true)
const failNextSave = ref(false)
const saving = ref(false)
const feedback = ref('')
const saveError = ref('')
const saved = reactive({ contact: '', note: '' })
const draft = reactive({ ...saved })
const form = useTemplateRef<FormInstance>('deliveryForm')
const rules: FormRules = { contact: [{ required: true, message: '请填写收货人' }] }

function markReceived() { feedback.value = '已标记到货' }
function applyTemplate() { draft.note = '请在到货前联系收货人' }

function editDelivery() {
  Object.assign(draft, saved)
  saveError.value = ''
  formOpen.value = true
}

async function saveDelivery() {
  saveError.value = ''
  if (await form.value?.validate() !== true) return false
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 450))
    if (failNextSave.value) {
      failNextSave.value = false
      throw new Error('保存失败，请重试。')
    }
    Object.assign(saved, draft)
    feedback.value = '已保存' + draft.contact + '的收货信息'
  } finally {
    saving.value = false
  }
}

function showSaveError({ error }: { error: unknown }) {
  saveError.value = error instanceof Error ? error.message : '保存失败，请重试。'
}
</script>

<template>
  <PreviewFrame name="YmDialog">
    <template #preview>
      <div id="dialog-demo-host">
        <YmSpace>
          <YmButton variant="outline" @click="confirmOpen = true">确认到货</YmButton>
          <YmButton @click="editDelivery">编辑收货信息</YmButton>
        </YmSpace>
        <output v-if="feedback" class="dialog-demo-feedback">{{ feedback }}</output>
      </div>
      <YmDialog v-model:visible="confirmOpen" header="确认到货" body="货物已送达仓库，是否标记为已到货？"
        confirm-btn="标记到货" :attach="attach" :placement="placement" :size="size" :close-btn="closeBtn"
        @confirm="markReceived" />
      <YmDialog v-model:visible="formOpen" header="编辑收货信息" confirm-btn="保存" :width="520"
        :attach="attach" :placement="placement" :size="size" :close-btn="closeBtn"
        :on-confirm="saveDelivery" @action-error="showSaveError">
        <YmForm ref="deliveryForm" :data="draft" :rules="rules" label-align="top" :disabled="saving">
          <YmFormItem v-slot="{ controlProps }" name="contact" label="收货人">
            <YmInput v-bind="controlProps" v-model="draft.contact" placeholder="请输入姓名" />
          </YmFormItem>
          <YmFormItem v-slot="{ controlProps }" name="note" label="收货备注">
            <YmTextarea v-bind="controlProps" v-model="draft.note" :rows="3" />
          </YmFormItem>
          <YmButton variant="text" @click="templateOpen = true">套用备注模板</YmButton>
        </YmForm>
        <p v-if="saveError" class="dialog-demo-error" role="alert">{{ saveError }}</p>
        <YmDialog v-model:visible="templateOpen" header="套用备注模板" body="将收货备注替换为「请在到货前联系收货人」。"
          confirm-btn="套用" :width="360" :close-btn="closeBtn" @confirm="applyTemplate" />
      </YmDialog>
    </template>
    <template #controls>
      <label>弹出位置
        <select v-model="placement"><option value="center">居中</option><option value="top">靠上</option></select>
      </label>
      <label>挂载元素
        <select v-model="attach"><option value="body">页面 body</option><option value="#dialog-demo-host">示例容器</option></select>
      </label>
      <label>对话框尺寸
        <select v-model="size"><option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示关闭按钮 <YmSwitch v-model="closeBtn" /></label>
      <label>模拟下次保存失败 <YmSwitch v-model="failNextSave" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.dialog-demo-feedback { display: block; margin-top: .75rem; text-align: center; }
.dialog-demo-error { margin: .5rem 0 0; color: var(--ym-color-danger); }
</style>
