---
category: 基础组件
---

# YmQRCode 二维码

将文本或链接生成可扫描的二维码，可在码面中央放置标志，并显示加载、过期或已扫描状态。

## 交互示例

<ComponentDemo name="qrcode" />

修改「扫码内容」后可用手机扫描预览。将状态切换为「已过期」，点击刷新按钮即可回到可扫描状态。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string` | 空字符串 | 扫描后读取的原文，支持中文和链接。为空时显示「暂无二维码」，超出容量时显示「内容超出二维码容量」。 |
| type | `canvas / svg` | `canvas` | 使用 Canvas 绘制或输出 SVG 矢量图。 |
| size | `extra-small / small / medium / large` 或 `number` | 继承全局尺寸，初始为 `medium` | 四档边长依次为 100、120、160 和 200px，也可直接指定像素数值。 |
| level | `L / M / Q / H` | `M` | 纠错能力从低到高。同样大小的码面，纠错等级越高，可容纳的内容越少。 |
| color | `string` | 当前主题文字色 | 二维码图案的前景色。请选择与背景对比明显的颜色。 |
| bgColor | `string` | 当前主题表面色 | 设置码面背景色及四周的留白颜色。 |
| borderless | `boolean` | `false` | 隐藏外边框，保留扫码所需的留白。 |
| icon | `string` | — | 中心标志的图片地址。跨域图片需允许匿名跨域访问，加载失败时显示完整二维码。 |
| iconSize | `number` 或 `{ width: number, height: number }` | `40` | 标志的像素尺寸。传数字设置正方形，传对象分别设置宽高。 |
| status | `active / loading / expired / scanned` | `active` | 分别表示可扫描、加载中、已过期和已扫描。业务侧负责更新状态。 |

二维码继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。`size` 控制边长，局部尺寸优先。`mode` 和 `theme` 控制码面、外框、状态提示与刷新按钮的配色，局部 `color` 和 `bgColor` 可覆盖码面的前景色和背景色。`radius` 控制外框和状态遮罩的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| refresh | 无 | 过期状态下点击内置刷新按钮时触发。在监听器中更新 `value` 并将 `status` 设为 `active`。绑定监听器后才显示内置刷新按钮。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| status-render | 在加载、过期或已扫描时替换内置状态提示。接收 `{ status, onRefresh }`，可通过 `status` 判断当前状态，并在自定义按钮中调用 `onRefresh` 请求刷新。 |

## 使用指南

传入 `value` 即可生成二维码。添加中心标志时，建议选用较小的图片和较高的纠错等级，并用实际展示尺寸试扫。

```vue
<script setup lang="ts" vapor>
import { YmQRCode } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmQRCode value="配送单 PS-1028" />
</template>
```
