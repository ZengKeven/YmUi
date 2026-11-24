---
category: 表单组件
---

# YmCheckbox 复选框

用 `YmCheckbox` 切换单个选项，用 `YmCheckboxGroup` 从多个选项中选择任意项。

## 交互示例

<ComponentDemo name="checkbox" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| YmCheckbox.modelValue | `boolean` | `defaultChecked` | 单独使用时的选中状态，支持 `v-model`。组内由组的选中值决定。 |
| YmCheckbox.defaultChecked | `boolean` | `false` | 单独使用且省略 `modelValue` 时的初始状态。 |
| YmCheckbox.value | `CheckboxValue` | — | 组内必填，每一项的值应唯一。也用于原生表单提交。 |
| YmCheckbox.label | `string` | 显示 `value` | 标签文字，可通过默认插槽自定义。 |
| YmCheckbox.indeterminate | `boolean` | `false` | 显示半选状态，适合表示一组中只有部分选项被选中。 |
| YmCheckbox.disabled | `boolean` | `false` | 禁用当前项。所属组禁用时，所有子项都禁用。 |
| YmCheckbox.name | `string` | 继承所属组 | 原生表单字段名，可为单项单独指定。 |
| YmCheckbox.size | `ControlSize` | 继承 | 设置当前项的方框尺寸和标签字号。 |
| YmCheckbox.theme | `default / primary / success / warning / danger` | 继承所属组，单独使用时为 `primary` | 设置选中、半选、悬停边框和键盘焦点环的颜色。 |
| YmCheckboxGroup.modelValue | `readonly CheckboxValue[]` | `defaultValue` | 已选值数组，支持 `v-model`。 |
| YmCheckboxGroup.defaultValue | `readonly CheckboxValue[]` | `[]` | 省略 `modelValue` 时的初始选中值。 |
| YmCheckboxGroup.options | `readonly CheckboxOption[]` | — | 每项可直接传值，也可传 `{ value, label?, disabled?, theme? }`。选项的 `theme` 优先于组主题。 |
| YmCheckboxGroup.disabled | `boolean` | `false` | 禁用整组，保留已有选择。 |
| YmCheckboxGroup.name | `string` | — | 为组内各项统一设置原生表单字段名。 |
| YmCheckboxGroup.size | `ControlSize` | 继承 | 设置组内控件尺寸和间距，子项可显式覆盖自身尺寸。 |
| YmCheckboxGroup.theme | `default / primary / success / warning / danger` | `primary` | 为组内选项统一设置语义色，子项可用自己的 `theme` 覆盖。 |

`CheckboxValue` 可以是字符串、数字或布尔值。需要保留值的类型时使用属性绑定，例如 `:value="0"` 和 `:value="false"`。

复选框及其分组继承最近的 `ConfigProvider`，嵌套时逐项覆盖。`size` 支持 `extra-small`、`small`、`medium`、`large` 四档，默认是 `medium`。组件的 `theme` 从当前调色板选取语义色，例如 `theme="success"` 会随全局 `mode` 使用浅色或深色调色板中的 `success`。`default` 使用中性色。`radius` 控制方框圆角，设为 `0` 可显示直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| YmCheckbox.update:modelValue | `checked: boolean` | 用户切换当前项时同步选中状态。 |
| YmCheckbox.change | `(checked: boolean, context: { e: Event })` | 用户切换当前项时，传出新状态及原生事件。 |
| YmCheckboxGroup.update:modelValue | `values: CheckboxValue[]` | 用户选择或取消组内某项时，同步新的选中值数组。 |
| YmCheckboxGroup.change | `(values: CheckboxValue[], context: CheckboxGroupChangeContext)` | 传出新数组。上下文的 `e` 为原生事件，`current` 为本次变更项的值，`type` 为 `check` 或 `uncheck`。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| YmCheckbox.default | 自定义单项标签内容，优先于 `label`。 |
| YmCheckboxGroup.default | 使用 `YmCheckbox` 子组件定义各项，优先于 `options`。 |

## 使用指南

单个复选框绑定布尔值，多个相关选项在组上绑定数组即可。点击标签或聚焦复选框后按空格键，都可以切换选中状态。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmCheckbox, YmCheckboxGroup, type CheckboxValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const subscribed = ref(false)
const channels = ref<CheckboxValue[]>(['email'])
const options = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
]
</script>

<template>
  <YmCheckbox v-model="subscribed">接收订单提醒</YmCheckbox>
  <YmCheckboxGroup v-model="channels" theme="success" name="channel" aria-label="通知方式" :options="options" />
</template>
```
