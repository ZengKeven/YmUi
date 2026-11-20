---
category: 基础组件
---

# YmSpace 间距

为一组相邻元素设置统一间距，可横向或纵向排列，也可分别指定换行后的行距与列距。

## 交互示例

<ComponentDemo name="space" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| direction | `horizontal / vertical` | `horizontal` | 子项沿水平方向或垂直方向排列。 |
| size | `SpaceSize / [SpaceSize, SpaceSize]` | 继承全局尺寸，初始为 `medium` | `extra-small`、`small`、`medium`、`large` 依次对应 4、8、16、24px。也可传像素数值、CSS 长度或 `[行间距, 列间距]`。 |
| align | `start / center / end / baseline` | — | 沿交叉轴对齐子项，省略时使用 Flex 默认的拉伸对齐。 |
| breakLine | `boolean` | `false` | 横向排列时，容器宽度不足便换行。 |
| separator | `string` | — | 相邻子项之间的分隔文本。 |

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 需要排列的子项，可传入文字、元素或组件。 |
| separator | 在相邻子项之间插入自定义内容，优先于 `separator` 属性。 |

## 使用指南

将一组按钮放入默认插槽，使用 `size="small"` 保留 8px 的操作间距。

```vue
<script setup lang="ts" vapor>
import { YmButton, YmSpace } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmSpace size="small">
    <YmButton>保存</YmButton>
    <YmButton theme="default">取消</YmButton>
  </YmSpace>
</template>
```
