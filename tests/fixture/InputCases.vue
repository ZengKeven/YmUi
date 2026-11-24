<script setup lang="ts" vapor>
import { ref, useTemplateRef } from 'vue'
import { ConfigProvider, YmInput } from 'ym-ui-vapor'

const text = ref('')
const autofocusType = ref<'text' | 'password'>()
const autofocusText = ref('原有别名')
const field = useTemplateRef<{ focus(): void; blur(): void }>('field')
const updates = ref<string[]>([])
const changes = ref<string[]>([])
const events = ref<string[]>([])
const rejected = ref('')
const type = ref<'text' | 'password'>('password')
const passwordChanges = ref(0)
const disabled = ref(false)
const borderless = ref(false)
const readOnly = ref(false)
const compact = ref(false)
const dark = ref(false)
const primary = ref('#21654a')

function recordEvent(e: Event) {
  if (e.target instanceof HTMLInputElement) events.value.push(e.type)
}

function recordChange(value: string, { e }: { e: Event }) {
  if (e instanceof Event) changes.value.push(value)
}

function setUnsupportedType() {
  // @ts-expect-error 模拟 JavaScript 调用方传入不受支持的类型。
  type.value = 'number'
}
</script>

<template>
  <section id="input-cases">
    <form id="input-form" @submit.prevent>
      <label for="input-alias">账户别名</label>
      <YmInput id="input-alias" ref="field" v-model="text" value="旧别名" name="alias" required maxlength="12"
        class="alias-field" style="width: 240px"
        placeholder="输入别名" autocomplete="nickname" :readonly="readOnly" :disabled="disabled" :borderless="borderless"
        @update:model-value="updates.push($event)"
        @change="recordChange"
        @focus="recordEvent" @blur="recordEvent" @input="recordEvent" @keydown="recordEvent" />
      <YmInput aria-label="访问口令" :type="type" name="passcode" :disabled="disabled"
        default-value="initial" autocomplete="current-password" @change="passwordChanges++" />
    </form>
    <button type="reset" form="input-form">重置输入表单</button>
    <button @click="text = '外部修改'">设置账户别名</button>
    <button @mousedown.prevent @click="field?.focus()">聚焦账户别名</button>
    <button @mousedown.prevent @click="field?.blur()">移开别名焦点</button>
    <button @click="readOnly = !readOnly">切换别名只读</button>
    <button @click="disabled = !disabled">切换输入框禁用</button>
    <button @click="borderless = !borderless">切换输入框边框</button>
    <button @click="type = type === 'password' ? 'text' : 'password'">切换口令类型</button>
    <button @click="setUnsupportedType">传入其他输入类型</button>
    <output id="input-model">{{ text }}</output>
    <output id="input-updates">{{ JSON.stringify(updates) }}</output>
    <output id="input-changes">{{ JSON.stringify(changes) }}</output>
    <output id="input-events">{{ events.join(' ') }}</output>
    <output id="input-password-changes">{{ passwordChanges }}</output>
    <YmInput value="审核中" aria-label="受控别名" @update:model-value="rejected = $event" />
    <output id="input-rejected">{{ rejected }}</output>

    <button @click="autofocusType = 'text'">打开别名编辑框</button>
    <button @click="autofocusType = 'password'">打开密码编辑框</button>
    <YmInput v-if="autofocusType === 'text'" v-model="autofocusText" autofocus :disabled="disabled" aria-label="自动聚焦别名" />
    <YmInput v-if="autofocusType === 'password'" type="password" default-value="old-password" autofocus aria-label="自动聚焦密码" />

    <button @click="dark = !dark">切换输入框模式</button>
    <button @click="compact = !compact">切换输入框大小和圆角</button>
    <label>输入框浅色焦点色 <input v-model="primary" type="color" /></label>
    <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary }, dark: { primary: '#9abcde', surface: '#2a3544' } }">
      <ConfigProvider :radius="compact ? 0 : 11">
        <YmInput aria-label="继承配置的输入框" />
        <YmInput aria-label="指定尺寸的输入框" size="small" />
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
