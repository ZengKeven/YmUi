---
category: 聊天组件
---

# YmChatSuggestion 对话推荐问题

展示一组可点击的推荐问题，让用户从当前回复继续追问。

## 交互示例

<ComponentDemo name="chat-suggestion" />

在预览中点击问题可查看实际发送的提问。点击「模拟首轮回复」，收货助手会逐段答复，并在回复完成后给出两个推荐问题。选择其中一个，列表会加入一条用户消息和一条逐段更新的助手回复。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `readonly ChatSuggestionItem[]` | `[]` | 按数组顺序展示问题。每项的 `title: string` 是按钮文字，`prompt?: string` 是发送的提问。标题为空或仅有空白时跳过该项。 |
| disabled | `boolean` | `false` | 禁用全部推荐问题。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制问题按钮的高度、字号和间距。 |

省略 `size` 时继承最近的 `ConfigProvider`，显式设置的尺寸优先。嵌套 Provider 逐项继承配置。`mode` 和 `theme` 控制问题按钮的文字、背景和边框颜色，`radius` 控制按钮圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| select | `(prompt: string, context: ChatSuggestionSelectContext)` | 鼠标或键盘激活问题时触发一次。`prompt` 取自该项的发送文本，省略或仅有空白时取标题。`context` 含原始推荐项 `item`、它在传入数组中的下标 `index` 和原生点击事件 `e`。 |

## 插槽

无插槽。

## 使用指南

将 `select` 的第一个参数交给已有的发送函数。下面的组件向外传出 `send` 事件，用户看到简短的标题，发送函数收到完整的提问。

```vue
<script setup lang="ts" vapor>
import { YmChatSuggestion, type ChatSuggestionItem } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const emit = defineEmits<{ send: [prompt: string] }>()
const questions: ChatSuggestionItem[] = [
  { title: '要带哪些单据？', prompt: '办理收货需要携带哪些单据？' },
  { title: '在哪里登记车牌？' },
]
</script>

<template>
  <YmChatSuggestion :content="questions" @select="prompt => emit('send', prompt)" />
</template>
```

在消息正文中加入 `{ type: 'suggestion', data: questions }`，然后监听 `YmChatMessage` 或 `YmChatList` 的 `suggestion-click`。消息进入 `complete` 后才展示推荐问题。如果内容块也传入了 `status`，它也须为 `complete`。收到点击事件后，追加用户消息和等待中的助手消息，即可开始下一轮回复。参见[消息内容块](/chat-message/)和[对话列表](/chat-list/)。
