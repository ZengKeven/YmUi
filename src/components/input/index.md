---
category: 表单组件
---

# YmInput 输入框

输入单行文本或密码。密码默认遮罩，点击输入框末尾的按钮可切换显示或隐藏。

## 交互示例

<ComponentDemo name="input" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `text / password` | `text` | 设置输入类型。 |
| modelValue | `string` | — | 当前内容，支持 `v-model`。同时传入 `value` 时，以 `modelValue` 为准。 |
| value | `string` | — | 可选的受控值，可配合 `change` 事件管理文本。 |
| defaultValue | `string` | 空字符串 | 省略 `modelValue` 和 `value` 时使用的初始内容。 |
| placeholder | `string` | — | 输入框为空时显示的提示。 |
| name | `string` | — | 原生表单提交时使用的字段名。 |
| readonly | `boolean` | `false` | 只读时可聚焦、选择和复制文本。 |
| disabled | `boolean` | `false` | 禁用输入框及密码显示按钮。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制输入框的高度、字号和内边距。 |

传给 `YmInput` 的 `id`、`name`、`form`、`maxlength`、`autocomplete`、`required` 和 `aria-*` 等属性直接作用于内部的原生 `<input>` 元素。使用 `<label for="...">` 时，`for` 应与输入框的 `id` 一致。`class` 和 `style` 作用于整个控件，可用来设置宽度。

输入框继承最近的 `ConfigProvider`，嵌套时逐项覆盖。显式传入的 `size` 优先。`mode` 和 `theme` 控制背景、文字、边框和聚焦时的强调色。`radius` 控制输入框圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string` | 用户编辑内容时同步新的字符串。使用中文输入法时，确认候选词后同步。 |
| change | `(value: string, context: { e: Event })` | 用户编辑产生新值时，传出文本和触发本次更新的事件。 |

可在组件上监听 `input`、`focus`、`blur`、`keydown` 等原生输入框事件。

## 插槽

无插槽。

## 使用指南

用 `v-model` 绑定字符串。登录表单可分别为账号和密码设置 `autocomplete`，供浏览器自动填充。通过组件引用调用 `focus()` 或 `blur()` 可控制输入焦点。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmInput } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const username = ref('')
const password = ref('')
</script>

<template>
  <label for="username">账号</label>
  <YmInput id="username" v-model="username" name="username" autocomplete="username" />
  <label for="password">密码</label>
  <YmInput id="password" v-model="password" type="password" name="password" autocomplete="current-password" />
</template>
```
