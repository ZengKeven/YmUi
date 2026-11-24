---
category: 表单组件
---

# YmTextarea 多行文本框

用于编辑包含换行的文本，例如收货备注或审批意见，支持自动调整高度和字数限制。

## 交互示例

<ComponentDemo name="textarea" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string` | — | 当前文本，支持 `v-model`，优先于 `value`。 |
| value | `string` | — | 由外部控制的文本，可配合 `change` 事件更新。 |
| defaultValue | `string` | 空字符串 | 非受控模式下的初始文本。 |
| placeholder | `string` | — | 内容为空时显示的占位文字。 |
| rows | `number` | `3` | 固定高度模式下的可见行数。 |
| autosize | `boolean` 或 `{ minRows?: number, maxRows?: number }` | `false` | 开启后随文本换行增减高度，默认至少一行。传入对象可限制行数，达到上限后在框内滚动。 |
| maxlength | `number \| string` | — | 按 UTF-16 编码单元限制长度。常用汉字占 1，许多 emoji 占 2。 |
| maxcharacter | `number` | — | 按权重计数，每个 ASCII 字符计 1，其他 Unicode 码点计 2。与 `maxlength` 同时设置时优先。 |
| allowInputOverMax | `boolean` | `false` | 开启后允许继续输入超限内容，并以错误状态提示。 |
| status | `default / success / warning / error` | `default` | 设置边框和提示文字的校验状态。 |
| tips | `string` | — | 显示在输入区下方的提示文字，可通过 `#tips` 自定义内容。 |
| align | `left / center / right` | `left` | 输入内容和占位文字的水平对齐方式。 |
| autofocus | `boolean` | `false` | 自动聚焦并全选已有文本，直接键入即可替换。 |
| name | `string` | — | 提交原生表单时使用的字段名。 |
| form | `string` | — | 关联表单的 ID，支持文本框放在表单外。 |
| readonly | `boolean` | `false` | 只读时仍可聚焦、选择和复制文本。 |
| disabled | `boolean` | `false` | 禁用文本框。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制输入文字大小和内边距，显式设置优先。 |

设置 `maxlength` 或 `maxcharacter` 后，字数统计显示在编辑区内的右下角，滚动文本时仍然可见。

传入的 `class` 作用于整个组件。`style`、`id`、`aria-*`、`required` 等属性作用于原生 `<textarea>`。需要指定编辑区宽度或固定高度时，可通过 `style` 设置。

多行文本框继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。`mode` 和 `theme` 决定背景、文字、边框、焦点和校验状态的颜色。`radius` 设置输入区的圆角，设为 `0` 时为直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string` | 用户输入产生新值时同步文本，使用中文输入法时在确认候选词后同步。 |
| change | `(value: string, context: { e: Event })` | 用户编辑产生新值时，传出文本和触发本次更新的事件。 |
| validate | `context: { error?: 'exceed-maximum' }` | 超限状态变化时触发。超限时 `error` 为 `exceed-maximum`，恢复到限制以内时为 `undefined`。 |

可以监听原生 `focus`、`blur` 和 `keydown` 等事件，回调接收浏览器事件对象。

## 插槽

| 名称 | 说明 |
| --- | --- |
| tips | 自定义输入区下方的提示内容，优先于同名属性。 |

## 使用指南

用 `v-model` 绑定多行文本。以下例子保留两行输入空间，内容增多时扩展至六行。通过组件引用调用 `focus()` 或 `blur()` 可控制焦点。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmTextarea } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const note = ref('')
</script>

<template>
  <label for="delivery-note">收货备注</label>
  <YmTextarea id="delivery-note" v-model="note" name="note" :autosize="{ minRows: 2, maxRows: 6 }" />
</template>
```
