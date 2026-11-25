<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmDescriptions, YmDescriptionsItem, type ControlSize } from 'ym-ui-vapor'

const column = ref<number>()
const rowSpan = ref<number>()
const colSpan = ref<number>()
const labelWidth = ref<number | string>()
const customNestedWidth = ref(false)
const dark = ref(false)
const square = ref(false)
const surface = ref('#fff2e3')
const size = ref<ControlSize>('medium')
const remaining = ['机构', '日期', '仓库', '采购员']
const sequence = ref(0)
</script>

<template>
  <main>
    <label>列数 <input v-model.number="column" type="number" /></label>
    <label>占用行数 <input v-model.number="rowSpan" type="number" /></label>
    <label>占用列数 <input v-model.number="colSpan" type="number" /></label>
    <YmDescriptions id="purchase" :column="column">
      <YmDescriptionsItem label="供应商" content="杭州青禾纸业有限公司" :col-span="colSpan" :row-span="rowSpan" />
      <YmDescriptionsItem v-for="label in remaining" :key="label" :label="label" content="已确认" />
    </YmDescriptions>
    <YmDescriptions id="slots">
      <YmDescriptionsItem label="备用标签" content="备用内容">
        <template #label><b>送货次数</b></template>
        <template #content><button type="button" @click="sequence++">送货 {{ sequence }}</button></template>
        <template #default>默认内容</template>
      </YmDescriptionsItem>
      <YmDescriptionsItem label="备注" content="备用备注"><em>优先收货</em></YmDescriptionsItem>
      <YmDescriptionsItem :label="0" :content="0" />
    </YmDescriptions>
    <label>标签宽度
      <select v-model="labelWidth">
        <option :value="undefined">默认比例</option><option :value="80">80 像素</option>
        <option value="6rem">6rem</option><option value="20">20 像素</option>
      </select>
    </label>
    <label><input v-model="customNestedWidth" type="checkbox" /> 自定义内层宽度</label>
    <YmDescriptions id="sizing" :column="3" :label-width="labelWidth" style="width: 660px">
      <YmDescriptionsItem label="收货说明" :col-span="2" :row-span="2">
        {{ '连续收货批号20261125'.repeat(16) }}
      </YmDescriptionsItem>
      <YmDescriptionsItem label="仓库" content="一号仓" />
      <YmDescriptionsItem label="收货人" content="林悦" />
      <YmDescriptionsItem :col-span="3" label="配送详情">
        <YmDescriptions id="inner" :column="1" :label-width="customNestedWidth ? 60 : undefined">
          <YmDescriptionsItem label="配送方式" content="自提" />
        </YmDescriptions>
      </YmDescriptionsItem>
    </YmDescriptions>
    <label>全局尺寸
      <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label>浅色背景 <input v-model="surface" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="12"
      :theme="{ light: { surface, text: '#512d23', border: '#a8784a' }, dark: { surface: '#2a3440', text: '#f4ede5', border: '#68788b' } }">
      <ConfigProvider :radius="square ? 0 : 3">
        <YmDescriptions id="inherited"><YmDescriptionsItem label="联系人" content="林悦" /></YmDescriptions>
        <YmDescriptions id="local" size="small"><YmDescriptionsItem label="联系人" content="林悦" /></YmDescriptions>
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
