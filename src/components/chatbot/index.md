---
category: 聊天组件
---

# YmChatbot 聊天机器人

在同一个对话窗口发送文字和附件，查看逐段生成的思考过程与 Markdown 回复，点击推荐问题继续对话。

## 交互示例

<ComponentDemo name="chatbot" />

输入「到货后在哪里登记？」并发送，也可以附上一张图片或只发附件。本地 `/api/chat/sse` 会先逐段显示思考过程，再输出「收货安排」的 Markdown 回复。回复完成后点击「要带哪些单据？」，可以看到新一轮提问和逐段生成的单据清单。

生成时可点击「停止生成」保留已收到的思考与正文，再点击「重新生成」让同一条回复从头生成。确认「清空历史」会移除所有消息并结束当前请求。

将「模拟服务」切换到「流中出错」可在首段 Markdown 之后看到错误状态。切回「思考、回复与推荐问题」后可重新生成。运行 `npm run dev` 后打开 `/chatbot/` 就能体验，构建后可用 `npm run preview:playground` 启动同一模拟接口。单独部署静态页面时需要提供自己的 SSE 服务地址。

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

默认请求为 POST，使用 JSON 正文传递 `prompt`、`attachments`、`messages` 和 `trigger`。附件发送名称、大小和 URL 等元数据。需要上传文件本体时，可在 `onRequest` 中读取附件的 `raw` 并构造 `FormData`。发送和点击追问的 `trigger` 为 `send`。重新生成的 `trigger` 为 `regenerate`，历史记录截至原用户提问。

服务端响应的媒体类型应为 `text/event-stream`，每个事件以空行结束。下面的响应会在同一条助手消息里逐步展示思考、正文和推荐问题。

```text
data: {"type":"thinking","data":{"text":"核对收货预约。"}}

data: {"type":"thinking","data":{"text":"\n确认登记地点。"}}

data: {"type":"markdown","data":"## 收货安排\n\n"}

data: {"type":"markdown","data":"请在北门登记。"}

data: {"type":"suggestion","data":[{"title":"要带哪些单据？","prompt":"办理收货需要准备哪些单据？"}]}

data: [DONE]

```

| 分片类型 | 如何更新本轮回复 |
| --- | --- |
| `thinking` | 连续分片的 `data.text` 追加到同一思考面板。`data.title` 可选，每次传入都会更新面板标题。收到首段正文或本轮结束时显示思考完成，也可用 `status: 'complete'` 提前结束思考。 |
| `markdown` | `data` 是本次新增的 Markdown 字符串。相邻正文分片会拼接到同一个 Markdown 块。纯文本、JSON 字符串和旧格式 `{"delta":"新增文字"}` 也按 Markdown 增量处理。 |
| `suggestion` | `data` 是完整问题数组，以最近一组为准，传 `[]` 可撤下推荐。可以在回复中途发送，组件会在本轮成功完成后展示。若显式传入块的 `status`，取值为 `complete` 时才展示。 |

点击推荐项会把它的 `prompt` 作为新消息发送，缺省或全为空白时使用 `title`。追问会携带已有对话历史，输入框中的草稿和待发送附件留给用户继续编辑。生成期间推荐按钮禁用。停止或出错会保留本轮已显示的思考与正文，并丢弃本轮待展示的推荐。

同一事件内的多行 `data:` 以换行连接，注释行会被忽略。事件可以跨越网络分片和 UTF-8 字符边界。`[DONE]`、带有 data 的 `event: done` 或正常 EOF 都会结束读取。EOF 前尚未用空行结束的事件会被丢弃。

| ChatServiceConfig 字段 | 用法 |
| --- | --- |
| endpoint / stream | `endpoint` 为必填地址，可以是相对路径。`stream` 可省略或设为 `true`。 |
| onRequest(params) | 返回可选的 `RequestInit` 配置，例如请求头、方法、自定义正文或凭据选项。取消信号由当前会话管理。 |
| onMessage(chunk) | 自定义事件映射，返回 Markdown 增量字符串或一个 `ChatStreamContent`，返回 `null` 或 `undefined` 跳过事件。`SSEChunkData` 含 `event`、`id`、原文 `raw` 和 `data`。合法 JSON 会解码为相应值，其他数据保留为文本。 |
| onError(error) | HTTP 状态异常、响应类型错误、网络中断、内容块格式无效、`event: error` 或映射失败时接收 `Error`。消息进入错误状态并保留已显示部分。服务端可用 `event: error` 和 `data: {"message":"错误说明"}` 传递原因。 |
| onAbort() | 停止、清空或卸载中止当前请求时调用。 |
| onComplete(isAborted, params) | 成功结束时首个参数为 `false`，主动取消时为 `true`。失败通过 `onError` 通知。 |

如果后端通过 SSE 事件名区分分片，可用 `onMessage` 将它们映射到组件支持的类型。例如下面的服务用 `reasoning` 传思考文字，用 `answer` 传正文，用 `follow-up` 传一个推荐问题。

```ts
import type { ChatServiceConfig } from 'ym-ui-vapor'

const config: ChatServiceConfig = {
  endpoint: '/api/assistant',
  onMessage({ event, data }) {
    if (typeof data !== 'string') return
    if (event === 'reasoning') return { type: 'thinking', data: { text: data } }
    if (event === 'answer') return { type: 'markdown', data }
    if (event === 'follow-up') return { type: 'suggestion', data: [{ title: data }] }
  },
}
```

独立使用 `ChatEngine` 时，可只提供 `onContent` 接收全部内容块，包括转换为 Markdown 的普通文字。两种回调都提供时，引擎使用 `onContent`。仅提供 `onChunk` 的调用仍可消费 Markdown，如果服务返回思考或推荐问题，引擎会报告缺少 `onContent`。调用 `controller.abort()` 可取消请求，失败或取消时 `send` 返回的 Promise 拒绝。

```ts
import { ChatEngine, type ChatStreamContent } from 'ym-ui-vapor'

const engine = new ChatEngine({ endpoint: '/api/chat/sse' })
const controller = new AbortController()
const prompt = '到货后在哪里登记？'
const chunks: ChatStreamContent[] = []
await engine.send({
  prompt, attachments: [], messages: [{ id: 'q1', role: 'user', content: prompt }],
  trigger: 'send', signal: controller.signal,
  onContent(block) { chunks.push(block) },
})
```

组件的自定义 `request` 会收到以下上下文。请求抛错或返回被拒绝的 Promise 时，助手消息进入 `error` 状态，用户可以重新生成。

| 字段 | 说明 |
| --- | --- |
| prompt | 本轮用户输入的文字。仅发送附件时为空字符串。 |
| attachments | 本轮附件列表。本地选择的原始 `File` 保存在每项的 `raw` 字段。 |
| messages | 截至本轮用户消息的历史记录。重新生成时仍以原来的用户消息结尾。 |
| trigger | 发送时为 `send`，重新生成时为 `regenerate`。 |
| signal | 本次请求的 `AbortSignal`。将它传给 `fetch`，或监听 `abort` 来清理定时器、结束数据读取。 |
| onChunk | `(delta: string) => void`，将新增的 Markdown 正文追加到当前回复。 |
| onContent | `(block: ChatStreamContent) => void`，传入一个思考、Markdown 或推荐问题分片，使用与 SSE 相同的合并和展示规则。 |

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
