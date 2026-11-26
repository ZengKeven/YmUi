---
category: 聊天组件
---

# YmChatActionbar 对话操作栏

让用户复制回复、请求重新生成，或用点赞和点踩评价当前答案。

## 交互示例

<ComponentDemo name="chat-actionbar" />

点击「重新生成」，收货助手会清空当前答案和评价，每隔 400 毫秒在原消息内追加一段 Markdown。回复完成后可复制新正文、评价，或再次生成另一份答复。「可用操作」可以切换按钮组合和排列顺序。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `string` | `''` | 点击「复制」时写入剪贴板的文字。内容为空时禁用复制按钮。 |
| actionBar | `readonly ChatActionbarAction[]` | `['replay', 'copy', 'good', 'bad']` | 按数组顺序展示按钮，四个值依次代表重新生成、复制、点赞、点踩。 |
| comment | `'' / good / bad` | `''` | 当前评价。省略时由组件维护，可通过 `v-model:comment` 保存。点赞和点踩互斥，再次点击已选项会取消评价。 |
| disabled | `boolean` | `false` | 禁用操作栏中的所有按钮。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 控制按钮和图标的尺寸。 |

省略 `size` 时继承最近的 `ConfigProvider`，显式设置的尺寸优先。嵌套 Provider 逐项继承配置。`mode` 和 `theme` 作用于图标和评价选中色，`radius` 控制按钮圆角，设为 `0` 时呈直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| actions | `(action: ChatActionbarAction, context: { e: MouseEvent })` | 每次激活可用按钮时触发。复制操作在点击时触发此事件，写入结果由操作栏提示「已复制」或「复制失败，请重试」。 |
| update:comment | `(value: ChatActionbarComment)` | 点赞、点踩或取消评价时触发，取消后的值为 `''`。 |

## 插槽

无插槽。

## 使用指南

在 `YmChatMessage` 的 `actionbar` 插槽内绑定 `copyText`，即可复制当前消息的正文。下面的示例只展示复制和评价按钮。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmChatActionbar, YmChatMessage, type ChatActionbarComment } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const comment = ref<ChatActionbarComment>('')
</script>

<template>
  <YmChatMessage content="请携带送货单到北门登记。">
    <template #actionbar="{ copyText }">
      <YmChatActionbar v-model:comment="comment" :content="copyText" :action-bar="['copy', 'good', 'bad']" />
    </template>
  </YmChatMessage>
</template>
```

需要重新生成时，在 `actionBar` 中保留 `replay`，监听 `actions`。收到 `replay` 后保留消息的 `id`，清空旧正文和评价，将状态设为 `pending`。首段到达后切换到 `streaming` 并累加后续片段，结束后设为 `complete`。页面可用插槽中的 `status` 在等待和生成期间禁用操作栏。参见[对话消息](/chat-message/)。
