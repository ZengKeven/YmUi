<script setup lang="ts" vapor>
import { ref, useTemplateRef } from 'vue'
import { ConfigProvider, YmTextarea } from 'ym-ui-vapor'

const notes = ref('')
const field = useTemplateRef<{ focus(): void; blur(): void }>('notesField')
const updates = ref<string[]>([])
const changes = ref<string[]>([])
const events = ref<string[]>([])
const locked = ref(false)
const disabled = ref(false)
const rejected = ref('')
const edit = ref(false)
const weighted = ref(false)
const allowOver = ref(false)
const validations = ref<string[]>([])
const bounded = ref(true)
const dark = ref(false)
const compact = ref(false)
const primary = ref('#265327')

function recordNative(e: Event) {
  if (e.target instanceof HTMLTextAreaElement) events.value.push(e.type)
}
function recordChange(value: string, { e }: { e: Event }) {
  if (e.target instanceof HTMLTextAreaElement) changes.value.push(value)
}
</script>

<template>
  <section id="textarea-cases">
    <form id="textarea-form"><button type="reset">重置多行文本</button></form>
    <label for="textarea-notes">订单备注</label>
    <YmTextarea id="textarea-notes" ref="notesField" v-model="notes" value="备用值" name="notes"
      form="textarea-form" placeholder="填写备注" required align="right" :disabled="disabled" :readonly="locked"
      @update:model-value="updates.push($event)" @change="recordChange"
      @focus="recordNative" @blur="recordNative" @keydown="recordNative" />
    <YmTextarea aria-label="草稿" default-value="初稿" name="draft" form="textarea-form" />
    <YmTextarea aria-label="已归档备注" value="已归档" @update:model-value="rejected = $event" />
    <output id="textarea-rejected">{{ rejected }}</output>
    <button @mousedown.prevent @click="field?.focus()">聚焦订单备注</button>
    <button @mousedown.prevent @click="field?.blur()">移开备注焦点</button>
    <button @click="notes = '外部修改'">填入外部备注</button>
    <button @click="locked = !locked">切换备注只读</button>
    <button @click="disabled = !disabled">切换备注禁用</button>
    <output id="textarea-updates">{{ JSON.stringify(updates) }}</output>
    <output id="textarea-changes">{{ JSON.stringify(changes) }}</output>
    <output id="textarea-events">{{ events.join(' ') }}</output>

    <button @click="edit = true">编辑备注模板</button>
    <YmTextarea v-if="edit" aria-label="备注模板" default-value="原有模板" autofocus />

    <div id="textarea-limit">
      <YmTextarea aria-label="限长备注" maxlength="4" :maxcharacter="weighted ? 5 : undefined"
        :allow-input-over-max="allowOver" tips="默认提示" @validate="validations.push($event.error ?? 'ok')">
        <template #tips>请填写配送要求</template>
      </YmTextarea>
    </div>
    <button @click="weighted = true">启用加权计数</button>
    <button @click="allowOver = true">允许备注超长</button>
    <output id="textarea-validations">{{ validations.join(' ') }}</output>

    <div style="width: 220px">
      <YmTextarea aria-label="自适应备注" :autosize="bounded ? { minRows: 2, maxRows: 4 } : true" />
    </div>
    <button @click="bounded = false">解除行数上限</button>

    <label>备注浅色主色 <input type="color" v-model="primary" /></label>
    <button @click="dark = !dark">切换备注深浅模式</button>
    <button @click="compact = !compact">切换备注尺寸圆角</button>
    <ConfigProvider :size="compact ? 'extra-small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary }, dark: { primary: '#88bbdd', surface: '#202830' } }">
      <ConfigProvider :radius="compact ? 0 : 9" :theme="{ dark: { success: '#80ab82' } }">
        <YmTextarea aria-label="继承主题的备注" />
        <YmTextarea aria-label="局部尺寸的备注" size="small" status="success" tips="格式正确" />
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
