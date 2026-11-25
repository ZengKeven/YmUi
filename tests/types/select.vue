<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmSelect } from '../../src'

const options = [{ label: '商品', value: 0 }]
const selected = ref(0)
const optional = ref<number | null>(null)
const multiple = ref<number[]>([])
const allowClear = ref(false)
</script>

<template>
  <YmSelect :options="options" @change="selected = $event" />
  <YmSelect clearable :options="options" @change="optional = $event" />
  <YmSelect :clearable="allowClear" :options="options" @change="optional = $event" />
  <YmSelect multiple clearable :options="options" @change="multiple = $event" />
  <!-- @vue-expect-error 可清空的单选在清空时返回 null。 -->
  <YmSelect clearable :options="options" @change="selected = $event" />
</template>
