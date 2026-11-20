---
category: 导航组件
---

# YmSteps 步骤条

按顺序展示流程中的各个环节，标出已完成、进行中、待开始或出错的步骤。

## 交互示例

<ComponentDemo name="steps" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | `readonly StepOption[]` | `[]` | 步骤列表，数组顺序决定流程的先后。 |
| current | `string \| number` | 第一项的标识 | 当前步骤的标识，支持 `v-model:current`。 |
| layout | `horizontal / vertical` | `horizontal` | 横向或纵向排列。 |
| readonly | `boolean` | `false` | 只读时由外部更新当前步骤。 |
| sequence | `positive / reverse` | `positive` | 正序或倒序展示，步骤编号和完成进度始终按原始顺序计算。 |
| separator | `line / dashed / arrow` | `line` | 相邻步骤之间使用实线、虚线或箭头。 |
| theme | `default / dot` | `default` | 默认显示编号和状态图标，`dot` 显示圆点。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制标记尺寸和文字大小。 |

`StepOption` 定义单个步骤。

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `string` | 必填 | 步骤标题。 |
| value | `string \| number` | 原始数组下标，从 0 开始 | 步骤的唯一标识。`'FINISH'` 保留给全部完成状态。 |
| content | `string` | — | 步骤说明。 |
| extra | `string` | — | 显示在说明下方的补充内容。 |
| icon | `IconName` | 随状态和风格显示 | 自定义标记，使用 `YmIcon` 内置图标名。 |
| status | `default / process / finish / error` | 按进度推导 | 可指定进行中、已完成或错误状态。`default` 采用自动推导。 |

组件继承最近的 `ConfigProvider`，嵌套时逐项覆盖。全局 `size` 作用于标记和字号，步骤条显式设置的 `size` 优先。全局 `mode` 和 `theme` 决定文字、连接线和标记的配色，其中进行中、已完成、出错分别使用主要色、成功色和危险色。`radius` 控制默认标记和交互焦点的圆角，圆点风格保持圆形。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:current | `current: StepValue` | 用户选择其他步骤时，传出该步骤的标识。 |
| change | `(current: StepValue, previous: StepValue, context: { e: MouseEvent })` | 用户切换步骤时触发一次，传出新旧标识和原生点击事件。键盘激活同样触发。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| icon | 自定义步骤标记，优先于 `option.icon`、默认状态图标和圆点。 |
| title | 自定义标题，优先于 `option.title`。 |
| content | 自定义步骤说明，优先于 `option.content`。 |
| extra | 自定义补充内容，优先于 `option.extra`。 |

各插槽均接收 `{ option, index, status }`。其中 `option` 为原始步骤，`index` 为从 0 开始的原始下标，`status` 为最终显示状态。

## 使用指南

绑定 `v-model:current` 后，点击步骤或使用 Tab 聚焦并按 Enter 或空格即可切换。当前步骤之前的项目显示为已完成，之后的项目显示为待开始。设置 `current="FINISH"` 可将流程标记为全部完成。所有步骤均使用下标时，也可以将 `current` 设置为数组长度。其他未匹配的标识视为流程尚未开始，单项显式指定的状态始终优先。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmSteps, type StepOption, type StepValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const current = ref<StepValue>('review')
const steps: StepOption[] = [
  { value: 'submit', title: '提交申请' },
  { value: 'review', title: '审核申请' },
  { value: 'receive', title: '确认入库' },
]
</script>

<template>
  <YmSteps v-model:current="current" :options="steps" />
</template>
```
