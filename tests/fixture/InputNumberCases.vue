<script setup lang="ts" vapor>
import { ref, useTemplateRef } from 'vue'
import { ConfigProvider, YmInputNumber } from 'ym-ui-vapor'

const amount = ref<number | null>(0)
const initialFocusAmount = ref<number>()
const updates = ref<(number | null)[]>([])
const changes = ref<(number | null)[]>([])
const disabled = ref(false)
const readOnly = ref(false)
const field = useTemplateRef<{ focus(): void; blur(): void }>('field')
const compact = ref(false)
const dark = ref(false)
const danger = ref('#ba2847')
const themedValue = ref(-2)

function recordChange(value: number | null, { e }: { e: Event }) {
  if (e instanceof Event) changes.value.push(value)
}
</script>

<template>
  <section id="input-number-cases">
    <form id="amount-form" @submit.prevent></form>
    <YmInputNumber id="amount" ref="field" v-model="amount" form="amount-form" name="amount" aria-label="记账金额"
      placeholder="输入金额" :min="-5" :max="5" :decimal-places="2" :disabled="disabled" :readonly="readOnly"
      @update:model-value="updates.push($event)" @change="recordChange" />
    <output id="amount-model">{{ JSON.stringify(amount) }}</output>
    <output id="amount-updates">{{ JSON.stringify(updates) }}</output>
    <output id="amount-changes">{{ JSON.stringify(changes) }}</output>
    <button @mousedown.prevent @click="field?.focus()">聚焦记账金额</button>
    <button @mousedown.prevent @click="field?.blur()">移开金额焦点</button>
    <button @click="readOnly = !readOnly">切换金额只读</button>
    <button @click="disabled = !disabled">切换金额禁用</button>
    <form id="uncontrolled-number-form">
      <YmInputNumber aria-label="自管数值" :default-value="12.5" />
      <button type="reset">重置自管数值</button>
    </form>
    <YmInputNumber aria-label="锁定数值" :value="4" />

    <button @click="initialFocusAmount = -12.5">打开负数编辑框</button>
    <button @click="initialFocusAmount = 0">打开零值编辑框</button>
    <YmInputNumber v-if="initialFocusAmount !== undefined" :key="initialFocusAmount" :default-value="initialFocusAmount"
      :decimal-places="2" autofocus :disabled="disabled" aria-label="自动聚焦金额" />

    <button @click="themedValue = -themedValue">切换数值正负</button>
    <button @click="dark = !dark">切换数值模式</button>
    <button @click="compact = !compact">切换数值尺寸和圆角</button>
    <label>数值负数颜色 <input v-model="danger" type="color" /></label>
    <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { danger, text: '#204365' }, dark: { danger: '#f89d9c', surface: '#273340' } }">
      <ConfigProvider :radius="compact ? 0 : 9">
        <YmInputNumber aria-label="继承配置的数值" :model-value="themedValue" />
        <YmInputNumber aria-label="局部尺寸的数值" size="small" />
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
