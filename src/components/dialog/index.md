---
category: 反馈组件
---

# YmDialog 对话框

用简短的确认框询问用户是否继续，或把表单放入正文，让用户在当前页面完成编辑和保存。

## 交互示例

<ComponentDemo name="dialog" />

「确认到货」演示简单确认。「编辑收货信息」会先校验收货人，再模拟异步保存。开启「模拟下次保存失败」可以体验保留表单并重试。表单里的「套用备注模板」会打开子对话框。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | — | 控制显示状态，支持 `v-model:visible`。 |
| defaultVisible | `boolean` | `false` | 使用组件内部状态时，设置是否初始显示。 |
| header | `string` | — | 面板标题，可通过标题插槽自定义。 |
| body | `string` | — | 简单确认框的正文。表单或富文本可放入默认插槽。 |
| width | `number \| string` | `480` | 面板宽度。数字按像素计算，也可传入 CSS 长度。窄屏下按可用空间收缩。 |
| placement | `center / top` | `center` | 在视口居中或靠上显示。 |
| top | `number \| string` | — | 指定面板距视口顶部的距离，优先于 `placement`。数字按像素计算。 |
| attach | `string \| HTMLElement \| function` | `body` | 可传选择器、元素，或接收来源元素并返回目标元素或选择器的函数。面板按视口定位。子框打开时更换父框挂载点，支持原子 DOM 移动的浏览器立即迁移，其他浏览器在子框关闭后迁移。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置字号、面板内边距和操作按钮尺寸。 |
| confirmBtn | `boolean \| string` | `true` | 默认显示「确定」。传入字符串可改文案，传入 `false` 可隐藏。 |
| cancelBtn | `boolean \| string` | `true` | 默认显示「取消」。传入字符串可改文案，传入 `false` 可隐藏。 |
| closeBtn | `boolean` | `true` | 显示右上角关闭按钮，同时启用 Esc 关闭。 |
| closeOnOverlayClick | `boolean` | `false` | 开启后，点击遮罩也会进入取消流程。 |
| onConfirm | `DialogActionHandler` | — | 确认回调，可返回 Promise。通过 `@confirm="save"` 或 `:on-confirm="save"` 传入。 |
| onCancel | `DialogActionHandler` | — | 取消、右上角关闭、Esc 或允许的遮罩点击共用此回调。可等待异步操作后关闭。 |

对话框继承声明位置最近的 `ConfigProvider`，即使挂载到其他元素也会跟随来源配置更新。嵌套 Provider 逐项覆盖。局部 `size` 优先；全局 `mode` 和 `theme` 控制面板、文字、边框和按钮配色，`radius` 控制面板和按钮圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| confirm | `{ trigger: 'confirm', e }` | 点击确认按钮或使用回车快捷键时调用。处理函数的返回值决定是否关闭。 |
| cancel | `{ trigger, e }` | 请求取消时调用。`trigger` 为 `cancel`、`close-btn`、`esc` 或 `overlay`。 |
| close | `{ trigger, e }` | 确认或取消操作完成，并请求关闭时触发。 |
| update:visible | `boolean` | 请求关闭时传出 `false`，用于同步可见状态。 |
| action-error | `{ action, error }` | 确认或取消回调抛出异常，或返回的 Promise 被拒绝。`action` 为 `confirm` 或 `cancel`，可用 `error` 展示业务提示。 |

确认和取消都等待回调完成。返回 `false`、兑现为 `false` 或抛出错误时，对话框继续显示并保留输入内容。其他成功结果允许关闭。等待期间会阻止重复确认或取消。

## 插槽

| 名称 | 说明 |
| --- | --- |
| header | 自定义标题，优先于 `header` 属性。 |
| default | 填写正文、表单或子对话框，优先于 `#body` 和 `body` 属性。 |
| body | 自定义正文，优先于 `body` 属性。 |
| footer | 替换默认操作栏。提供 `{ confirm, cancel, pending }`，可将两个方法直接绑定到自定义按钮的点击事件。在自定义确认按钮上添加 `data-dialog-confirm` 可启用面板的回车快捷键。`pending` 为 `'confirm'`、`'cancel'` 或 `null`。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmButton, YmDialog } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const visible = ref(false)
const received = ref(false)
function markReceived() { received.value = true }
</script>

<template>
  <YmButton :disabled="received" @click="visible = true">{{ received ? '已到货' : '确认到货' }}</YmButton>
  <YmDialog v-model:visible="visible" header="确认到货" body="货物是否已送达仓库？"
    confirm-btn="标记到货" @confirm="markReceived" />
</template>
```

保存表单时，把返回 Promise 的函数直接传给 `@confirm`。例如，先用 `YmForm.validate()` 检查字段，再等待业务接口。请求失败时可通过 `@action-error` 显示原因，用户可继续修改并重试。

```ts
async function save() {
  if (await form.value?.validate() !== true) return false
  await saveOrder(draft)
}
```

打开子对话框时，为父、子框各绑定一个可见状态。Enter 和 Esc 由最上层对话框处理，子框关闭后焦点回到打开它的控件。单行输入框内按 Enter 可确认，文本域保留换行，输入法选字和下拉选项的键盘操作也可正常使用。
