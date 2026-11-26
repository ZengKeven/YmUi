---
category: 聊天组件
---

# YmChatSender 对话发送框

用于编辑和发送多行消息，可在回复生成期间显示停止按钮。

## 交互示例

<ComponentDemo name="chat-sender" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string` | — | 当前草稿，支持 `v-model`，优先于 `value`。 |
| value | `string` | — | 当前草稿，也可通过 `v-model:value` 双向绑定。 |
| defaultValue | `string` | 空字符串 | 非受控模式下的初始草稿。 |
| attachments | `readonly ChatAttachmentItem[]` | — | 待发送的附件列表。传入空数组会显示「选择附件」按钮，通过 `v-model:attachments` 接收选择或移除后的列表。 |
| placeholder | `string` | 取 `textareaProps.placeholder` | 草稿为空时显示的提示文字。 |
| loading | `boolean` | `false` | 回复生成时设为 `true`，将当前操作切换为停止。 |
| stopDisabled | `boolean` | `false` | 与上游兼容的停止模式开关。设为 `true` 时也会显示停止按钮。 |
| sendBtnDisabled | `boolean` | `false` | 禁用点击和回车发送，仍可编辑草稿。 |
| disabled | `boolean` | 继承 | 禁用输入和操作按钮。显式设置优先，省略时取 `textareaProps.disabled` 或继承表单配置。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 设置整个发送框的尺寸。 |
| textareaProps | `ChatSenderProps['textareaProps']` | 默认自动增高 2 至 5 行 | 传给 `YmTextarea` 的编辑区设置，如 `id`、`aria-label`、`maxlength`、`autosize`。使用 `textareaProps.size` 可单独调整编辑区尺寸，草稿通过发送框的值属性管理。 |

发送框继承最近的 `ConfigProvider`。嵌套配置按项覆盖，组件显式设置的 `size` 优先。尺寸影响文字、内边距和操作按钮，`mode` 和 `theme` 控制面板、边框、文字和按钮的颜色，`radius` 控制面板圆角，设为 `0` 时显示直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string` | 用户编辑产生新值，供 `v-model` 同步草稿。 |
| update:value | `value: string` | 用户编辑产生新值，供 `v-model:value` 同步草稿。 |
| update:attachments | `attachments: ChatAttachmentItem[]` | 选择本地文件或移除附件时传出更新后的完整列表。 |
| change | `(value: string, context: { e: Event })` | 文本变化时传出新值和原生事件。中文输入法在确认候选词后同步。 |
| send | `(value: string, context: ChatSenderSendContext)` | 点击发送按钮或按 Enter 时传出草稿。上下文包含原生事件 `e` 和附件数组快照 `attachments`。仅发送附件时，`value` 为空字符串。 |
| stop | `(value: string, context: { e: MouseEvent })` | 点击停止按钮，传出此时输入框中的草稿。 |
| focus | `(value: string, context: { e: FocusEvent })` | 编辑区获得焦点。 |
| blur | `(value: string, context: { e: FocusEvent })` | 编辑区失去焦点。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| header | 发送框的顶部区域，可显示引用中的消息。 |
| inner-header | 编辑区上方的内容。 |
| input-prefix | 编辑区前方的内容，例如当前会话模式。 |
| footer-prefix | 底栏左侧的内容，例如快捷键提示。 |
| suffix | 自定义底栏右侧的操作区，优先于内置按钮。作用域中的 `loading` 表示当前显示停止操作，`disabled` 表示当前操作已禁用。将 `send` 或 `stop` 绑定到自定义按钮的点击事件即可沿用内置行为。 |

## 使用指南

按 Enter 发送，按 Shift+Enter 换行。在中文输入法中按 Enter 确认候选词后，再按一次 Enter 即可发送。组件发出 `send` 时保留输入内容，业务页面可在接受消息后清空绑定的草稿。接入流式回复时，将请求状态绑定到 `loading`，在 `stop` 回调里取消当前请求。

需要发送附件时，将 `v-model:attachments` 绑定到数组。每次选择的本地文件都会追加到列表中，原始 `File` 保存在 `raw`。在编辑区上方可以预览图片、移除文件。发送时，将 `context.attachments` 写入消息的 `{ type: 'attachment', data: context.attachments }` 内容块，然后清空绑定的附件数组。[本地发送示例](/chat-attachments/)

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatSender } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const draft = ref('')
const messages = ref<string[]>([])

function sendMessage(text: string) {
  messages.value.push(text)
  draft.value = ''
}
</script>

<template>
  <ol>
    <li v-for="(message, index) in messages" :key="index">{{ message }}</li>
  </ol>
  <YmChatSender v-model="draft" placeholder="输入消息" :textarea-props="{ 'aria-label': '消息正文' }"
    @send="sendMessage" />
</template>
```
