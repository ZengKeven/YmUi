---
category: 表单组件
---

# YmInputNumber 数字输入框

直接输入数值，按 Enter 或移开焦点时确认。零显示为 `-`，负数使用红色文字。

## 交互示例

<ComponentDemo name="input-number" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `number \| null` | — | 当前数值，支持 `v-model`。同时设置 `value` 时优先使用 `modelValue`。 |
| value | `number \| null` | — | 受控数值，可配合 `change` 更新。 |
| defaultValue | `number \| null` | 空 | 省略 `modelValue` 和 `value` 时使用的初始数值。 |
| decimalPlaces | `number` | 保留有效小数位 | 小数位数，取 0 到 20 的整数。确认时四舍五入，显示时补足末尾的零。 |
| min | `number` | 无下限 | 可输入的最小值，含边界。 |
| max | `number` | 无上限 | 可输入的最大值，含边界。 |
| align | `left / center / right` | `right` | 设置数值、零值符号和占位文字的水平对齐方式。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制输入框的高度、字号和内边距。 |
| placeholder | `string` | — | 空值时的提示文字。 |
| readonly | `boolean` | `false` | 只读时可聚焦并复制数值。 |
| disabled | `boolean` | `false` | 禁用输入框。 |
| name | `string` | — | 原生表单使用的字段名。 |
| form | `string` | — | 关联表单的 `id`。 |

数字输入框继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。显式传入的 `size` 优先。`mode` 和 `theme` 控制背景、文字、边框及聚焦时的强调色，负数文字使用主题危险色。`radius` 控制输入框圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: number \| null` | 确认后数值发生变化时同步，清空后传出 `null`。 |
| change | `(value: number \| null, context: { e: Event })` | 确认后数值发生变化时触发，附带此次操作的原生事件。 |
| focus | `event: FocusEvent` | 输入框获得焦点时触发。 |
| blur | `event: FocusEvent` | 输入框失去焦点时触发。 |

## 插槽

无插槽。

## 使用指南

以下示例允许输入 −100 到 100 的调整金额，并保留两位小数。输入 `-12.346` 后按 Enter，输入框显示 `-12.35`。输入 `120` 会调整为 `100.00`。范围边界的小数位多于指定精度时，取范围内符合精度的最近数值。若整个区间都无法满足精度，则保留最近的边界值。

零在聚焦时显示为选中的 `0`，可以直接覆盖。仅输入负号或输入无效文本时恢复上次确认的数值。清空后确认会显示占位提示。通过组件引用调用 `focus()` 或 `blur()` 可控制焦点。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmInputNumber } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const amount = ref<number | null>(0)
</script>

<template>
  <label for="amount">调整金额</label>
  <YmInputNumber id="amount" v-model="amount" :decimal-places="2" :min="-100" :max="100"
    name="amount" placeholder="请输入调整金额" />
</template>
```
