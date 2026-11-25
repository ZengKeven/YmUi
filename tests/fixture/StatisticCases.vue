<script setup lang="ts" vapor>
import { ref, useTemplateRef } from 'vue'
import { ConfigProvider, YmStatistic, type ControlSize, type StatisticInstance } from 'ym-ui-vapor'

const value = ref(-1234567.895)
const places = ref<number>()
const separator = ref(',')
const customFormat = ref(false)
const formatAmount = (amount: number) => '金额 ' + amount
const loading = ref(false)
const placement = ref<'left' | 'right'>('left')
const trend = ref<'increase' | 'decrease'>('increase')
const prefix = ref('')
const anim = useTemplateRef<StatisticInstance>('anim')
const target = ref(125)
const duration = ref(1000)
const automatic = ref(false)
const configured = ref(true)
const showAuto = ref(false)
const size = ref<ControlSize>('medium')
const dark = ref(false)
const primary = ref('#456789')
const square = ref(false)
</script>

<template>
  <main>
    <YmStatistic id="default" />
    <label>金额 <input v-model.number="value" type="number" step="any" /></label>
    <label>精度
      <select v-model="places"><option :value="undefined">自动</option><option :value="0">0</option><option :value="2">2</option></select>
    </label>
    <label>分组符 <select v-model="separator"><option value=",">逗号</option><option value="_">下划线</option><option value="">无</option></select></label>
    <label><input v-model="customFormat" type="checkbox" /> 自定义格式</label>
    <YmStatistic id="formatted" :value="value" :decimal-places="places" :separator="separator"
      :format="customFormat ? formatAmount : undefined" />

    <label>趋势 <select v-model="trend"><option>increase</option><option>decrease</option></select></label>
    <label>位置 <select v-model="placement"><option>left</option><option>right</option></select></label>
    <label>前缀 <input v-model="prefix" /></label>
    <label><input v-model="loading" type="checkbox" /> 显示加载</label>
    <YmStatistic id="fields" title="昨日订单" :value="120" unit="笔" extra="已确认"
      :trend="trend" :trend-placement="placement" :prefix="prefix" :loading="loading" />
    <YmStatistic id="slots" title="原始标题" prefix="原始前缀" unit="原始单位" suffix="原始后缀" extra="原始备注"
      :value="4" :trend="trend" :trend-placement="placement">
      <template #title><strong>当月库存</strong></template>
      <template #prefix><b>约</b></template>
      <template #unit><i>箱</i></template>
      <template #suffix><b>可用</b></template>
      <template #extra><small>已盘点</small></template>
    </YmStatistic>

    <label>目标值 <input v-model.number="target" type="number" /></label>
    <label>时长 <input v-model.number="duration" type="number" /></label>
    <label><input v-model="automatic" type="checkbox" /> 自动播放</label>
    <label><input v-model="configured" type="checkbox" /> 配置动画</label>
    <button @click="anim?.start()">手动重播</button>
    <YmStatistic id="animated" ref="anim" :value="target" :decimal-places="0"
      :animation="configured ? { duration, valueFrom: 25 } : undefined" :animation-start="automatic" />
    <label><input v-model="showAuto" type="checkbox" /> 挂载自动动画</label>
    <YmStatistic v-if="showAuto" id="onmount" :value="-150" :animation="{ duration: 1000, valueFrom: 100.75 }" animation-start />

    <label>全局尺寸 <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select></label>
    <label>主题主色 <input type="color" v-model="primary" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 使用直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="12"
      :theme="{ light: { primary, text: '#243546' }, dark: { primary: '#aaccdd', text: '#e3e7ea' } }">
      <ConfigProvider :radius="square ? 0 : 5">
        <YmStatistic id="inherited" :value="25" color="blue" :loading="loading" />
        <YmStatistic id="default-color" :value="25" />
        <YmStatistic id="local" :value="25" size="small" color="#246824" />
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
