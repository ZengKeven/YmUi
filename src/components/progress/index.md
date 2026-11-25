---
category: 反馈组件
---

# YmProgress 进度条

用横向进度条或圆环显示上传、导入等任务的完成比例。

## 交互示例

<ComponentDemo name="progress" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| percentage | `number` | `0` | 当前进度，取值为 0 至 100，超出范围时按最近的边界值显示。 |
| theme | `line / plump / circle` | `line` | `line` 在横条旁显示标签，`plump` 将标签放在横条内，`circle` 将标签放在圆环中央。 |
| status | `active / success / warning / error` | 随进度变化 | 可显式设置进行中、成功、警告或错误。省略时使用主题主色，达到 100% 时使用成功色并显示 `100%`。 |
| label | `boolean / string` | `true` | 默认显示百分比。显式指定成功、警告或错误状态时，横线和圆环显示对应图标。传字符串可自定义文字，传 `false` 可隐藏标签。 |
| size | `extra-small / small / medium / large` 或数值 | 继承全局尺寸，初始为 `medium` | 设置进度条尺寸。圆环还接受数字或数字字符串，以像素为单位指定直径。 |
| strokeWidth | `number / string` | 随尺寸和形态变化 | 设置横条高度或圆环线宽。数字表示像素，字符串可使用 CSS 长度。 |
| color | `string / string[] / Record<string, string>` | 当前状态色 | 设置已完成部分的颜色。传颜色数组可生成均匀渐变，也可以用 `{ from, to }` 指定起止颜色，或用百分比键指定色标位置。 |
| trackColor | `string` | 当前主题的轨道色 | 设置未完成部分的背景色，支持 CSS 颜色或颜色变量。 |

进度条继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。`size` 控制默认尺寸，组件显式设置的尺寸优先。全局 `mode` 和 `theme` 决定浅色、深色下的轨道、文字与状态色。组件的 `color` 和 `trackColor` 可分别覆盖进度色和轨道色。全局 `radius` 控制横条的圆角，圆环始终保持圆形。

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| label | 接收 `{ percentage, status }`，分别为实际显示的百分比和当前状态。插槽优先于标签文字及状态图标，`label` 为 `false` 时整个标签隐藏。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { YmProgress } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmProgress aria-label="文件上传进度" :percentage="65" />
  <YmProgress aria-label="导入进度" theme="circle" :percentage="75" :size="96">
    <template #label="{ percentage }">{{ percentage }}%</template>
  </YmProgress>
</template>
```
