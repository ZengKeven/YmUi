---
category: 基础组件
---

# YmImage 图片

展示网络图片或本地图片文件。需要查看大图时，设置 `preview` 即可点击图片打开预览。

## 交互示例

<ComponentDemo name="image" />

打开「点击预览」后，点击配送日历即可放大、缩小或旋转图片。键盘操作可用 Tab 聚焦预览按钮，按 Enter 或空格打开，按 Esc 返回。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| src | `string` 或 `File` | — | 图片地址，也可传入文件选择器返回的本地图片。 |
| alt | `string` | 空字符串 | 图片的替代文本。能传达信息的图片应描述其内容。 |
| preview | `boolean` | `false` | 图片加载成功后允许点击预览。预览显示当前已加载的图片，包括成功加载的备用图。 |
| width / height | `number` 或 `string` | 原图尺寸 | 设置展示区域的宽和高，数字按像素计算，字符串支持 CSS 长度。图片最大宽度为容器宽度。 |
| fit | `fill / contain / cover / none / scale-down` | `fill` | `contain` 保留完整画面，`cover` 等比裁剪以填满区域，`fill` 拉伸到指定尺寸。 |
| position | `string` | `center` | 图片在展示区域内的对齐位置，支持 `object-position` 的值，例如 `top` 或 `50% 25%`。 |
| shape | `round / square / circle` | `round` | `round` 跟随全局圆角，`square` 显示直角。使用相同宽高和 `circle` 可展示圆形头像。 |
| fallback | `string` | — | 原图加载失败后尝试的备用图片地址。备用图加载失败时显示错误提示。 |
| lazy | `boolean` | `false` | 启用浏览器原生懒加载，适合长页面中暂时位于视口外的图片。 |
| srcset | `Record<string, string>` | — | 按 MIME 类型指定候选图源，例如 `{ 'image/webp': '/images/receipt.webp' }`。浏览器按顺序选择支持的格式。 |
| referrerpolicy | `ReferrerPolicy` | `strict-origin-when-cross-origin` | 控制图片请求携带的来源信息。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 设置加载与错误提示、预览操作控件的尺寸。图片本身的展示尺寸由 `width` 和 `height` 控制。 |

组件继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。局部 `size` 优先。`mode` 和 `theme` 控制状态提示、预览面板与操作控件的配色。`radius` 控制默认图片外框及预览面板的圆角，设为 `0` 可显示直角。预览打开时继续使用图片所在位置的配置。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| load | `{ e: Event }` | 展示的图片加载成功时触发，包含原生加载事件。 |
| error | `{ e: Event }` | 图片请求失败时触发，包含原生错误事件。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| loading | 自定义图片加载中的内容，优先于内置加载提示。 |
| error | 自定义图片加载失败时的内容，优先于内置错误提示。 |

## 使用指南

签收凭证可以在列表中展示缩略图，点击后查看完整图片。

```vue
<script setup lang="ts" vapor>
import { YmImage } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmImage src="/images/receipt.jpg" alt="订单签收凭证"
    :width="160" :height="120" fit="cover" preview />
</template>
```
