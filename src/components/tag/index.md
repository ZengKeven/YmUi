---
category: 基础组件
---

# YmTag 标签

用标签标记状态、分类或已选项。开启关闭按钮后，用户可以逐项移除标签。

## 交互示例

<ComponentDemo name="tag" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| content | `string` | — | 标签文字，也可通过默认插槽传入。 |
| theme | `default / primary / success / warning / danger` | `default` | 从当前调色板中选择标签的语义色。 |
| variant | `dark / light / outline / light-outline` | `dark` | 依次为实心、浅底、描边和带浅底的描边样式。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 控制标签的高度、间距和字号。 |
| closable | `boolean` | `false` | 在标签末尾显示关闭按钮。 |
| closeLabel | `string` | 「移除」加标签正文 | 自定义关闭按钮的无障碍名称，例如「移除 上海仓」。 |
| disabled | `boolean` | `false` | 显示禁用状态，关闭按钮也随之禁用。 |

标签继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。组件显式传入的 `size` 优先。全局 `mode` 选择浅色或深色调色板，`theme` 提供背景、文字和边框使用的颜色，`radius` 控制标签圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| close | `event: MouseEvent` | 点击关闭按钮或用键盘激活时触发一次，由调用方更新显示状态或移除列表项。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 自定义标签正文，优先于 `content`。 |
| icon | 标签正文前的图标，可放入 `YmIcon`。 |

## 使用指南

给列表中的每个标签绑定唯一的 `key`，在 `close` 事件中更新列表。`YmSelect` 在多选时也会将已选项显示为可关闭标签。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmTag } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const warehouses = ref(['上海仓', '杭州仓'])

function remove(warehouse: string) {
  warehouses.value = warehouses.value.filter(item => item !== warehouse)
}
</script>

<template>
  <YmTag v-for="warehouse in warehouses" :key="warehouse" theme="primary" variant="light"
    closable :close-label="`移除 ${warehouse}`" @close="remove(warehouse)">
    {{ warehouse }}
  </YmTag>
</template>
```
