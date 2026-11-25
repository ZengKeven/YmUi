---
category: 导航组件
---

# YmDropdown 下拉操作菜单

将一组相关操作收进同一个菜单，适用于页签管理、单据操作和账号菜单。

## 交互示例

<ComponentDemo name="dropdown" />

打开「页签操作」可固定采购订单页签，或关闭、恢复其他页签。在右侧切换触发方式，可以试用右键菜单。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | `readonly DropdownOption[]` | `[]` | 按数组顺序展示操作项，每项的字段见下表。 |
| trigger | `hover / click / focus / context-menu` | `hover` | 分别通过悬停、点击、聚焦或右键打开菜单。 |
| placement | `PopupPlacement` | `bottom-left` | 菜单相对触发元素的位置。可设为 `bottom-right` 靠右对齐，或 `top-left` 在上方展开。 |
| attach | `string / HTMLElement / function` | 触发元素所在位置 | 指定浮层挂载位置。可传 CSS 选择器、DOM 元素，或接收触发容器并返回挂载位置的函数。 |
| visible | `boolean` | — | 受控显示状态，支持 `v-model:visible`。 |
| defaultVisible | `boolean` | `false` | 非受控模式下是否初始展开。 |
| disabled | `boolean` | 继承表单，初始为 `false` | 禁用整个菜单。显式设置优先于所在表单的禁用状态。 |
| hideAfterItemClick | `boolean` | `true` | 执行操作后收起菜单。设为 `false` 可连续执行多项操作。 |
| maxHeight | `number` | `300` | 菜单最大高度，单位为像素。超出时可在菜单内滚动。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制菜单项的高度、字号与间距。 |

**DropdownOption 操作项**

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string / number` | 必填 | 操作的唯一标识，业务处理函数可通过它区分操作。 |
| content | `string` | 必填 | 操作名称。可通过 `#option` 自定义展示内容。 |
| prefixIcon | `IconName` | — | 显示在操作名称前的图标。 |
| disabled | `boolean` | `false` | 禁用该项。键盘导航会跳过它。 |
| divider | `boolean` | `false` | 在该项下方显示分隔线。 |
| active | `boolean` | `false` | 高亮该项，由调用方根据业务状态设置。 |
| theme | `default / success / warning / error` | `default` | 设置操作项语义色，例如用 `error` 标记移除操作。 |

菜单继承最近的 `ConfigProvider` 配置，嵌套配置逐项覆盖。局部 `size` 优先于全局尺寸。`mode` 和全局 `theme` 决定面板、文字及操作项的强调色，`radius` 控制面板圆角。通过 `attach` 挂载的菜单仍跟随触发元素所在位置的配置。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| click | `option: DropdownOption, context: { e: MouseEvent }` | 执行可用操作时触发，返回被激活的操作项及点击事件。 |
| update:visible | `visible: boolean` | 请求切换菜单的显示状态时触发，用于 `v-model:visible`。 |
| visible-change | `visible: boolean` | 用户请求展开或收起菜单时触发。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 自定义触发元素，例如 `YmButton`。省略时使用内置的「更多操作」按钮。 |
| option | 自定义操作项内容，接收 `{ option, index }`。`option` 为当前操作项，`index` 为从 0 开始的位置。 |

## 使用指南

聚焦触发按钮后按 ↓ 可进入菜单。用 ↑、↓ 移动，用 Home、End 到达首尾可用项，用 Enter 或空格执行操作。Esc 收起菜单并将焦点交还触发按钮，Tab 继续移出菜单。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmDropdown, type DropdownOption } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const pinned = ref(false)
const options: DropdownOption[] = [
  { value: 'pin', content: '固定页签' },
  { value: 'unpin', content: '取消固定' },
]

function handleAction(option: DropdownOption) {
  pinned.value = option.value === 'pin'
}
</script>

<template>
  <span>采购订单{{ pinned ? '（已固定）' : '' }}</span>
  <YmDropdown trigger="click" :options="options" @click="handleAction" />
</template>
```
