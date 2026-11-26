---
category: 聊天组件
---

# YmChatThinking 对话思考

在回复前展示可展开的进度记录，例如已核对的单据和正在查询的库区。

## 交互示例

<ComponentDemo name="chat-thinking" />

点击面板标题可收起或展开过程文字。点击「模拟思考与回复」，收货助手会先逐段显示两条核对记录，再在同一条消息下方输出 Markdown 标题和清单。收起过程面板后仍可阅读回复。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `ChatThinkingData` | — | `{ title?: string; text?: string }`。`title` 可替换状态标题，`text` 保留原文中的换行。 |
| status | `pending / streaming / complete` | `pending` | 等待首段和逐段接收时显示「思考中」，完成时显示「思考完成」。 |
| collapsed | `boolean` | 由组件维护 | `true` 表示收起。传入后可用 `v-model:collapsed` 接收切换。 |
| defaultCollapsed | `boolean` | `false` | 未绑定 `collapsed` 时的初始收起状态。更新文字或完成思考后保留当前展开选择。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 调整标题按钮和过程文字的尺寸。 |

省略 `size` 时继承最近的 `ConfigProvider`，组件显式设置的尺寸优先。嵌套 Provider 逐项继承配置。`mode` 和 `theme` 控制文字和状态图标的颜色，`radius` 控制面板圆角，为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:collapsed | `(collapsed: boolean)` | 用户切换展开状态时触发，可用于双向绑定。 |
| collapsed-change | `(collapsed: boolean)` | 用户请求收起时传出 `true`，请求展开时传出 `false`。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| content | 自定义展开后的正文，优先于默认插槽和 `content.text`。 |
| default | 提供展开后的正文，优先于 `content.text`。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatThinking } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const collapsed = ref(false)
const progress = { text: '已核对送货单。\n已确认三号库的预约时间。' }
</script>

<template>
  <YmChatThinking v-model:collapsed="collapsed" status="complete" :content="progress" />
</template>
```

在 `YmChatMessage` 中，将 `{ type: 'thinking', status: 'streaming', data: { text: '' } }` 加入 `content`。每次收到进度片段时追加到这一个块的 `data.text`。思考结束时将块的 `status` 设为 `complete`，然后在它后面追加 `markdown` 块。整条消息可继续处于 `streaming`，直到回复输出完毕。参见[对话消息](/chat-message/)。
