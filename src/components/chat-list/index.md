---
category: 聊天组件
---

# YmChatList 对话列表

按会话顺序展示消息，可在阅读历史时暂停跟随新回复，并在底部放置发送框。

## 交互示例

<ComponentDemo name="chat-list" />

发送一条消息，排期助手会在本地逐段回复。点击「停止生成」可保留已经收到的文字。回复期间向上滚动可阅读历史，点击「回到底部」可继续查看最新内容。确认清空会同时结束当前模拟回复。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | `readonly ChatMessageData[]` | — | 每个元素用稳定的 `id` 标识一条消息，支持 `v-model:data`。非空时由 `YmChatMessage` 逐条渲染。 |
| layout | `both / single` | `both` | 双侧布局中用户消息靠右，助手和系统消息靠左。单侧布局中所有消息靠左。 |
| reverse | `boolean` | `false` | 默认接收从旧到新的数组。传入从新到旧的数组时设为 `true`，最新消息仍显示在底部。 |
| autoScroll | `boolean` | `true` | 位于底部时跟随消息追加和内容增高。向上翻阅历史会暂停跟随，回到底部后恢复。 |
| defaultScrollTo | `top / bottom` | `bottom` | 初始滚动位置。即使关闭自动跟随，首次显示仍按此项定位。 |
| showScrollButton | `boolean` | `true` | 离开底部时显示「回到底部」按钮。 |
| clearHistory | `boolean` | `true` | 有消息或提供了默认插槽时显示清空入口，点击后需在对话框中确认。使用默认插槽展示空状态时，可按实际记录数设置此项。 |
| suggestionDisabled | `boolean` | `false` | 禁用内置消息中的推荐问题按钮。可绑定到生成状态，在当前回复结束后恢复追问。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制消息间距、字号和内置控件尺寸。用 CSS `height` 设置整个列表的高度。 |

列表的默认高度为 `26rem`。嵌套的 `ConfigProvider` 按项继承配置，列表显式设置的 `size` 优先。`mode` 和 `theme` 控制面板、文字、气泡和操作按钮的配色，`radius` 控制列表边框、气泡、按钮和清空确认框的圆角。确认框外部挂载时也会继承来源位置的配置。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| scroll | `{ e: Event }` | 消息区域滚动时触发，`e.target` 为滚动容器。 |
| update:data | `ChatMessageData[]` | 确认清空后传出空数组，用于同步 `v-model:data`。 |
| clear | `{ e: Event }` | 确认清空后触发，可在此取消当前回复或更新由业务页面管理的历史记录。 |
| source-click | `(href: string, context: ChatMessageSearchContext)` | 用户激活内置消息中的搜索来源链接时触发。`href` 是过滤后的地址，`context` 含来源所属的消息 `message`、原始项 `item`、该项在原数组中的下标 `index` 和原生点击事件 `e`。可用 `e.preventDefault()` 接管跳转。 |
| suggestion-click | `(prompt: string, context: ChatMessageSuggestionContext)` | 用户在内置消息中激活推荐问题时触发。`context.message` 是来源消息，`item` 是推荐项，`index` 是问题在该推荐块原数组中的下标，`e` 是原生点击事件。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | `data` 省略或为空时显示。可放自定义的消息序列或空状态。 |
| footer | 固定在滚动区域下方，可放置 `YmChatSender`。 |
| avatar | 自定义每条消息的头像，接收 `{ item, index }`。 |
| name | 自定义昵称，接收 `{ item, index }`。 |
| datetime | 自定义发送时间，接收 `{ item, index }`。 |
| header | 自定义整行消息头，优先于昵称和时间，接收 `{ item, index }`。 |
| content | 自定义消息正文，优先于消息对象的 `content`，接收 `{ item, index }`。 |
| actionbar | 在消息下方放置业务操作，接收 `{ item, index }`。 |

消息插槽中的 `item` 是当前的 `ChatMessageData`，`index` 是它在传入数组中的下标。启用 `reverse` 后仍可用该下标更新原数组。

## 使用指南

将消息数组与列表双向绑定，确认清空后数组会同步清空。给列表设置高度，消息记录即可在发送框上方独立滚动。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatList, YmChatSender, type ChatMessageData } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const messages = ref<ChatMessageData[]>([
  { id: 'welcome', role: 'assistant', name: '排期助手', content: [
    { type: 'text', data: '今天要查询哪笔收货安排？' },
    { type: 'suggestion', data: [{ title: '查看北门安排', prompt: '今天北门有哪些收货安排？' }] },
  ] },
])
const draft = ref('')
let nextId = 1

function send(text: string) {
  messages.value.push({ id: String(nextId++), role: 'user', name: '我', content: text })
  draft.value = ''
}
</script>

<template>
  <YmChatList v-model:data="messages" style="height: 26rem" @suggestion-click="send">
    <template #footer><YmChatSender v-model="draft" placeholder="输入消息" @send="send" /></template>
  </YmChatList>
</template>
```

接入流式回复时，先追加状态为 `pending` 的助手消息。收到首段文本后设置 `streaming`，后续分段追加到同一条消息，完成后设置 `complete`。将生成状态绑定到发送框的 `loading`，并在 `stop` 回调中终止数据流、保留已有正文并设置 `stop`。清空历史和组件卸载时也应取消进行中的回复。

推荐问题和发送框可共用上例的 `send` 函数。回复过程中在发送入口判断是否已有请求进行中，可避免连续点击发起多轮回复。可在[对话推荐问题](/chat-suggestion/)中体验完整的追问流程。

通过模板引用获得 `ChatListInstance`，调用 `scrollToBottom()` 可立即定位到最新消息，传入 `{ behavior: 'smooth' }` 可平滑滚动。使用单向的 `:data` 时，在 `clear` 回调中更新消息数组。
