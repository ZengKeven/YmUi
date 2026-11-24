<script setup lang="ts" vapor>
import { nextTick, ref, useTemplateRef } from 'vue'
import { YmButton, YmIcon, YmInput, YmSwitch, YmTag, type TagProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const initialWarehouses = ['上海仓', '杭州仓']
const warehouses = ref([...initialWarehouses])
const theme = ref<TagProps['theme']>('default')
const variant = ref<TagProps['variant']>('light')
const shape = ref<TagProps['shape']>('square')
const size = ref<TagProps['size']>()
const closable = ref(true)
const disabled = ref(false)
const showIcon = ref(true)

function remove(warehouse: string) {
  warehouses.value = warehouses.value.filter(item => item !== warehouse)
}

const shapes = [['square', '直角'], ['round', '两端圆角'], ['mark', '右端圆角']] as const
const colors = [
  ['primary', '标签一'], ['success', '标签二'], ['warning', '标签三'], ['danger', '标签四'],
] as const
const variants = ['dark', 'light', 'outline'] as const
const colorRows = ref(variants.map(variant => ({ variant, tags: [...colors] })))
const tags = ref<{ label: string; maxWidth?: number; icon?: boolean }[]>([
  { label: '可删除标签可删除标签', maxWidth: 148 },
  { label: '可删除标签可删除标签（带图标）', maxWidth: 168, icon: true },
])
const editing = ref(false)
const draft = ref('')
const addButton = useTemplateRef<HTMLButtonElement>('addButton')

function finishEditing(save: boolean) {
  const label = draft.value.trim()
  if (save && label && !tags.value.some(tag => tag.label === label)) tags.value.push({ label })
  draft.value = ''
  editing.value = false
}

function onEditorKey(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return
  if (event.key !== 'Enter' && event.key !== 'Escape') return
  event.preventDefault()
  finishEditing(event.key === 'Enter')
  nextTick(() => addButton.value?.focus())
}
</script>

<template>
  <PreviewFrame name="YmTag">
    <template #preview>
      <div class="demo-row">
        <YmTag v-for="warehouse in warehouses" :key="warehouse" :content="warehouse"
          :theme="theme" :variant="variant" :shape="shape" :size="size" :closable="closable" :disabled="disabled"
          :close-label="`移除 ${warehouse}`" @close="remove(warehouse)">
          <template v-if="showIcon" #icon><YmIcon name="warehouse" /></template>
        </YmTag>
        <span v-if="!warehouses.length" role="status">已移除全部仓库</span>
      </div>
    </template>
    <template #controls>
      <label>标签主题
        <select v-model="theme">
          <option value="default">默认</option><option value="primary">主要</option><option value="success">成功</option>
          <option value="warning">警告</option><option value="danger">危险</option>
        </select>
      </label>
      <label>标签样式
        <select v-model="variant">
          <option value="dark">实心</option><option value="light">浅色</option>
          <option value="outline">描边</option><option value="light-outline">浅色描边</option>
        </select>
      </label>
      <label>标签形状
        <select v-model="shape">
          <option v-for="[value, label] in shapes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>标签尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示图标 <YmSwitch v-model="showIcon" /></label>
      <label>可关闭 <YmSwitch v-model="closable" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
      <YmButton v-if="warehouses.length < initialWarehouses.length" variant="outline"
        @click="warehouses = [...initialWarehouses]">恢复标签</YmButton>
    </template>
    <section class="example-section" aria-labelledby="tag-editable-heading">
      <h3 id="tag-editable-heading">移除与添加</h3>
      <div class="tag-examples">
        <div v-for="row in colorRows" :key="row.variant" class="tag-row">
          <YmTag v-for="([color, label], index) in row.tags" :key="color" :theme="color" :variant="row.variant"
            closable :content="label" @close="row.tags.splice(index, 1)" />
        </div>
        <div class="tag-row">
          <YmTag v-for="(tag, index) in tags" :key="tag.label" :content="tag.label" :max-width="tag.maxWidth"
            :title="tag.label" closable @close="tags.splice(index, 1)">
            <template v-if="tag.icon" #icon><YmIcon name="promotion" /></template>
          </YmTag>
          <YmTag disabled>可删除标签</YmTag>
        </div>
        <div class="tag-row">
          <YmInput v-if="editing" v-model="draft" class="tag-editor" size="small" autofocus
            aria-label="新标签名称" @keydown="onEditorKey" @blur="finishEditing(true)" />
          <button v-else ref="addButton" type="button" class="add-tag" @click="editing = true">
            <YmTag><template #icon><YmIcon name="add" /></template>添加标签</YmTag>
          </button>
        </div>
      </div>
    </section>
    <section class="example-section" aria-labelledby="tag-shapes-heading">
      <h3 id="tag-shapes-heading">标签形状</h3>
      <div class="tag-examples">
        <div v-for="[value, label] in shapes" :key="value" class="tag-row" role="group" :aria-label="label">
          <YmTag :shape="value">标签一</YmTag>
          <YmTag :shape="value" theme="primary">标签一</YmTag>
        </div>
      </div>
    </section>
  </PreviewFrame>
</template>

<style scoped>
.tag-examples {
  display: grid;
  gap: 1rem;
  padding: clamp(1rem, 4vw, 2.5rem);
  border: 1px solid var(--demo-rule);
  border-radius: .45rem;
}
.tag-row { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
.tag-editor { width: 8rem; }
.add-tag { display: inline-flex; padding: 0; background: transparent; cursor: pointer; }
.add-tag:focus-visible { outline: 2px solid var(--ym-color-primary); outline-offset: 2px; }
</style>
