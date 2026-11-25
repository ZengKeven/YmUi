<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmDescriptions, YmDescriptionsItem, type DescriptionsProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const column = ref(2)
const labelWidth = ref<DescriptionsProps['labelWidth']>()
const colSpan = ref(1)
const rowSpan = ref(1)
const size = ref<DescriptionsProps['size']>()
</script>

<template>
  <PreviewFrame name="YmDescriptions">
    <template #preview>
      <YmDescriptions :column="column" :label-width="labelWidth" :size="size">
        <YmDescriptionsItem label="供应商" content="杭州青禾纸业有限公司" :col-span="colSpan" :row-span="rowSpan" />
        <YmDescriptionsItem label="采购机构" content="华东采购中心" />
        <YmDescriptionsItem label="订单日期"><time datetime="2026-11-25">2026-11-25</time></YmDescriptionsItem>
        <YmDescriptionsItem label="交货日期"><time datetime="2026-11-30">2026-11-30</time></YmDescriptionsItem>
        <YmDescriptionsItem label="收货仓库" content="杭州一号仓" />
        <YmDescriptionsItem label="采购员" content="林悦" />
      </YmDescriptions>
    </template>
    <template #controls>
      <label>每行列数
        <select v-model="column"><option v-for="n in 3" :key="n" :value="n">{{ n }} 列</option></select>
      </label>
      <label>标签宽度
        <select v-model="labelWidth">
          <option :value="undefined">默认比例</option>
          <option :value="80">80 px</option>
          <option value="6rem">6 rem</option>
        </select>
      </label>
      <label>供应商占列
        <select v-model="colSpan"><option v-for="n in 3" :key="n" :value="n">{{ n }} 列</option></select>
      </label>
      <label>供应商占行
        <select v-model="rowSpan"><option v-for="n in 3" :key="n" :value="n">{{ n }} 行</option></select>
      </label>
      <label>描述尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>
