---
category: 表单组件
---

# YmRadio 单选框

用 `YmRadioGroup` 将多个 `YmRadio` 组成一组，同一时间只能选择其中一项。

## 交互示例

<ComponentDemo name="radio" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| YmRadio.modelValue | `boolean` | `defaultChecked` | 单独使用时的选中状态，支持 `v-model`。组内由组的选中值决定。 |
| YmRadio.defaultChecked | `boolean` | `false` | 单独使用且省略 `modelValue` 时的初始选中状态。 |
| YmRadio.value | `RadioValue` | — | 组内必填，且每项的值应唯一。也用于原生表单提交。 |
| YmRadio.label | `string` | 显示 `value` | 标签文字，可通过默认插槽自定义。 |
| YmRadio.disabled | `boolean` | `false` | 禁用当前项。所属组禁用时，所有子项都禁用。 |
| YmRadio.name | `string` | — | 单独使用时设置原生表单字段名。组内统一使用组名。 |
| YmRadio.size | `ControlSize` | 继承 | 控制选项的圆点尺寸与标签字号。 |
| YmRadioGroup.modelValue | `RadioValue` | `defaultValue` | 已选中的选项值，支持 `v-model`。 |
| YmRadioGroup.defaultValue | `RadioValue` | — | 省略 `modelValue` 时的初始选中值。 |
| YmRadioGroup.options | `readonly RadioOption[]` | — | 传入选项值，或含有 `value`、可选 `label` 和 `disabled` 的对象。 |
| YmRadioGroup.name | `string` | 自动生成 | 组内所有单选框共用的原生表单字段名。 |
| YmRadioGroup.disabled | `boolean` | `false` | 禁用整组，保留当前选择。 |
| YmRadioGroup.direction | `horizontal / vertical` | `horizontal` | 指定选项横向或纵向排列。 |
| YmRadioGroup.size | `ControlSize` | 继承 | 设置整组选项的尺寸及间距，子项可显式覆盖自身尺寸。 |

`RadioValue` 可以是字符串、数字或布尔值。比如 `:value="0"` 表示数字，`value="0"` 表示字符串。

单选框继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。`size` 有 `extra-small`、`small`、`medium`、`large` 四档，初始为 `medium`。`mode` 和 `theme` 控制文字、圆点、边框与焦点配色。`radius` 控制标签键盘焦点轮廓的圆角，设为 `0` 时轮廓为直角。单选指示器保持圆形。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| YmRadio.update:modelValue | `checked: boolean` | 用户选中当前项时，同步选中状态。 |
| YmRadio.change | `(checked: boolean, context: { e: Event })` | 用户选中当前项时，传出选中状态和原生事件。 |
| YmRadioGroup.update:modelValue | `value: RadioValue` | 用户切换选项时，同步新选项的值。 |
| YmRadioGroup.change | `(value: RadioValue, context: { e: Event, name: string })` | 用户切换选项时，传出选项值、原生事件和组名。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| YmRadio.default | 自定义选项的标签内容，优先于 `label`。 |
| YmRadioGroup.default | 用 `YmRadio` 定义组内选项，优先于 `options`。 |

## 使用指南

单个 `YmRadio` 可以用布尔值记录选中状态。要从多个选项中选出一个，在组上绑定选中值。键盘用户可以按 Tab 进入分组，再用方向键切换选项。重复点击已选项会保留当前选择。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmRadioGroup, type RadioValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const delivery = ref<RadioValue>('courier')
const options = [
  { value: 'courier', label: '快递配送' },
  { value: 'pickup', label: '门店自提' },
]
</script>

<template>
  <YmRadioGroup v-model="delivery" name="delivery" aria-label="配送方式" :options="options" />
</template>
```
