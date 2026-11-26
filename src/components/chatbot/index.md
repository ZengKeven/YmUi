---
category: 聊天组件
---

# YmChatbot 聊天机器人

在同一个对话窗口发送文字和附件，查看逐段生成的回复，并可停止生成、重新生成或清空历史。

## 交互示例

<ComponentDemo name="chatbot" />

输入「到货后在哪里登记？」并选择一张图片，也可以只发附件。点击「发送消息」后，浏览器会向本地 `/api/chat/sse` 发送 POST 请求。首段出现后点击「停止生成」，可以看到连接中止，已收到的文字保留在原处。

点击这条回复下方的「重新生成」，观察同一条回复从头生成。点击「清空历史」，取消可继续当前对话，确认会移除已有消息并结束正在生成的回复。

将「模拟服务」切换到「流中出错」可查看首段之后的错误状态。切回「正常回复」后，点击「重新生成」即可重试。运行 `npm run dev` 后打开 `/chatbot/` 就能体验；构建后可用 `npm run preview:playground` 启动同一模拟接口。单独部署静态页面时，需要提供自己的 SSE 服务地址。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| chatServiceConfig | `ChatServiceConfig` | — | 配置 SSE 服务地址、事件映射及生命周期回调。发送和重新生成都会发起新请求。 |
| request | `(context: ChatbotRequestContext) => void \| Promise<void>` | — | 自定义回复函数。与 `chatServiceConfig` 同时设置时优先使用此函数。 |
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

提供 `chatServiceConfig` 或 `request` 即可启用发送。下面的配置使用原生 `fetch` 读取 SSE 流。

```vue
<script setup lang="ts" vapor>
import { YmChatbot, type ChatServiceConfig } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const config: ChatServiceConfig = { endpoint: '/api/chat/sse' }
</script>

<template>
  <YmChatbot :chat-service-config="config" />
</template>
```

默认请求为 POST，使用 JSON 正文传递 `prompt`、`attachments`、`messages` 和 `trigger`。附件发送名称、大小、URL 等元数据；需要上传文件本体时，可在 `onRequest` 中读取附件的 `raw` 并构造 `FormData`。重新生成的 `trigger` 为 `regenerate`，历史记录截至原用户提问。

服务端响应的媒体类型应为 `text/event-stream`，每个事件以空行分隔。例如下面的响应会逐段显示「请在北门登记。」。

```text
data: {"delta":"请在北门"}

data: {"delta":"登记。"}

data: [DONE]

```

可直接发送纯文本、JSON 字符串或含字符串 `delta` 的对象。在同一事件内，多行 `data:` 以换行连接；注释行会被忽略。完整事件可跨越网络分片和 UTF-8 字符边界。`[DONE]`、带有 data 的 `event: done` 或正常 EOF 都会结束读取；EOF 前尚未用空行结束的事件会被丢弃。

| ChatServiceConfig 字段 | 用法 |
| --- | --- |
| endpoint / stream | `endpoint` 为必填地址，可以是相对路径。`stream` 可省略或设为 `true`。 |
| onRequest(params) | 返回可选的 `RequestInit` 配置，例如请求头、方法、自定义正文或凭据选项。取消信号由当前会话管理。 |
| onMessage(chunk) | 对自定义协议返回 Markdown 增量字符串或 `{ type: 'markdown', data: '…' }`，返回 `null` 或 `undefined` 跳过事件。`SSEChunkData` 含 `event`、`id`、原文 `raw` 和 `data`。合法 JSON 会解码为相应值，其他数据保留为文本。 |
| onError(error) | HTTP 状态异常、响应类型错误、网络中断、`event: error` 或映射失败时接收 `Error`；消息进入错误状态并保留已显示部分。服务端可用 `event: error` 和 `data: {"message":"错误说明"}` 传递原因。 |
| onAbort() | 停止、清空或卸载中止当前请求时调用。 |
| onComplete(isAborted, params) | 成功结束时首个参数为 `false`，主动取消时为 `true`。失败通过 `onError` 通知。 |

在组件外可从 `ym-ui-vapor` 导入 `ChatEngine`。调用 `new ChatEngine(config).send(context)`，传入本轮的 `ChatEngineRequestContext`（字段见下表）。使用自己的 `AbortController.signal`，调用 `abort()` 即可取消。正常结束时 Promise 完成，失败或取消时 Promise 拒绝。

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
