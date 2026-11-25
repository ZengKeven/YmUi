---
category: 基础组件
---

# YmBadge 徽标

在图标、按钮或文字的右上角显示未读数量、简短状态或提示圆点。省略主体内容时，徽标也可以独立显示在行内。

## 交互示例

<ComponentDemo name="badge" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| count | `number / string` | `0` | 徽标中的数字或短文本。数字字符串按数值处理，其他文字原样显示。 |
| maxCount | `number` | `99` | 数值超过上限时显示上限加 `+`，例如 `99+`。 |
| showZero | `boolean` | `false` | 当计数为零时显示徽标，圆点模式也遵循此设置。 |
| dot | `boolean` | `false` | 以圆点表示状态，省略徽标中的文字。 |
| content | `string` | — | 用作徽标主体的文字，例如「收件箱」。 |
| shape | `circle / round` | `circle` | `circle` 为两端圆弧的胶囊，`round` 为圆角矩形。 |
| color | `string` | 当前调色板的 `danger` 色 | 设置徽标背景色，接受 CSS 颜色或颜色变量。 |
| offset | `[number \| string, number \| string]` | `[0, 0]` | 相对主体右上角的偏移量。第一项为正时向左移动，第二项为正时向下移动。数字按像素计算，也可传入 CSS 长度。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制徽标的大小和字号。 |

徽标继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。组件显式传入的 `size` 优先。全局 `mode` 切换浅色、深色或跟随系统的配色，`theme` 提供默认背景色 `danger` 和文字颜色 `onAccent`。全局 `radius` 控制 `round` 形状的四个角，设为 `0` 时显示直角。

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 放置徽标所标记的主体，例如图标或按钮。优先于 `#content` 和 `content` 属性。 |
| content | 自定义主体内容，优先于 `content` 属性。 |
| count | 自定义徽标内容，优先于 `count` 和 `maxCount`。开启 `dot` 后显示圆点。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { YmBadge } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmBadge :count="12" content="收件箱" />
  <YmBadge dot :count="1" content="有新通知" />
  <YmBadge count="NEW" shape="round" />
</template>
```
