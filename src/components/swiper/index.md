---
category: 导航组件
---

# YmSwiper 轮播框

将图片、公告或其他内容放入多个轮播项，按顺序自动播放，也可由用户手动翻页。

## 交互示例

<ComponentDemo name="swiper" />

可通过翻页按钮、指示器、方向键或触摸滑动切换。系统开启「减少动态效果」时，手动切换即时完成，自动播放暂停。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| current | `number` | — | 受控的当前项下标，从 0 开始。支持 `v-model:current`。 |
| defaultCurrent | `number` | `0` | 非受控模式下的初始下标。 |
| autoplay | `boolean` | `true` | 按设定间隔自动播放。 |
| interval | `number` | `5000` | 自动切换的间隔，单位为毫秒。 |
| loop | `boolean` | `true` | 到达末项后可回到首项，首项也可向前切到末项。关闭后在边界停止。 |
| stopOnHover | `boolean` | `true` | 鼠标停留在轮播框内时暂停自动播放。 |
| direction | `horizontal / vertical` | `horizontal` | 水平或垂直切换。 |
| animation | `slide / fade` | `slide` | 普通模式下的滑动或淡入淡出动效。 |
| duration | `number` | `300` | 切换动效的时长，单位为毫秒。 |
| type | `default / card` | `default` | 卡片模式可同时看到当前项和相邻项。 |
| cardScale | `number` | `210 / 332` | 卡片模式下相邻项相对当前项的缩放比例。 |
| height | `number / string` | 随内容 | 轮播视口的高度。数字按像素计算，字符串支持 CSS 长度。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置导航按钮和指示器的尺寸。 |
| trigger | `hover / click` | `hover` | 鼠标悬浮或点击指示器切换当前项。 |
| navigation | `SwiperNavigation / false` | 内侧条形导航 | 配置内置导航，传 `false` 可以隐藏。各配置项见下表。 |

`SwiperNavigation` 支持以下配置。

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `dots / dots-bar / bars / fraction` | `bars` | 圆点、选中项加长的圆点、短条或页数分式。分式从 1 开始显示。 |
| placement | `inside / outside` | `inside` | 将导航放在视口内或视口外。 |
| showSlideBtn | `always / hover / never` | `always` | 控制上一项、下一项按钮的显示时机。 |
| size | `extra-small / small / medium / large` | 继承组件尺寸 | 单独指定导航尺寸。 |

轮播框继承最近的 `ConfigProvider`，嵌套时逐项覆盖。导航优先使用 `navigation.size`，其次使用组件的 `size` 和全局尺寸。`mode` 和 `theme` 决定视口、翻页按钮及指示器的配色，`radius` 控制视口和翻页按钮的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:current | `index: number` | 自动播放或手动切换请求新的下标时触发，可同步受控值。 |
| change | `index: number, context: { source: SwiperChangeSource }` | 请求切换时触发。`source` 指明来源，支持 `autoplay`、`click`、`hover`、`keyboard` 和 `touch`。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| YmSwiper.default | 依照展示顺序放置 `YmSwiperItem`。可用 `v-for` 根据数据生成轮播项。 |
| YmSwiper.navigation | 自定义导航。接收 `{ current, total, goTo, prev, next }`，分别为当前下标、总项数、跳到指定下标、上一项和下一项。 |
| YmSwiperItem.default | 当前轮播项的内容，可以放入图片、文字或组件。 |

## 使用指南

每一页内容放入一个 `YmSwiperItem`。下面的示例以固定视口高度展示配送公告，外部可通过 `current` 读取或切换当前页。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmSwiper, YmSwiperItem } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const current = ref(0)
</script>

<template>
  <YmSwiper v-model:current="current" :height="180" aria-label="配送公告">
    <YmSwiperItem>上午送货时间为 9:00 至 11:00。</YmSwiperItem>
    <YmSwiperItem>冷藏货品请在到货后优先验收。</YmSwiperItem>
    <YmSwiperItem>签收回单请交给配送员。</YmSwiperItem>
  </YmSwiper>
</template>
```
