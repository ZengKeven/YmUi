---
category: 反馈组件
---

# YmPopup 浮层

在按钮等触发元素旁展示说明或操作面板，页面滚动时面板会跟随触发元素。

## 交互示例

<ComponentDemo name="popup" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| trigger | `click / hover / focus / mousedown / context-menu / manual` | `click` | 通过点击、悬停、聚焦、按下鼠标或右键打开。手动模式由业务控制可见状态。 |
| attach | `string / HTMLElement / function` | 触发器所在位置 | 指定面板挂载节点。可传 CSS 选择器、DOM 节点或接收触发器并返回挂载位置的函数。 |
| placement | `PopupPlacement` | `bottom` | 支持 `top / bottom / left / right`。可指定边缘对齐（如 `bottom-right`）或相对触发器居中（如 `top-center`、`right-center`）。靠近视口边缘时会调整位置。 |
| content | `string` | — | 面板中的文本，也可通过 `#content` 插槽提供内容。 |
| visible | `boolean` | — | 控制浮层是否打开，支持 `v-model:visible`。 |
| defaultVisible | `boolean` | `false` | 省略 `visible` 时的初始打开状态。 |
| disabled | `boolean` | `false` | 禁用浮层。触发按钮的禁用状态可通过按钮自身的 `disabled` 设置。 |
| overlayClassName | `ClassValue` | — | 添加到面板的类名，支持字符串、数组及条件对象。 |
| overlayStyle | `StyleValue / function` | — | 设置面板行内样式，也可用接收触发器与面板节点的函数返回样式。 |
| showArrow | `boolean` | `false` | 显示指向触发器的箭头。 |
| zIndex | `number` | — | 设置面板的 CSS 层级。原生顶层中的面板按打开顺序叠放。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置面板的字号和内边距。 |

浮层继承触发元素所在位置最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。组件显式传入的 `size` 优先于全局尺寸。`mode` 和 `theme` 决定面板的背景、边框和文字颜色，`radius` 控制面板圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:visible | `visible: boolean` | 用户操作请求打开或关闭面板时，同步新的可见状态。 |
| visible-change | `visible: boolean` | 用户操作请求切换可见状态时触发。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 放置触发元素。接收 `{ visible, panelId }`，可用来设置触发按钮的 `aria-expanded` 和 `aria-controls`。 |
| content | 自定义面板内容，优先于 `content` 属性。接收 `{ close }`，可在面板内调用 `close()` 关闭。 |

## 使用指南

将可通过键盘聚焦的按钮放入默认插槽。使用默认的点击模式时，点击按钮打开面板，点击面板外部或按 Esc 即可关闭。需要从业务代码打开时，使用 `trigger="manual"` 并绑定 `v-model:visible`。

```vue
<script setup lang="ts" vapor>
import { YmButton, YmPopup } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmPopup content="发货后可在物流记录中查看运单号。">
    <template #default="{ visible, panelId }">
      <YmButton :aria-expanded="visible" :aria-controls="visible ? panelId : undefined">
        配送说明
      </YmButton>
    </template>
  </YmPopup>
</template>
```
