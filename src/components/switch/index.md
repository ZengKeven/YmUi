---
category: 表单组件
---

# YmSwitch 开关

用于立即开启或关闭一项设置，例如邮件通知。

## 交互示例

<ComponentDemo name="switch" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `SwitchValue` | — | 当前值，支持 `v-model`，优先于 `value`。 |
| value | `SwitchValue` | — | 受控值，可配合 `change` 事件更新。 |
| defaultValue | `SwitchValue` | `customValue[1]` | 省略两个受控属性时的初始值，默认关闭。 |
| customValue | `[SwitchValue, SwitchValue]` | `[true, false]` | 依次指定开启值和关闭值，例如 `[1, 0]`。 |
| label | 字符串或两个字符串组成的数组 | — | 字符串会在两种状态下都显示。数组依次指定开启和关闭时的文字。 |
| theme | `default / primary / success / warning / danger` | `primary` | 设置开启时的轨道颜色、加载图标和键盘焦点环的颜色。`default` 为中性色，关闭时各主题的轨道均使用边框色。 |
| disabled | `boolean` | `false` | 禁用开关，保留当前值。 |
| loading | `boolean` | `false` | 在滑块中显示加载指示器，加载期间暂停切换。 |
| beforeChange | `() => boolean \| Promise<boolean>` | — | 切换前执行。返回 `true` 或 Promise 兑现为 `true` 时切换。返回 `false` 或 Promise 被拒绝时保留原值。等待期间只处理当次操作。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制开关尺寸与文字大小。 |

`SwitchValue` 可以是布尔值、字符串或数字。绑定值与 `customValue` 中的值应使用相同的类型。

开关继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。组件显式传入的 `size` 优先。开关的 `theme` 从当前调色板选取语义色，例如 `theme="success"` 会随全局显示模式使用浅色或深色调色板中的 `success`。`radius` 控制轨道圆角，设为 `0` 时轨道为直角，滑块保持圆形。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: SwitchValue` | 用户切换时传出新值，用于同步 `v-model`。 |
| change | `(value: SwitchValue, context: { e: MouseEvent })` | 用户通过鼠标或键盘切换时，传出新值和触发本次操作的原生点击事件。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| label | 自定义轨道中的状态内容，优先于 `label` 属性。接收当前值 `value` 和表示是否开启的布尔值 `checked`。 |

## 使用指南

用 `aria-label` 描述开关控制的设置，或用 `aria-labelledby` 关联页面上的设置名称。按 Tab 聚焦开关后，按空格键或回车键即可切换。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmSwitch } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const notifications = ref(false)
</script>

<template>
  <label>邮件通知 <YmSwitch v-model="notifications" theme="success" aria-label="邮件通知" /></label>
</template>
```
