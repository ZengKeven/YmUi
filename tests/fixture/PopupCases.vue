<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmPopup } from 'ym-ui-vapor'

const visible = ref(false)
const disabled = ref(false)
const updates = ref<boolean[]>([])
const changes = ref<boolean[]>([])
const showManual = ref(false)
const showGeometry = ref(false)
const dark = ref(false)
const compact = ref(false)
const surface = ref('#f0f2f4')
</script>

<template>
  <section id="popup-cases">
    <YmPopup overlay-class-name="popup-click-panel" content="后备浮层内容" :disabled="disabled"
      @update:visible="updates.push($event)" @visible-change="changes.push($event)">
      <template #default="{ visible: open, panelId }">
        <button :aria-expanded="open" :aria-controls="panelId">查看单据说明</button>
      </template>
      <template #content="{ close }">
        <button @click="close()">收起说明</button>
      </template>
    </YmPopup>
    <output id="popup-updates">{{ updates.join(',') }}</output>
    <output id="popup-changes">{{ changes.join(',') }}</output>
    <label><input v-model="disabled" type="checkbox" /> 禁用单据说明</label>
    <button>浮层外按钮</button>
    <YmPopup trigger="hover" overlay-class-name="popup-hover-panel">
      <button>悬停查看备注</button>
      <template #content><button>查看备注详情</button></template>
    </YmPopup>
    <YmPopup :visible="visible" content="受控说明" overlay-class-name="popup-controlled-panel"
      @update:visible="updates.push($event)">
      <button>请求显示受控说明</button>
    </YmPopup>
    <button @click="visible = !visible">切换受控浮层</button>
    <button @click="showManual = true">挂载手动浮层</button>
    <YmPopup v-if="showManual" trigger="manual" default-visible content="初始展开的说明" overlay-class-name="popup-manual-panel">
      <button>手动浮层锚点</button>
    </YmPopup>

    <button @click="showGeometry = true">打开定位用例</button>
    <div v-if="showGeometry" id="popup-scroll-container"
      style="position: fixed; left: 64px; bottom: 4px; width: 280px; height: 48px; overflow: auto">
      <div style="box-sizing: border-box; width: 600px; padding-left: 96px">
        <YmPopup overlay-class-name="popup-position-panel">
          <button>视口边缘触发器</button>
          <template #content>
            <div style="width: 160px; height: 90px">浮层定位内容</div>
          </template>
        </YmPopup>
      </div>
    </div>

    <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { surface, text: '#493152' }, dark: { surface: '#202530', text: '#e1e2e9' } }">
      <ConfigProvider :radius="compact ? 0 : 11">
        <YmPopup overlay-class-name="popup-global-panel">
          <button>显示全局配置浮层</button>
          <template #content>
            <label><input v-model="dark" type="checkbox" /> 浮层深色模式</label>
            <label><input v-model="compact" type="checkbox" /> 浮层紧凑配置</label>
            <label>浮层浅色背景 <input v-model="surface" type="color" /></label>
          </template>
        </YmPopup>
        <YmPopup size="extra-small" content="局部尺寸内容" overlay-class-name="popup-local-panel">
          <button>显示局部尺寸浮层</button>
        </YmPopup>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
