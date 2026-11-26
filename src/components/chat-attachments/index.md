---
category: 聊天组件
---

# YmChatAttachments 对话附件

在发送草稿或消息中列出附件，支持查看文件信息、预览图片和移除草稿中的文件。

## 交互示例

<ComponentDemo name="chat-attachments" />

点击「配送日历.png」的缩略图可预览大图，按 Esc 返回。移除示例文件后，可以点击「恢复示例附件」再次体验。

在「发送本地附件」中点击「选择附件」，选中一张图片和一份文档。移除文档后，可以补充文字或直接发送图片。已发送的消息会保留图片，点击缩略图可以再次预览。示例在浏览器内完成整个流程。

在聊天机器人示例的「模拟服务」中选择「附件与回复」，可以体验服务先发来附件，再逐段返回 Markdown 的过程。[聊天机器人示例](/chatbot/)

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| items | `readonly ChatAttachmentItem[]` | 空数组 | 按传入顺序展示附件。支持 `v-model:items`，移除后用新数组同步列表。 |
| removable | `boolean` | `true` | 为每项显示移除按钮。消息中的附件设为 `false`。 |
| imageViewer | `boolean` | `true` | 图片加载成功后允许打开大图预览。关闭后仍展示缩略图。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 调整附件的字号、缩略图及操作控件尺寸。 |

每项必填文件名 `name`。本地文件放入 `raw`，已有图片可传入 `url`。设置 `fileType: 'image'` 可明确标识图片，省略 `fileType` 时按 MIME 类型或文件扩展名识别。用 `type` 表示 MIME 类型，`size` 表示字节数。提供 `description` 时用它替代文件大小。可用 `id` 标识附件，也可沿用参考项目中的 `key` 或 `uid`。

普通文件的 `url` 通过检查后，点击文件名可在新标签页打开。图片缩略图和大图预览使用同一规则，允许 HTTP、HTTPS、站内相对路径、查询串和页内锚点。协议相对地址、含反斜杠或控制字符的地址以及其他协议（包括 `file:`、`data:`、`blob:`）会被过滤。附件仍显示名称和说明，本地选择的图片可以通过原始 `File` 预览。

附件尺寸继承最近的 `ConfigProvider`，组件显式设置的 `size` 优先。嵌套 Provider 按项覆盖配置。`mode` 和 `theme` 控制文件信息、卡片及预览控件的配色，`radius` 控制圆角，设为 `0` 时显示直角。打开大图后继续沿用附件所在位置的配置。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:items | `(items: ChatAttachmentItem[])` | 点击移除时传出剩余附件，可用来更新受控列表。 |
| remove | `(item: ChatAttachmentItem, context: ChatAttachmentRemoveContext)` | 用户请求移除该项。参数包含原始附件、它在数组中的下标 `context.index` 和原生点击事件 `context.e`。 |

## 插槽

无插槽。

## 使用指南

用 `v-model:items` 管理草稿中的附件。将 `removable` 设为 `false` 即可展示只读列表，同时保留图片预览。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatAttachments, type ChatAttachmentItem } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const files = ref<ChatAttachmentItem[]>([
  { id: 'checklist', name: '收货清单.pdf', size: 24576 },
])
</script>

<template>
  <YmChatAttachments v-model:items="files" />
</template>
```

在 `YmChatSender` 上绑定 `v-model:attachments`，初始值设为空数组就能选择本地文件。处理 `send(text, context)` 时，将 `{ type: 'attachment', data: context.attachments }` 加入消息的 `content` 数组。可与 `text` 块组合，也可单独发送。保存消息后将草稿附件设为新的空数组，历史消息会继续显示本次发送的附件。需要跨页面重新载入图片时，为历史附件提供可访问的 `url`。参见[对话发送框](/chat-sender/)和[对话消息](/chat-message/)。
