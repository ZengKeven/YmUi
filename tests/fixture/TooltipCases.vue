<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmButton, YmTooltip, type ControlSize, type TooltipProps } from 'ym-ui-vapor'

const content = ref('审批后可以查看物流信息')
const disabled = ref(false)
const slot = ref(false)
const accept = ref(false)
const controlled = ref(false)
const showInitial = ref(false)
const updates = ref<boolean[]>([])
const changes = ref<boolean[]>([])
const geometry = ref(false)
const geometryPlacement = ref<TooltipProps['placement']>('top')
const arrow = ref(true)
const configured = ref(false)
const size = ref<ControlSize>('medium')
const theme = ref<TooltipProps['theme']>('primary')
const primary = ref('#334455')
const dark = ref(false)
const square = ref(false)

function request(value: boolean) {
  updates.value.push(value)
  if (accept.value) controlled.value = value
}
</script>

<template>
  <main style="margin: 84px 100px">
    <p id="existing-note">物流详情</p>
    <button>前一个按钮</button>
    <YmTooltip :content="content" :disabled="disabled">
      <YmButton aria-describedby="existing-note">查看订单</YmButton>
      <template v-if="slot" #content><strong>由仓库填写</strong></template>
    </YmTooltip>
    <button>后一个按钮</button>
    <label>说明文字 <input v-model="content" /></label>
    <label><input type="checkbox" v-model="disabled" /> 禁用提示</label>
    <label><input type="checkbox" v-model="slot" /> 自定义内容</label>

    <p>
      <YmTooltip trigger="click" :visible="controlled" content="审批说明"
        @update:visible="request" @visible-change="changes.push($event)">
        <button>请求审批说明</button>
      </YmTooltip>
      <label><input type="checkbox" v-model="accept" /> 接受请求</label>
      <button @click="controlled = !controlled">外部切换</button>
      <output id="updates">{{ updates.join(',') }}</output>
      <output id="changes">{{ changes.join(',') }}</output>
    </p>
    <label><input type="checkbox" v-model="showInitial" /> 显示初始提示用例</label>
    <YmTooltip v-if="showInitial" default-visible trigger="manual" content="首次挂载提示">
      <button>初始提示</button>
    </YmTooltip>

    <div>
      <label><input type="checkbox" v-model="geometry" /> 展开定位用例</label>
      <label>方向 <select v-model="geometryPlacement"><option v-for="p in ['top', 'bottom', 'left', 'right']" :key="p">{{ p }}</option></select></label>
      <label><input type="checkbox" v-model="arrow" /> 定位箭头</label>
    </div>
    <div v-if="geometry" style="position: fixed; top: 48%; left: 46%">
      <YmTooltip trigger="manual" visible :placement="geometryPlacement" :show-arrow="arrow"
        content="物流跟踪信息可在发货后查看" overlay-class-name="geometry-panel">
        <button style="height: 60px">单号</button>
      </YmTooltip>
    </div>

    <p>
      <label><input type="checkbox" v-model="configured" /> 展开配色用例</label>
      <label>配色 <select v-model="theme"><option v-for="t in ['default', 'light', 'primary', 'success', 'warning', 'danger']" :key="t">{{ t }}</option></select></label>
      <label>全局尺寸 <select v-model="size"><option v-for="s in ['extra-small', 'small', 'medium', 'large']" :key="s">{{ s }}</option></select></label>
      <label>浅色主色 <input type="color" v-model="primary" /></label>
      <label><input type="checkbox" v-model="dark" /> 深色模式</label>
      <label><input type="checkbox" v-model="square" /> 直角</label>
    </p>
    <ConfigProvider mode="dark" size="extra-small" :radius="19" :theme="{ dark: { primary: '#bb2299' } }">
      <div id="external"></div>
    </ConfigProvider>
    <ConfigProvider v-if="configured" :size="size" :radius="12" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary, success: '#207030', warning: '#bf6803', danger: '#9a3434', onAccent: '#f8f1eb' }, dark: { primary: '#aabbcc', onAccent: '#172839' } }">
      <ConfigProvider :radius="square ? 0 : 6">
        <YmTooltip trigger="manual" visible :theme="theme" attach="#external" placement="bottom" content="库存数量"
          overlay-class-name="inherited-panel"><button>库存提示</button></YmTooltip>
        <div style="margin-top: 80px">
          <YmTooltip trigger="manual" visible size="small" content="本地尺寸" placement="bottom"
            overlay-class-name="local-panel"><button>小尺寸提示</button></YmTooltip>
        </div>
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
