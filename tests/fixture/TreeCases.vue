<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmTree, type ControlSize, type TreeNode, type TreeValue } from 'ym-ui-vapor'

const categories: TreeNode[] = [
  { label: '食品', value: 'food', children: [
    { label: '水果', value: 'fruit', children: [
      { label: 'Apple 苹果', value: 0 }, { label: '梨', value: '0' },
    ] },
    { label: '饼干', value: 'biscuits' },
  ] },
  { label: '饮品', value: 'drinks' },
]
const updates = ref<TreeValue[]>([])
const changes = ref<[TreeValue, string][]>([])
const filterable = ref(true)
const controlled = ref<TreeValue | null>(0)
const accept = ref(false)
const data = ref(categories)
const controlledChanges = ref<TreeValue[]>([])
const size = ref<ControlSize>('medium')
const dark = ref(false)
const square = ref(false)
const primary = ref('#26734b')

function record(value: TreeValue, node: TreeNode) {
  changes.value.push([value, node.label])
}
function request(value: TreeValue) {
  if (accept.value) controlled.value = value
}
</script>

<template>
  <section id="basic">
    <YmTree :data="categories" :default-expanded="['food']" :filterable="filterable"
      @update:model-value="updates.push($event)" @change="record" />
    <output id="updates">{{ JSON.stringify(updates) }}</output>
    <output id="changes">{{ JSON.stringify(changes) }}</output>
    <label><input v-model="filterable" type="checkbox" /> 显示分类过滤</label>
  </section>
  <section id="controlled">
    <YmTree :data="data" :model-value="controlled" filter-placeholder="搜索分类名称"
      @update:model-value="request" @change="controlledChanges.push($event)" />
    <label><input v-model="accept" type="checkbox" /> 应用选择</label>
    <button @click="controlled = null">清除高亮</button>
    <button @click="data = []">移除分类</button>
    <button @click="data = categories">恢复分类</button>
    <output id="controlled-changes">{{ JSON.stringify(controlledChanges) }}</output>
  </section>
  <section id="configured">
    <label>尺寸 <select v-model="size"><option v-for="s in ['extra-small', 'small', 'medium', 'large']" :key="s">{{ s }}</option></select></label>
    <label>分类主色 <input v-model="primary" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角节点</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="12"
      :theme="{ light: { primary, surface: '#f5efe3' }, dark: { primary: '#adc9ea', surface: '#192738' } }">
      <ConfigProvider :radius="square ? 0 : 7">
        <div id="inherited"><YmTree :data="categories" default-value="drinks" /></div>
        <div id="local"><YmTree :data="categories" size="small" /></div>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
