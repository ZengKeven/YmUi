---
category: 基础组件
---

# YmDescriptions 描述列表

将字段名称和值成对排列，适合展示采购订单、收货信息等只读详情。

## 交互示例

<ComponentDemo name="descriptions" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| YmDescriptions.column | `number` | `2` | 每行可容纳的描述项数。标签和内容合为一列。 |
| YmDescriptions.size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 设置文字大小和单元格内边距。 |
| YmDescriptionsItem.label | `string` 或 `number` | — | 左侧的字段名称，可通过 `#label` 插槽自定义。 |
| YmDescriptionsItem.content | `string` 或 `number` | — | 右侧的字段值，支持数字 `0`。也可通过插槽传入内容。 |
| YmDescriptionsItem.colSpan | `number` | `1` | 占用的列数。大于父组件的 `column` 时占满一行。 |
| YmDescriptionsItem.rowSpan | `number` | `1` | 占用的行数。标签和内容一起跨行。 |

列数与跨行、跨列数均使用正整数。描述列表继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。局部 `size` 优先于全局尺寸。`mode` 和 `theme` 控制文字、标签底色、内容背景及分隔线的配色。`radius` 控制列表外边框的圆角，设为 `0` 可显示直角。

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| YmDescriptions.default | 按展示顺序放入 `YmDescriptionsItem`。 |
| YmDescriptionsItem.label | 自定义左侧标签，优先于 `label` 属性。 |
| YmDescriptionsItem.default | 自定义右侧内容，可传入文本、链接或其他组件，优先于 `content` 属性。 |
| YmDescriptionsItem.content | 命名内容插槽，同时提供默认插槽时优先显示此插槽。 |

## 使用指南

下例将收货仓库跨两行显示，右侧依次排列交货日期和采购员。最后一项用两列展示收货说明。

```vue
<script setup lang="ts" vapor>
import { YmDescriptions, YmDescriptionsItem } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmDescriptions :column="2">
    <YmDescriptionsItem label="收货仓库" content="杭州一号仓" :row-span="2" />
    <YmDescriptionsItem label="交货日期">
      <time datetime="2026-11-30">2026-11-30</time>
    </YmDescriptionsItem>
    <YmDescriptionsItem label="采购员" content="林悦" />
    <YmDescriptionsItem label="收货说明" :col-span="2">到仓前请电话联系采购员。</YmDescriptionsItem>
  </YmDescriptions>
</template>
```
