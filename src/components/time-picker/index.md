---
category: 表单组件
---

# YmTimePicker 时间选择器

选择一天中的某个时间或一段起止时间，可精确到分钟或秒。

## 交互示例

<ComponentDemo name="time-picker" />

将「选择模式」切换为「时间范围」，分别调整开始和结束时间，点击「确定」回填两个输入框。将「时间格式」切换为 `HH:mm`，即可只选择小时和分钟。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | `'single' \| 'range'` | `'single'` | 单选展示一个时间面板，范围模式同时展示开始和结束时间面板。 |
| modelValue | `string \| TimeRangeValue \| null` | — | 支持 `v-model`。单选传入时间字符串，范围传入元组 `[start, end]`，时间字符串须符合 `format`。传入 `null` 表示未选择。 |
| defaultValue | `string \| TimeRangeValue` | — | 非受控模式的初始值，与对应模式的 `modelValue` 格式相同。 |
| format | `'HH:mm:ss' \| 'HH:mm'` | `'HH:mm:ss'` | 使用 24 小时制，控制面板列数、输入框显示和提交值的精度。 |
| placeholder | `string` | 单选为「请选择时间」，范围为「开始时间」和「结束时间」 | 时间为空时的提示文字。显式设置时，范围模式的两个输入框使用相同提示。 |
| disabled | `boolean` | `false` | 禁用选择器。 |
| borderless | `boolean` | `false` | 隐藏输入框边框。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置输入框和面板控件的尺寸。 |
| name | `string` | — | 原生表单字段名。单选提交时间字符串，范围以「开始时间 至 结束时间」提交。 |
| form | `string` | — | 关联的原生表单 ID。 |
| popupProps | `TimePickerProps['popupProps']` | 默认在输入框左下方展开 | 通过 `placement` 设置浮层方向，通过 `attach` 指定挂载容器。 |

输入框和时间面板继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。组件显式传入的 `size` 优先。`mode` 和 `theme` 控制背景、文字、边框及选中时间的颜色。`radius` 控制输入框、面板和按钮的圆角。浮层挂载到外部容器时仍随选择器所在处的配置更新。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string \| TimeRangeValue` | 点击「确定」且值发生变化时同步 `v-model`。 |
| change | `value: string \| TimeRangeValue` | 新值提交时触发一次，范围模式返回按时间从早到晚排列的元组。 |

## 插槽

无插槽。

## 使用指南

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmTimePicker, type TimeRangeValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const dispatchTime = ref('09:30:15')
const businessHours = ref<TimeRangeValue>(['09:00', '18:00'])
</script>

<template>
  <YmTimePicker v-model="dispatchTime" aria-label="配送时间" />
  <YmTimePicker v-model="businessHours" mode="range" format="HH:mm" aria-label="营业时段" />
</template>
```

输入框聚焦时按 ↓ 或 Enter 打开面板。用 ↑、↓ 调整数值，用 ←、→ 切换时间列。点击「确定」提交，按 Esc 或点击面板外部可放弃本次调整。

空值从零点开始选择。范围为空时，先设置的一端会作为另一端的初始时间。两端可以相同，确认后按同一天内的先后顺序回填。
