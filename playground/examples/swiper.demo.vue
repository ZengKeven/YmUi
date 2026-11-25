<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmIcon, YmSwiper, YmSwiperItem, YmSwitch, type SwiperNavigation, type SwiperProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const current = ref(0)
const autoplay = ref(true)
const loop = ref(true)
const direction = ref<SwiperProps['direction']>('horizontal')
const animation = ref<SwiperProps['animation']>('slide')
const type = ref<SwiperProps['type']>('default')
const size = ref<SwiperProps['size']>()
const indicator = ref<SwiperNavigation['type']>('bars')
const placement = ref<SwiperNavigation['placement']>('inside')
const navigation = computed(() => ({ type: indicator.value, placement: placement.value }))
</script>

<template>
  <PreviewFrame name="YmSwiper">
    <template #preview>
      <YmSwiper v-model:current="current" aria-label="门店配送流程" :height="200" :autoplay="autoplay" :loop="loop"
        :direction="direction" :animation="animation" :type="type" :size="size" :navigation="navigation">
        <YmSwiperItem>
          <div class="swiper-demo-slide"><YmIcon name="warehouse" size="2rem" /><strong>入库验收</strong></div>
        </YmSwiperItem>
        <YmSwiperItem>
          <div class="swiper-demo-slide shipping"><YmIcon name="distribution" size="2rem" /><strong>仓间配送</strong></div>
        </YmSwiperItem>
        <YmSwiperItem>
          <div class="swiper-demo-slide receiving"><YmIcon name="store" size="2rem" /><strong>门店签收</strong></div>
        </YmSwiperItem>
      </YmSwiper>
    </template>
    <template #controls>
      <label>当前项
        <select v-model="current">
          <option :value="0">入库验收</option><option :value="1">仓间配送</option><option :value="2">门店签收</option>
        </select>
      </label>
      <label>轮播模式
        <select v-model="type"><option value="default">普通</option><option value="card">卡片</option></select>
      </label>
      <label>切换方向
        <select v-model="direction"><option value="horizontal">水平</option><option value="vertical">垂直</option></select>
      </label>
      <label>切换动效
        <select v-model="animation" :disabled="type === 'card'"><option value="slide">滑动</option><option value="fade">淡入淡出</option></select>
      </label>
      <label>导航样式
        <select v-model="indicator">
          <option value="bars">短条</option><option value="dots">圆点</option><option value="dots-bar">点条</option><option value="fraction">分式</option>
        </select>
      </label>
      <label>导航位置
        <select v-model="placement"><option value="inside">内侧</option><option value="outside">外侧</option></select>
      </label>
      <label>导航尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[key, name] in sizes" :key="key" :value="key">{{ name }}</option>
        </select>
      </label>
      <label>自动播放 <YmSwitch v-model="autoplay" /></label>
      <label>循环播放 <YmSwitch v-model="loop" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.swiper-demo-slide {
  --slide-color: var(--ym-color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  height: 100%;
  background: color-mix(in srgb, var(--slide-color) 12%, var(--ym-color-surface));
  color: var(--ym-color-text);
}
.swiper-demo-slide .ym-icon { color: var(--slide-color); }
.swiper-demo-slide.shipping { --slide-color: var(--ym-color-warning); }
.swiper-demo-slide.receiving { --slide-color: var(--ym-color-success); }
</style>
