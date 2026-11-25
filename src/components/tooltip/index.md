---
category: 反馈组件
---

# YmTooltip 文字提示

在按钮、链接等元素旁显示简短说明。默认将指针移到触发元素上，或通过键盘聚焦它，即可阅读提示。

## 交互示例

<ComponentDemo name="tooltip" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `string` | — | 提示文字。`#content` 插槽优先。两者均未提供或文字为空时隐藏提示。 |
| placement | `PopupPlacement` | `top` | `top / bottom / left / right` 对准触发元素的中心。也可沿边缘对齐，如 `top-left`、`right-bottom`。靠近视口边缘时会调整位置。 |
| trigger | `hover / focus / click / mousedown / context-menu / manual` | `hover` | `hover` 同时支持键盘聚焦。其余方式分别通过聚焦、点击、按下鼠标、右键或业务代码控制。 |
| theme | `default / light / primary / success / warning / danger` | `default` | 选择面板配色。`light` 使用表面色，语义色从当前调色板读取。 |
| showArrow | `boolean` | `true` | 显示指向触发元素的箭头。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置提示文字的字号和面板内边距。 |
| visible | `boolean` | — | 受控显示状态，支持 `v-model:visible`。 |
| defaultVisible | `boolean` | `false` | 未传入 `visible` 时的初始显示状态。 |
| disabled | `boolean` | `false` | 关闭文字提示。 |
| attach | `string / HTMLElement / function` | 触发元素所在位置 | 指定面板挂载位置，支持 CSS 选择器、DOM 节点或接收触发容器并返回位置的函数。 |
| overlayClassName | `ClassValue` | — | 添加到提示面板的样式类。 |
| overlayStyle | `StyleValue / function` | — | 设置面板样式，也可以传入接收触发容器和面板节点的函数。 |
| zIndex | `number` | — | 面板的 CSS 层级。多个原生顶层浮层按打开顺序叠放。 |

面板继承触发元素所在位置最近的 `ConfigProvider`，即使通过 `attach` 挂载到其他容器也使用该配置。嵌套 Provider 逐项覆盖。组件显式设置的 `size` 优先于全局尺寸。`mode` 决定使用浅色、深色或系统配色，组件的 `theme` 从全局调色板选取面板、文字和箭头的颜色。`radius` 控制面板圆角，设为 `0` 时显示直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:visible | `visible: boolean` | 用户操作请求打开或关闭提示时触发，用于同步 `v-model:visible`。 |
| visible-change | `visible: boolean` | 用户请求切换提示的显示状态时触发。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 放置触发元素，如按钮或链接。组件通过 `aria-describedby` 将触发元素与提示内容关联。 |
| content | 自定义提示内容，优先于 `content` 属性，可用于强调文字或换行。 |

## 使用指南

将可聚焦的元素放入默认插槽，键盘用户可以按 Tab 阅读提示，按 Esc 收起。

```vue
<script setup lang="ts" vapor>
import { YmTooltip } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmTooltip content="自发货日起 2 个工作日内送达。">
    <button type="button">配送时效</button>
  </YmTooltip>
</template>
```
