---
category: 导航组件
---

# YmPagination 分页

展示记录总数，支持按页码翻页、直达首页或尾页，以及调整每页条数。

## 交互示例

<ComponentDemo name="pagination" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| total | `number` | `0` | 记录总条数，用于计算总页数。 |
| current | `number` | `1` | 从 1 开始的当前页码，支持 `v-model:current`。 |
| pageSize | `number` | `10` | 每页显示的记录数，支持 `v-model:page-size`。 |
| pageSizeOptions | `number[]` | `[5, 10, 20, 50]` | 每页条数下拉框的可选值。 |
| disabled | `boolean` | `false` | 禁用所有翻页按钮和每页条数下拉框。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置分页控件的尺寸。 |

分页默认继承最近的 `ConfigProvider` 配置。全局 `size` 控制按钮和下拉框的高度与字号，组件显式设置的 `size` 优先。`mode` 切换浅色、深色或跟随系统的配色，`theme` 控制文字、背景和当前页的强调色，`radius` 控制按钮和下拉框的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:current | `current: number` | 翻页时同步新页码。每页条数或总条数变化导致当前页越界时，同步纠正后的页码。 |
| update:pageSize | `pageSize: number` | 用户选择新的每页条数时触发。 |
| change | `{ current: number, previous: number, pageSize: number }` | 用户翻页或调整每页条数后触发一次，包含当前页、操作前的页码及新的每页条数。 |

## 插槽

无插槽。

## 使用指南

将页码和每页条数分别双向绑定。可以点击上一页、下一页或数字页码，也可以直接选择首页、尾页。页码较多时用省略号标出中间省略的页码。

调整每页条数会保留当前页。若新总页数小于当前页，分页会切换到新的尾页。例如，137 条记录按每页 10 条展示时，尾页为第 14 页。在尾页改为每页 50 条后，当前页变为第 3 页。总条数为 0 时显示第 1 页，首页、上一页、下一页与尾页按钮均禁用。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmPagination } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const current = ref(1)
const pageSize = ref(10)
</script>

<template>
  <YmPagination v-model:current="current" v-model:page-size="pageSize" :total="137" />
</template>
```
