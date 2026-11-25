<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmButton, YmDropdown, YmForm, type ControlSize, type DropdownOption } from 'ym-ui-vapor'

const operations: DropdownOption[] = [
  { content: '刷新当前页', value: 0, prefixIcon: 'refresh' },
  { content: '关闭其他页签', value: 'others', disabled: true },
  { content: '关闭右侧页签', value: 'right', divider: true },
  { content: '关闭全部页签', value: 'all', theme: 'error' },
]
const account = [{ content: '修改密码', value: 'password' }, { content: '退出登录', value: 'logout' }]
const events = ref<string[]>([])
const updates = ref<boolean[]>([])
const changes = ref<boolean[]>([])
const controlled = ref(false)
const accept = ref(false)
const disabled = ref(false)
const keepOpen = ref(false)
const initial = ref(false)
const configured = ref(false)
const dark = ref(false)
const square = ref(false)
const size = ref<ControlSize>('medium')
const local = ref(false)
const surface = ref('#e8f0f7')

function record(option: DropdownOption, context: { e: MouseEvent }) {
  events.value.push([option.value, context.e.type, context.e instanceof MouseEvent].join('/'))
}
function request(value: boolean) {
  updates.value.push(value)
  if (accept.value) controlled.value = value
}
</script>

<template>
  <main style="margin: 100px 72px; display: grid; gap: 40px; justify-items: start">
    <section>
      <YmDropdown :options="operations" @click="record" />
      <button>外部按钮</button>
    </section>
    <section>
      <button>账号前一个按钮</button>
      <YmDropdown trigger="click" :options="operations" :disabled="disabled" attach="#commands"
        :hide-after-item-click="!keepOpen" @click="record">
        <YmButton>页签操作</YmButton>
        <template #option="{ option, index }"><strong>{{ index + 1 }}. {{ option.content }}</strong></template>
      </YmDropdown>
      <button>账号后一个按钮</button>
      <label><input type="checkbox" v-model="disabled" /> 禁用操作</label>
      <label><input type="checkbox" v-model="keepOpen" /> 选择后保留菜单</label>
    </section>
    <section>
      <YmDropdown trigger="context-menu" :options="account" :visible="controlled"
        @update:visible="request" @visible-change="changes.push($event)" @click="record">
        <YmButton tag="div">账户操作</YmButton>
      </YmDropdown>
      <label><input type="checkbox" v-model="accept" /> 接受打开请求</label>
      <button @click="controlled = !controlled">外部切换</button>
      <output id="updates">{{ updates.join(',') }}</output>
      <output id="changes">{{ changes.join(',') }}</output>
    </section>
    <section>
      <label><input type="checkbox" v-model="initial" /> 初始打开用例</label>
      <YmDropdown v-if="initial" trigger="focus" default-visible :options="account">
        <button>聚焦账户</button>
      </YmDropdown>
    </section>
    <YmForm disabled>
      <YmDropdown trigger="click" :options="account" @click="record">
        <YmButton>继承表单禁用</YmButton>
      </YmDropdown>
      <YmDropdown trigger="click" :disabled="false" :options="account" @click="record">
        <YmButton>允许账户操作</YmButton>
      </YmDropdown>
    </YmForm>
    <section>
      <label><input type="checkbox" v-model="configured" /> 展示主题用例</label>
      <label>全局尺寸 <select v-model="size"><option v-for="s in ['extra-small','small','medium','large']" :key="s">{{ s }}</option></select></label>
      <label>浅色表面 <input type="color" v-model="surface" /></label>
      <label><input type="checkbox" v-model="dark" /> 深色模式</label>
      <label><input type="checkbox" v-model="square" /> 内层直角</label>
      <label><input type="checkbox" v-model="local" /> 局部小号</label>
    </section>
    <ConfigProvider mode="dark" size="extra-small" :radius="18" :theme="{ dark: { surface: '#673244' } }">
      <div id="commands"></div>
    </ConfigProvider>
    <ConfigProvider v-if="configured" :size="size" :mode="dark ? 'dark' : 'light'" :radius="16"
      :theme="{ light: { surface, text: '#334455' }, dark: { surface: '#243448', text: '#e4f1f2' } }">
      <ConfigProvider :radius="square ? 0 : 7">
        <YmDropdown trigger="click" visible :options="account" attach="#commands" :size="local ? 'small' : undefined">
          <button>来源区域</button>
        </YmDropdown>
      </ConfigProvider>
    </ConfigProvider>
    <output id="events">{{ events.join(',') }}</output>
  </main>
</template>
