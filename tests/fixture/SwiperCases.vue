<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmSwiper, YmSwiperItem, type ControlSize, type SwiperProps } from 'ym-ui-vapor'

const items = ref(['订单', '收货', '结算'])
const loop = ref(true)
const trigger = ref<SwiperProps['trigger']>('click')
const direction = ref<SwiperProps['direction']>('horizontal')
const effect = ref<SwiperProps['animation']>('slide')
const duration = ref(0)
const presentation = ref<SwiperProps['type']>('default')
const index = ref(0)
const updates = ref<number[]>([])
const changes = ref<string[]>([])
const accept = ref(false)
const controlled = ref(0)
const requests = ref<number[]>([])
const automatic = ref(false)
const autoplayChanges = ref<string[]>([])
const size = ref<ControlSize>('medium')
const primary = ref('#124789')
const square = ref(false)
const dark = ref(false)

function request(next: number) {
  requests.value.push(next)
  if (accept.value) controlled.value = next
}
</script>

<template>
  <main style="max-width: 600px">
    <label><input v-model="loop" type="checkbox" /> 循环</label>
    <label>触发 <select v-model="trigger"><option>click</option><option>hover</option></select></label>
    <label>方向 <select v-model="direction"><option>horizontal</option><option>vertical</option></select></label>
    <label>动画 <select v-model="effect"><option>slide</option><option>fade</option></select></label>
    <label>动画时长 <input v-model.number="duration" type="number" /></label>
    <label>模式 <select v-model="presentation"><option>default</option><option>card</option></select></label>
    <button @click="items = [...items].reverse()">反转顺序</button>
    <button @click="items = items.slice(0, 1)">只留一项</button>
    <button @click="items = []">清空轮播</button>
    <button @click="items = ['入库', '出库']">补充两项</button>
    <label>全局尺寸 <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select></label>
    <label>浅色主色 <input v-model="primary" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="10"
      :theme="{ light: { primary }, dark: { primary: '#abcced' } }">
      <ConfigProvider :radius="square ? 0 : 5">
        <YmSwiper id="basic" v-model:current="index" :autoplay="false" :duration="duration" :height="120"
          :trigger="trigger" :loop="loop" :direction="direction" :animation="effect" :type="presentation"
          @update:current="updates.push($event)" @change="(next, context) => changes.push(next + ':' + context.source)">
          <YmSwiperItem v-for="item in items" :key="item">
            <strong>{{ item }}</strong>
            <input v-if="item === '订单'" aria-label="订单备注" />
          </YmSwiperItem>
        </YmSwiper>
        <YmSwiper id="local" size="small" :autoplay="false" :duration="0">
          <YmSwiperItem>一</YmSwiperItem><YmSwiperItem>二</YmSwiperItem>
        </YmSwiper>
      </ConfigProvider>
    </ConfigProvider>
    <output id="updates">{{ JSON.stringify(updates) }}</output>
    <output id="changes">{{ JSON.stringify(changes) }}</output>
    <label><input v-model="accept" type="checkbox" /> 接受切换请求</label>
    <button @click="controlled = 2">外部定位末项</button>
    <YmSwiper id="controlled" :current="controlled" :autoplay="false" :duration="0" @update:current="request">
      <YmSwiperItem>草稿</YmSwiperItem><YmSwiperItem>提交</YmSwiperItem><YmSwiperItem>归档</YmSwiperItem>
    </YmSwiper>
    <output id="requests">{{ JSON.stringify(requests) }}</output>
    <YmSwiper id="custom" :default-current="1" :autoplay="false" :duration="0">
      <YmSwiperItem>一</YmSwiperItem><YmSwiperItem>二</YmSwiperItem><YmSwiperItem>三</YmSwiperItem>
      <template #navigation="{ current, total, prev, goTo }">
        <output>当前位置 {{ current + 1 }} / {{ total }}</output>
        <button @click="prev()">自定义上一项</button>
        <button @click="goTo(2)">定位第三项</button>
      </template>
    </YmSwiper>
    <label><input v-model="automatic" type="checkbox" /> 自动播放</label>
    <YmSwiper id="timed" :autoplay="automatic" :duration="0" :interval="1000" :loop="false"
      @change="(next, context) => autoplayChanges.push(next + ':' + context.source)">
      <YmSwiperItem>一</YmSwiperItem><YmSwiperItem>二</YmSwiperItem><YmSwiperItem>三</YmSwiperItem>
    </YmSwiper>
    <output id="automatic-changes">{{ JSON.stringify(autoplayChanges) }}</output>
  </main>
</template>
