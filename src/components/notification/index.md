---
category: 反馈组件
---

# YmNotification 消息通知

在页面角落告知用户需要留意的业务变化。调用 `Notification.info('收到新订单')` 即可弹出通知，也可以在模板中使用 `YmNotification` 展示带标题、正文和底部操作的卡片。

## 交互示例

<ComponentDemo name="notification" />

修改标题或正文即可预览卡片。点击「弹出通知」会在所选角落显示一条通知，连续点击可查看堆叠效果。示例初始设为常驻，方便调整内容。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `string` | — | 通知标题，可通过 `#title` 自定义。 |
| content | `string` | — | 正文，支持换行，也可通过插槽传入。 |
| footer | `string` | — | 底部补充文字，可通过 `#footer` 放入操作按钮。 |
| theme | `info / success / warning / error` | `info` | 通知类型，对应信息、成功、警告和错误图标。 |
| duration | `number` | `3000` | 自动关闭的等待时间，单位为毫秒。传入 `0` 时持续显示。 |
| icon | `boolean` | `true` | 显示类型图标，支持 `#icon` 自定义。 |
| closeBtn | `boolean \| string` | `true` | 默认显示关闭图标。传入字符串指定按钮文字，传入 `false` 可隐藏按钮。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置卡片字号、内边距和控件尺寸。 |

命令式调用接受上述属性，以及以下 `NotificationOptions` 选项。

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| placement | `top-right / top-left / bottom-right / bottom-left` | `top-right` | 通知出现的角落。同一位置可以堆叠多条通知。 |
| source | `HTMLElement` | 自动确定配置来源 | 指定继承配置的元素。页面有多个配置区域时，可传入触发按钮。 |
| onClose | `(context: NotificationCloseContext) => void` | — | 通知关闭时调用，可通过 `context.trigger` 判断原因。 |
| onCloseBtnClick | `(context: { e: MouseEvent }) => void` | — | 点击关闭按钮时调用。 |
| onDurationEnd | `() => void` | — | 自动关闭计时结束时调用。 |

卡片继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。`size` 控制字号和间距，单条通知的 `size` 优先。全局 `mode` 和 `theme` 决定面板、文字、边框及状态图标的颜色，`radius` 控制卡片圆角。命令式通知挂载在 `body`，随来源元素的配置更新。省略 `source` 时，优先使用焦点所在的 Provider，其次使用页面中唯一的顶层 Provider，无法确定时使用页面默认样式。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| close | `{ trigger, e? }` | 通知关闭时触发。关闭按钮对应 `close-click`，自动关闭对应 `duration-end`，通过命令关闭时回调收到 `api`。 |
| close-btn-click | `{ e: MouseEvent }` | 用户点击关闭按钮时触发。 |
| duration-end | — | 自动关闭计时结束时触发。 |

指针悬停或键盘焦点停留在卡片内时，自动关闭计时会暂停。两者都离开后，按完整的 `duration` 重新计时。

## 插槽

| 名称 | 说明 |
| --- | --- |
| title | 自定义标题，优先于 `title` 属性。 |
| default | 自定义正文，优先于 `#content` 和 `content` 属性。 |
| content | 自定义正文，优先于 `content` 属性。 |
| footer | 自定义底部内容，优先于 `footer` 属性，可放入链接或按钮。 |
| icon | 替换类型图标，`icon` 为 `true` 时显示。 |
| closeBtn | 自定义关闭按钮内容。提供插槽时显示按钮并优先使用插槽内容。仅使用图标时，请提供可访问名称。 |

## 使用指南

`Notification.info`、`Notification.success`、`Notification.warning` 和 `Notification.error` 都接受正文字符串或选项对象。第二个参数可以指定显示时长，例如 `Notification.success('发货单已生成', 2000)`。

```vue
<script setup lang="ts" vapor>
import { Notification, YmButton, YmNotification } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmButton @click="Notification.info('收到新订单')">查看通知</YmButton>
  <YmNotification title="收货预约已确认" :duration="0">
    杭州一号仓已确认预约，请在 14:00 前送达。
    <template #footer>采购单 PO-1024</template>
  </YmNotification>
</template>
```

需要自行决定关闭时机时，可用 `Notification.open` 创建常驻通知，保存返回的句柄。调用 `notice.close()` 关闭这条通知，`Notification.closeAll()` 关闭所有命令式通知。

```ts
const notice = Notification.open({
  theme: 'warning',
  title: '收货预约待确认',
  content: '仓库调整了送达时间，请审核新的预约。',
  duration: 0,
})

// 用户确认预约后关闭
notice.close()
```
