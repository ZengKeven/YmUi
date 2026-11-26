---
category: 聊天组件
---

# YmChatSearch 对话搜索

在助手回复中列出搜索来源，读者可以收起列表或打开原文。

## 交互示例

<ComponentDemo name="chat-search" />

点击面板标题可以收起或展开来源列表。使用键盘时，按 Tab 聚焦标题，再按 Enter 或空格切换。预览中的前两项可打开对应的组件文档，第三项的地址被过滤，仍可阅读标题。

点击「模拟搜索与回复」，组件助手先列出两份文档，再在同一条消息中逐段写出 Markdown 标题和列表。再次点击可以从头播放。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `ChatSearchData` | — | `title?: string` 为面板标题，默认显示「搜索结果（N）」，N 为有效项数。`references?: readonly ChatSearchReference[]` 按传入顺序展示来源。 |
| collapsed | `boolean` | 由组件维护 | `true` 表示收起。传入后可用 `v-model:collapsed` 同步状态。 |
| defaultCollapsed | `boolean` | `false` | 未传入 `collapsed` 时的初始收起状态。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 调整面板和来源列表的尺寸。 |

来源项必填 `title`，可传入地址 `url`、站点名 `site`、日期 `date` 和摘要 `content`。标题为空或仅含空白时跳过该项。没有有效项时隐藏整个面板。

省略局部 `size` 时继承最近的 `ConfigProvider`，组件显式设置的尺寸优先。嵌套 Provider 按项继承配置。`mode` 和 `theme` 控制标题、来源链接和面板的配色，`radius` 控制面板圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:collapsed | `(collapsed: boolean)` | 点击面板标题时传出新的收起状态，供双向绑定使用。 |
| collapsed-change | `(collapsed: boolean)` | 请求收起时传出 `true`，请求展开时传出 `false`。 |
| source-click | `(href: string, context: ChatSearchSourceContext)` | 用户激活来源链接时触发。参数包含过滤后的地址、原始来源项 `context.item`、该项在原数组中的下标 `context.index` 及原生点击事件 `context.e`。 |

## 插槽

无插槽。

## 使用指南

来源链接支持 HTTP、HTTPS、站内相对路径、查询串和页内锚点，默认在新标签页打开。以 `//` 开头、含反斜杠或控制字符、使用其他协议的地址都会被过滤。地址缺失或被过滤时，标题仍按文本展示。需要在当前应用中处理跳转时，在 `source-click` 回调里调用 `context.e.preventDefault()`，再使用收到的 `href`。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatSearch } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const collapsed = ref(false)
const sources = {
  title: '参考文档',
  references: [
    { title: '对话消息用法', url: '/chat-message/' },
    { title: 'Markdown 正文用法', url: '/chat-markdown/' },
  ],
}
</script>

<template>
  <YmChatSearch v-model:collapsed="collapsed" :content="sources" />
</template>
```

在消息中使用时，先将 `{ type: 'search', data: sources }` 放入助手消息的 `content` 数组。有可展示的来源就会立即渲染。第一段回复到达后，在同一个数组末尾追加 `markdown` 块，将后续片段依次拼接到它的 `data`。回复结束时把消息的 `status` 设为 `complete`。也可以在消息或列表上监听 `source-click`，通过 `context.message` 识别这组来源所属的消息。参见[对话消息](/chat-message/)和[对话列表](/chat-list/)。
