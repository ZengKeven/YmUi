---
category: 聊天组件
---

# YmChatbot 聊天机器人

在同一个对话窗口发送文字和附件，查看逐段生成的回复，并可停止生成、重新生成或清空历史。

## 交互示例

<ComponentDemo name="chatbot" />

输入「到货后在哪里登记？」并选择一张图片，也可以只发附件。点击「发送消息」后，用户消息会保留文字和附件，本地收货助手会逐段答复。在首段出现后点击「停止生成」，可以看到已收到的内容保留在原处。

点击这条回复下方的「重新生成」，观察同一条回复从头生成。点击「清空历史」，取消可继续当前对话，确认会移除已有消息并结束正在生成的回复。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| request | `(context: ChatbotRequestContext) => void \| Promise<void>` | 必填 | 每次发送或重新生成时调用。用 `context.onChunk` 追加 Markdown 片段，返回的 Promise 应在最后一个片段交付后完成。 |
| defaultMessages | `readonly ChatMessageData[]` | 空数组 | 初始化时载入的历史消息，按从旧到新的顺序排列，每条消息使用唯一的 `id`。 |
| placeholder | `string` | 输入消息 | 发送框为空时的提示。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制消息字号、列表间距、发送框和操作按钮尺寸。 |

省略 `size` 时继承最近的 `ConfigProvider`，局部尺寸优先。嵌套 Provider 按项继承配置。`mode` 和 `theme` 控制消息、输入框及按钮的配色，`radius` 控制面板、气泡、发送框和清空确认框的圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| message-change | `(messages: ChatMessageData[])` | 发送、接收片段、更新回复状态或清空历史时传出当前消息列表，可用于同步业务页面中的消息记录。 |

## 插槽

无插槽。

## 使用指南

`request` 会收到以下上下文。把每段新增的文字交给 `onChunk`，组件会拼接并渲染为同一条助手消息。请求抛错或返回被拒绝的 Promise 时，助手消息进入 `error` 状态，用户可以重新生成。

| 字段 | 说明 |
| --- | --- |
| prompt | 本轮用户输入的文字。仅发送附件时为空字符串。 |
| attachments | 本轮附件列表。本地选择的原始 `File` 保存在每项的 `raw` 字段。 |
| messages | 截至本轮用户消息的历史记录。重新生成时仍以原来的用户消息结尾。 |
| trigger | 发送时为 `send`，重新生成时为 `regenerate`。 |
| signal | 本次请求的 `AbortSignal`。将它传给 `fetch`，或监听 `abort` 来清理定时器、结束数据读取。 |
| onChunk | `(delta: string) => void`，将一个新增片段追加到当前回复。 |

下面的最小示例直接答复文字与附件。接入异步服务时，返回覆盖整段回复过程的 Promise。

```vue
<script setup lang="ts" vapor>
import { YmChatbot, type ChatbotRequestContext } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

function reply({ prompt, attachments, onChunk }: ChatbotRequestContext) {
  if (prompt) onChunk('已收到你的问题。')
  if (attachments.length) onChunk(`收到 ${attachments.length} 个附件。`)
}
</script>

<template>
  <YmChatbot :request="reply" />
</template>
```

通过模板引用取得 `ChatbotInstance` 后，可调用以下方法。

| 方法 | 说明 |
| --- | --- |
| `sendUserMessage({ prompt, attachments })` | 发起一轮对话，两个字段任选其一或同时提供。返回 `Promise<void>`。 |
| `regenerate()` | 使用最后一轮的提问和附件，替换该轮助手回复。返回 `Promise<void>`。 |
| `abortChat()` | 停止当前回复并保留已显示的内容。 |
| `clearMessages()` | 直接清空历史并中止当前请求，保留正在编辑的草稿。界面上的「清空历史」按钮会先请求确认。 |
