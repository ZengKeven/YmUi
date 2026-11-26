---
category: 聊天组件
---

# YmChatMarkdown 对话 Markdown

将消息中的 Markdown 渲染为标题、列表、引用、链接和代码块，支持在回复过程中追加内容。

## 交互示例

<ComponentDemo name="chat-markdown" />

编辑「Markdown 源文」可立即查看排版。点击「模拟分段回复」，收货助手会把五个本地片段追加到同一个消息块。留意「对话列表」何时变成链接，以及代码块如何随下一段补全。点击「停止回复」可保留已收到的内容。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `string` | `''` | Markdown 源文。流式更新时传入截至当前已收到的完整字符串。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制正文字号，标题随正文字号缩放。 |

省略 `size` 时继承最近的 `ConfigProvider`，显式设置的尺寸优先。嵌套的 Provider 逐项继承配置。`mode` 和 `theme` 控制文字、链接和代码块的配色，`radius` 控制代码块的圆角，设为 `0` 时呈直角。

## 事件

无自定义事件。

## 插槽

无插槽。

## 使用指南

用 `#` 至 `######` 写标题，`-` 和 `1.` 分别开始无序和有序列表，`>` 开始引用。用三个反引号围起多行代码，其中的换行与缩进会保留。HTML 标签按原文显示。

链接使用 `[文字](地址)`。支持 `https:`、`http:`、`mailto:`、`tel:`、相对路径和页内锚点。其他协议、以 `//` 开头的地址和包含反斜杠的地址会被过滤，只显示链接文字。

```vue
<script setup lang="ts" vapor>
import { YmChatMarkdown } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const source = '## 收货提醒\n\n> 请提前到场登记。\n\n- 送货单\n- 采购单号'
</script>

<template>
  <YmChatMarkdown :content="source" />
</template>
```

在消息气泡内使用时，将 `{ type: 'markdown', data: source }` 放入 `YmChatMessage` 的 `content` 数组。每收到一个片段就追加到同一个块的 `data`，这样跨片段的链接和代码围栏才能在收齐后连起来解析。参见[对话消息](/chat-message/)。
