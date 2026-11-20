<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmSteps, type StepOption, type StepValue } from 'ym-ui-vapor'

const indexed = [{ title: '填写' }, { title: '审核' }, { title: '归档' }]
const options: StepOption[] = [
  { title: '提交申请', value: 'draft', content: '填写单据', icon: 'edit' },
  { title: '主管审批', value: 0, extra: '需双人核对' },
  { title: '发货', value: 'ship' },
  { title: '对账', value: 'bill', status: 'error' },
]
const current = ref<StepValue>(0)
const changes = ref<string[]>([])
const updates = ref<StepValue[]>([])
const readonly = ref(false)
const reverse = ref(false)
const vertical = ref(false)
const compact = ref(false)
const dark = ref(false)
const localSize = ref(false)
const primary = ref('#236547')
const extraClicks = ref(0)

function recordChange(next: StepValue, previous: StepValue, context: { e: MouseEvent }) {
  changes.value.push(`${previous}→${next}/${context.e instanceof MouseEvent}`)
}
</script>

<template>
  <div id="steps-default"><YmSteps :options="indexed" /></div>
  <div id="steps-complete"><YmSteps :options="indexed" :current="indexed.length" readonly /></div>
  <div id="steps-cases">
    <label><input v-model="readonly" type="checkbox" /> 步骤只读</label>
    <label><input v-model="reverse" type="checkbox" /> 步骤倒序</label>
    <label><input v-model="vertical" type="checkbox" /> 步骤纵向</label>
    <label><input v-model="compact" type="checkbox" /> 步骤紧凑配置</label>
    <label><input v-model="dark" type="checkbox" /> 步骤深色模式</label>
    <label><input v-model="localSize" type="checkbox" /> 步骤局部尺寸</label>
    <label>步骤浅色主色 <input v-model="primary" type="color" /></label>
    <button @click="current = 'FINISH'">完成流程</button>
    <button @click="current = 'missing'">未匹配步骤</button>
    <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="compact ? 'small' : 'large'"
      :theme="{ light: { primary, success: '#225588', danger: '#883322' }, dark: { primary: '#99bbdd' } }">
      <ConfigProvider :radius="compact ? 0 : 13">
        <YmSteps :options="options" v-model:current="current" :readonly="readonly"
          :sequence="reverse ? 'reverse' : 'positive'" :layout="vertical ? 'vertical' : 'horizontal'"
          :size="localSize ? 'extra-small' : undefined" @update:current="updates.push($event)" @change="recordChange" />
      </ConfigProvider>
    </ConfigProvider>
    <output id="steps-model">{{ current }}</output>
    <output id="steps-updates">{{ updates.join(',') }}</output>
    <output id="steps-changes">{{ changes.join(',') }}</output>
  </div>
  <div id="steps-slots">
    <YmSteps :options="options">
      <template #title="{ option, index }">步骤 {{ index + 1 }} · {{ option.title }}</template>
      <template #content="{ option, status }">{{ option.title }} / {{ status }}</template>
      <template #icon="{ index }"><span>标记 {{ index + 1 }}</span></template>
      <template #extra="{ index }"><button v-if="index === 1" @click="extraClicks++">核对记录</button></template>
    </YmSteps>
    <output>{{ extraClicks }}</output>
  </div>
</template>
