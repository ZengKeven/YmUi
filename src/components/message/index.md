---
category: 反馈组件
---

# YmMessage 全局提示

用简短消息反馈保存结果、错误或任务进度。在事件处理函数中调用 `Message.info('请先选择仓库')` 即可弹出提示，也可以在模板中使用 `YmMessage`。

## 交互示例

<ComponentDemo name="message" />

点击「弹出全局提示」查看当前配置在页面中的效果，连续点击可以观察多条消息如何排列。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `string` | — | 提示正文，默认插槽优先。 |
| theme | `info / success / warning / error / question / loading` | `info` | 设置消息类型和对应的状态图标。 |
| duration | `number` | `3000` | 自动关闭前等待的毫秒数。设置为 `0` 时持续显示。 |
| closeBtn | `boolean \| string` | `false` | 传入 `true` 显示关闭图标，传入字符串可指定按钮文字。 |
| icon | `boolean` | `true` | 显示类型图标，可通过 `#icon` 自定义。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制提示的字号、间距与关闭按钮尺寸。 |

命令式调用接受上述属性，还可以在 `MessageOptions` 中设置以下选项。

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| placement | `MessagePlacement` | `top` | 支持 `top / bottom / left / right / center` 及四角 `top-left / top-right / bottom-left / bottom-right`。同一位置的新消息依次追加。 |
| source | `HTMLElement` | 自动查找配置来源 | 指定从哪个元素继承主题。异步回调或页面有多个独立的配置区域时，可传入发起操作的元素。 |
| onClose | `(context: MessageCloseContext) => void` | — | 消息关闭时接收关闭原因。 |
| onCloseBtnClick | `(context: { e: MouseEvent }) => void` | — | 用户点击关闭按钮时调用。 |
| onDurationEnd | `() => void` | — | 自动关闭计时结束时调用。 |

内联组件继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。命令式提示挂载在 `body`，沿用来源元素的配置并随之更新。省略 `source` 时优先使用当前焦点所在的 Provider，其次使用页面中唯一的顶层 Provider，无法确定时使用页面默认样式。`size` 可在单条消息上覆盖。全局 `mode` 和 `theme` 决定表面、文字和状态图标配色，`radius` 控制消息面板圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| close | `{ trigger, e? }` | 消息关闭时触发。`trigger` 为 `close-click`（点击关闭）或 `duration-end`（超时）。命令式关闭会向回调传入 `api`。 |
| close-btn-click | `{ e: MouseEvent }` | 用户点击关闭按钮时触发。 |
| duration-end | — | 自动关闭计时结束时触发。 |

鼠标悬停或键盘焦点停留在消息内时暂停计时。指针和焦点都离开后，从完整的 `duration` 重新计时。

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 自定义正文，优先于 `content` 属性。 |
| icon | 替换前置状态图标，在 `icon` 为 `true` 时显示。 |
| closeBtn | 自定义关闭按钮内容。提供插槽时会显示关闭按钮。仅使用图标时，请为图标提供可访问名称。 |

## 使用指南

六个快捷方法 `Message.info`、`Message.success`、`Message.warning`、`Message.error`、`Message.question` 和 `Message.loading` 均接受消息文字或选项对象。第二个参数可指定显示时长，例如 `Message.success('采购单已保存', 2000)`。

```vue
<script setup lang="ts" vapor>
import { Message, YmButton, YmMessage } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmMessage content="单价已含税。" :duration="0" />
  <YmButton @click="Message.info('请先选择仓库')">查看提示</YmButton>
</template>
```

需要自行关闭时，保存调用返回的句柄。可用 `Message.closeAll()` 一次关闭所有命令式提示。

```ts
import { Message } from 'ym-ui-vapor'

async function withLoading(task: () => Promise<void>) {
  const message = Message.open({ theme: 'loading', content: '正在导出清单…', duration: 0 })
  try {
    await task()
  } finally {
    message.close()
  }
}
```
