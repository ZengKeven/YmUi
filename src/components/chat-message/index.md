---
category: 聊天组件
---

# YmChatMessage 对话消息

展示单条对话的发送者、时间、思考过程和回复正文，并随回复进度显示加载或错误提示。

## 交互示例

<ComponentDemo name="chat-message" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| message | `ChatMessageData` | — | 整条消息。包含稳定的字符串 `id`，以及可选的 `role`、`status`、`content`、`avatar`、`name` 和 `datetime`。单独传入的同名属性优先。 |
| content | `string \| readonly ChatMessageContent[]` | — | 字符串按纯文本显示。数组按顺序展示内容块。`text` 块保留原文和换行，`markdown` 块渲染 Markdown，`thinking` 块展示可收起的思考过程。 |
| role | `assistant / user / system` | `assistant` | 标识助手、用户或系统消息。 |
| status | `pending / streaming / complete / stop / error` | `complete` | 等待回复或接收中的空消息显示加载指示。消息包含思考块时由它展示进度。完成或停止后保留正文，出错时在正文旁提示「消息出错」。 |
| avatar | `string \| { src: string, alt?: string, fallback?: string }` | — | 头像图片地址，或含替代文本及备用地址的配置。省略时隐藏头像。图片及备用地址均加载失败时显示角色图标。 |
| name | `string` | — | 发送者昵称，显示在正文上方。 |
| datetime | `string` | — | 时间的显示文字，由业务页面格式化，例如「今天 09:30」。 |
| placement | `left / right` | `left` | 消息靠左或靠右排列。 |
| variant | `text / base / outline` | `text` | 依次为文本、填充气泡和描边气泡。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制消息字号、头像尺寸和间距。 |

嵌套的 `ConfigProvider` 按项继承配置。显式设置的 `size` 优先于全局尺寸。`mode` 和 `theme` 决定当前模式下的文字、气泡和状态颜色。`radius` 设置气泡圆角，为 `0` 时呈直角。

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| avatar | 自定义头像，优先于 `avatar` 属性。 |
| header | 自定义整行消息头，优先于昵称和时间的插槽与属性。 |
| name | 自定义昵称，优先于 `name` 属性。 |
| datetime | 自定义时间，优先于 `datetime` 属性。 |
| content | 自定义气泡正文，优先于默认插槽及 `content` 属性。 |
| default | 提供正文，优先于 `content` 属性。 |
| actionbar | 在气泡下方放置操作按钮。参数 `{ copyText, status }` 提供可复制正文和消息当前生效的状态。`copyText` 从 `content` 属性或 `message.content` 提取 `text` 和 `markdown` 块的源文，以换行连接。自定义正文插槽时可将对应的业务文本直接传给操作栏。 |

## 使用指南

列表可用消息的 `id` 作为 `v-for` 的键，把每条消息传入 `message`。渲染单条消息也可以直接传入昵称、时间和正文。

```vue
<script setup lang="ts" vapor>
import { YmChatActionbar, YmChatMessage, type ChatMessageData } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const reply: ChatMessageData = {
  id: 'delivery-1',
  role: 'assistant',
  name: '排期助手',
  datetime: '今天 09:30',
  content: [
    { type: 'thinking', status: 'complete', data: { text: '已核对订单和仓库预约。' } },
    { type: 'text', data: '预计周五到货，签收后会同步入库数量。' },
    { type: 'markdown', data: '## 随车材料\n\n- 送货单\n- 采购单号' },
  ],
}
</script>

<template>
  <YmChatMessage :message="reply" variant="base">
    <template #actionbar="{ copyText, status }">
      <YmChatActionbar :content="copyText" :action-bar="['copy', 'good', 'bad']"
        :disabled="status === 'pending' || status === 'streaming'" />
    </template>
  </YmChatMessage>
</template>
```

`ChatMessageContent` 包含纯文本块 `ChatTextContent`、Markdown 块 `ChatMarkdownContent` 和思考块 `ChatThinkingContent`。思考块的 `data` 接受 `{ title?: string; text?: string }`，其中 `text` 用于累积进度。省略块状态时，思考面板跟随消息的等待或接收状态，展示已完成的历史消息时显示「思考完成」。

同一条消息可以先思考再回复。收到思考结束信号时，将思考块的 `status` 设为 `complete`，然后追加新的 Markdown 块，将后续回复片段累积到该块的 `data`。可在[对话思考](/chat-thinking/)中运行这段模拟流，或在[对话 Markdown](/chat-markdown/)中查看跨片段的链接和代码块如何显示。

需要让用户重新生成当前回复时，在操作栏加入 `replay` 并监听 `actions` 事件。完整示例见[对话操作栏](/chat-actionbar/)。
