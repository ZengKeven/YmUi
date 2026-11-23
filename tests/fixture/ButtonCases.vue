<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmButton, YmLoading } from 'ym-ui-vapor'
import CheckboxCases from './CheckboxCases.vue'
import IconCases from './IconCases.vue'
import InputCases from './InputCases.vue'
import InputNumberCases from './InputNumberCases.vue'
import LayoutCases from './LayoutCases.vue'
import MenuCases from './MenuCases.vue'
import PaginationCases from './PaginationCases.vue'
import PopupCases from './PopupCases.vue'
import RadioCases from './RadioCases.vue'
import SelectCases from './SelectCases.vue'
import SpaceCases from './SpaceCases.vue'
import StepsCases from './StepsCases.vue'
import TabsCases from './TabsCases.vue'
import TagCases from './TagCases.vue'

const busy = ref(false)
const disabled = ref(false)
const customTag = ref(false)
const showDefault = ref(true)
const panelBusy = ref(false)
const compactLoading = ref(false)
const label = ref('保存')
const fullscreen = ref(false)
const mode = ref<'light' | 'dark'>('dark')
const palette = {
  dark: { primary: '#88bbee', text: '#ddeeff', onAccent: '#112233' },
  light: { primary: '#225588' },
}
const clicks = ref(0)
const submits = ref(0)
const bubbles = ref(0)

function record(event: MouseEvent) {
  if (event instanceof MouseEvent) clicks.value++
}
</script>

<template>
  <label><input v-model="busy" type="checkbox" /> busy</label>
  <label><input v-model="disabled" type="checkbox" /> disabled</label>
  <label><input v-model="customTag" type="checkbox" /> custom tag</label>
  <label><input v-model="showDefault" type="checkbox" /> default slot</label>
  <label>button content <input v-model="label" /></label>
  <label><input v-model="fullscreen" type="checkbox" /> fullscreen</label>
  <button id="switch-mode" @click="mode = mode === 'dark' ? 'light' : 'dark'">mode</button>
  <form id="external" @submit.prevent="submits++"><input aria-label="name" value="initial" /></form>
  <div @click="bubbles++">
    <YmButton id="submit" class="from-parent" data-source="fixture" type="submit" form="external"
      :loading="busy" :disabled="disabled" :onClick="record">Submit</YmButton>
    <YmButton id="reset" type="reset" form="external">Reset</YmButton>
    <YmButton id="link" href="#destination" :tag="customTag ? 'div' : undefined"
      :loading="busy" :disabled="disabled" @click="record">Link</YmButton>
  </div>
  <output id="events">{{ clicks }}/{{ submits }}/{{ bubbles }}</output>
  <YmButton id="prop-label" content="保存">
  </YmButton>
  <YmButton id="slot-label">保存</YmButton>
  <YmButton id="slots" :content="label" :loading="busy"
    :loading-props="{ text: 'waiting', size: '19px' }">
    <template #icon>icon</template>
    <template #default><b v-if="showDefault">default slot</b></template>
    <template #suffix>suffix</template>
  </YmButton>
  <ConfigProvider id="button-palette" :mode="mode" :theme="palette">
    <ConfigProvider :theme="{ dark: { success: '#75ce9d' } }">
      <YmButton id="inherited-brand" :loading="busy">Inherited brand</YmButton>
      <YmButton id="local-success" theme="success">Local success</YmButton>
      <ConfigProvider mode="light"><YmButton id="local-light">Light island</YmButton></ConfigProvider>
    </ConfigProvider>
    <label><input v-model="compactLoading" type="checkbox" /> compact loading settings</label>
    <ConfigProvider :size="compactLoading ? 'small' : 'large'" :radius="compactLoading ? 0 : 12">
      <YmLoading :loading="busy" attach="#target" :fullscreen="fullscreen" :inherit-color="false"
        :delay="60" :z-index="41" text="attached" />
      <YmLoading id="inline-loading" />
      <YmLoading id="fixed-loading" size="19px" />
      <YmLoading id="panel-loading" :loading="panelBusy" :delay="300" text="Updating">
        <input aria-label="panel content" />
      </YmLoading>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider size="extra-small" :radius="21" mode="light"><div id="target"></div></ConfigProvider>
  <label><input v-model="panelBusy" type="checkbox" /> panel loading</label>
  <CheckboxCases />
  <IconCases />
  <InputCases />
  <InputNumberCases />
  <LayoutCases />
  <SpaceCases />
  <MenuCases />
  <PaginationCases />
  <PopupCases />
  <RadioCases />
  <SelectCases />
  <StepsCases />
  <TabsCases />
  <TagCases />
</template>
