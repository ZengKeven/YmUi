---
category: 基础组件
---

# YmStatistic 统计数值

展示成交额、库存量等指标，可用动画呈现数值的增长或回落。

## 交互示例

<ComponentDemo name="statistic" />

切换「目标金额」可观察数值从当前位置变到新目标。点击「重播动画」可从零开始重新播放。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `number` | `0` | 要展示的目标数值，支持负数和小数。 |
| title | `string` | — | 数值上方的标题。 |
| unit | `string` | — | 紧跟数值的单位，例如「元」或「件」。 |
| prefix | `string` | — | 数值前的内容，例如货币符号。 |
| suffix | `string` | — | 数值和单位后的内容。 |
| extra | `string` | — | 数值下方的补充说明。 |
| decimalPlaces | `number` | 自动 | 固定显示 0 至 20 位小数，按指定位数四舍五入并补零。省略时保留数值自身的小数，动画按起点和目标中较高的精度过渡。 |
| separator | `string` | `,` | 千位分隔符。传入空字符串可关闭分组。 |
| format | `(value: number) => string \| number` | — | 自定义数值显示，优先于内置的小数位数和千位分组格式。动画播放时接收当前帧的数值。 |
| animation | `{ valueFrom?: number, duration?: number }` | — | 配置计数动画。`valueFrom` 为起点，默认 `0`。`duration` 以毫秒计，默认 `200`。 |
| animationStart | `boolean` | `false` | 已配置 `animation` 时，组件起初显示 `valueFrom`，可通过实例的 `start()` 手动播放。开启此项后自动播放，目标值变化时从当前数值继续过渡。 |
| trend | `increase / decrease` | — | 显示上升或下降的趋势图标。 |
| trendPlacement | `left / right` | `left` | 趋势图标在数值左边或右边，同侧的前缀或后缀优先。 |
| color | `string` | 全局文字色 | 设置数值及前后缀的颜色。支持随主题切换的 `black / blue / red / orange / green`，也可传入 CSS 颜色。 |
| loading | `boolean` | `false` | 用加载占位替换数值区域，保留标题和补充说明。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制字号、间距和加载占位的大小。 |

组件继承最近的 `ConfigProvider`，嵌套时逐项覆盖。局部 `size` 优先于全局尺寸。`mode` 和 `theme` 控制文字、预设颜色与加载占位的配色，具体 CSS 色值可用 `color` 指定。`radius` 控制加载占位的圆角。

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| title | 自定义标题，优先于 `title` 属性。 |
| prefix | 自定义数值前缀，优先于 `prefix` 属性及左侧趋势图标。 |
| unit | 自定义数值单位，优先于 `unit` 属性。 |
| suffix | 自定义后缀，优先于 `suffix` 属性及右侧趋势图标。 |
| extra | 自定义补充说明，优先于 `extra` 属性。 |

## 使用指南

只传 `value` 即可展示静态数值。下例用 1.2 秒从零过渡到成交额。开启系统的「减少动态效果」偏好时，组件直接显示目标值。

```vue
<script setup lang="ts" vapor>
import { YmStatistic } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmStatistic title="本月成交额" unit="元" :value="12480.75" :decimal-places="2"
    :animation="{ valueFrom: 0, duration: 1200 }" animation-start />
</template>
```
