<script setup lang="ts" vapor>
import { onScopeDispose, ref } from 'vue'
import { YmButton, YmIcon, type ButtonProps } from '../../src'
import { sizes } from './settings'
import PreviewFrame from './PreviewFrame.vue'

const theme = ref<ButtonProps['theme']>('primary')
const variant = ref<ButtonProps['variant']>('base')
const shape = ref<ButtonProps['shape']>('rectangle')
const size = ref<ButtonProps['size']>()
const type = ref<ButtonProps['type']>('button')
const block = ref(false)
const disabled = ref(false)
const loading = ref(false)
const clicks = ref(0)
const saving = ref(false)
const saves = ref(0)
let saveTimer: number | undefined

const themes = [
  ['default', '默认'], ['primary', '主要'], ['success', '成功'], ['warning', '警告'], ['danger', '危险'],
] as const
const variants = [['base', '填充'], ['outline', '描边'], ['dashed', '虚线'], ['text', '文字']] as const

function save() {
  if (saving.value) return
  saving.value = true
  saveTimer = window.setTimeout(() => {
    saves.value++
    saving.value = false
  }, 1000)
}
onScopeDispose(() => window.clearTimeout(saveTimer))
</script>

<template>
  <PreviewFrame name="YmButton">
    <template #preview>
      <YmButton :theme="theme" :variant="variant" :shape="shape" :size="size" :type="type"
        :block="block" :disabled="disabled" :loading="loading"
        @click="clicks++">确定</YmButton>
    </template>
    <template #controls>
      <label>block <input v-model="block" type="checkbox" /></label>
      <label>disabled <input v-model="disabled" type="checkbox" /></label>
      <label>loading <input v-model="loading" type="checkbox" /></label>
      <label>theme <select v-model="theme"><option v-for="[value] in themes" :key="value">{{ value }}</option></select></label>
      <label>variant <select v-model="variant"><option v-for="[value] in variants" :key="value">{{ value }}</option></select></label>
      <label>shape <select v-model="shape"><option>rectangle</option><option>round</option><option>square</option><option>circle</option></select></label>
      <label>size
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value] in sizes" :key="value">{{ value }}</option>
        </select>
      </label>
      <label>type
        <select v-model="type"><option>button</option><option>submit</option><option>reset</option></select>
      </label>
    </template>
    <section class="example-section">
      <h3>主题与样式</h3>
      <div class="example-row"><span class="row-label">主题</span><div class="buttons">
        <YmButton v-for="[value, label] in themes" :key="value" :theme="value">{{ label }}</YmButton>
      </div></div>
      <div class="example-row"><span class="row-label">样式</span><div class="buttons">
        <YmButton v-for="[value, label] in variants" :key="value" theme="primary" :variant="value">{{ label }}</YmButton>
        <YmButton ghost>幽灵</YmButton>
      </div></div>
    </section>

    <section class="example-section">
      <h3>尺寸与形状</h3>
      <div class="example-row"><span class="row-label">指定尺寸</span><div class="buttons">
        <YmButton v-for="[value, label] in sizes" :key="value" :size="value" variant="outline">{{ label }}</YmButton>
      </div></div>
      <div class="example-row"><span class="row-label">形状</span><div class="buttons">
        <YmButton theme="default">矩形</YmButton>
        <YmButton theme="default" shape="round">胶囊</YmButton>
        <YmButton theme="default" shape="square" aria-label="增加一次" @click="clicks++"><template #icon><YmIcon name="add" /></template></YmButton>
        <YmButton theme="default" shape="circle" aria-label="增加一次" @click="clicks++"><template #icon><YmIcon name="add" /></template></YmButton>
      </div></div>
      <div class="example-row"><span class="row-label">块级</span><div class="buttons">
        <YmButton block variant="dashed">占满容器宽度</YmButton>
      </div></div>
    </section>

    <section class="example-section">
      <h3>插槽与交互</h3>
      <div class="example-row"><span class="row-label">content 属性</span><div class="buttons">
        <YmButton content="保存"></YmButton>
        <code>&lt;YmButton content="保存"&gt;&lt;/YmButton&gt;</code>
      </div></div>
      <div class="example-row"><span class="row-label">默认插槽</span><div class="buttons">
        <YmButton>保存</YmButton>
        <code>&lt;YmButton&gt;保存&lt;/YmButton&gt;</code>
      </div></div>
      <div class="example-row"><span class="row-label">点击事件</span><div class="buttons">
        <YmButton @click="clicks++"><template #icon><YmIcon name="add" /></template>添加一次</YmButton>
        <output aria-live="polite">已点击 {{ clicks }} 次</output>
      </div></div>
      <div class="example-row"><span class="row-label">链接</span><div class="buttons">
        <YmButton href="#form-demo" variant="text" theme="primary" content="查看表单示例">
          <template #suffix>↓</template>
        </YmButton>
        <YmButton href="#form-demo" variant="text" disabled>禁用链接</YmButton>
      </div></div>
      <div id="form-demo" class="example-row"><span class="row-label">原生表单</span>
        <form id="save-demo" class="buttons" @submit.prevent="save">
          <YmButton type="submit" form="save-demo" :loading="saving" :loading-props="{ delay: 150, size: 'small' }">
            {{ saving ? '保存中' : '模拟保存' }}
          </YmButton>
          <YmButton disabled>禁用</YmButton>
          <output aria-live="polite">已保存 {{ saves }} 次</output>
        </form>
      </div>
    </section>
  </PreviewFrame>
</template>
