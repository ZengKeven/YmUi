---
category: 导航组件
---

# YmTree 树形控件

按层级浏览和过滤分类，点击任意层级的节点即可高亮该分类，并用其标识查询关联数据。

## 交互示例

<ComponentDemo name="tree" />

点击「新鲜水果」，右侧会列出这个分类及其下级分类的商品。点击箭头可展开下一级；输入「柑橘」可直达匹配的分类，商品列表在切换分类时更新。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | `readonly TreeNode[]` | `[]` | 按展示顺序排列的根节点。 |
| modelValue | `TreeValue \| null` | — | 当前高亮节点的标识，支持 `v-model`。传入 `null` 清除高亮。 |
| defaultValue | `TreeValue \| null` | 无高亮 | 非受控模式下的初始高亮节点。 |
| defaultExpanded | `readonly TreeValue[]` | `[]` | 初始展开的分支标识。有初始高亮节点时，其祖先也会展开。 |
| filterable | `boolean` | `true` | 在树上方显示过滤框，按 `label` 匹配，忽略字母大小写和关键词首尾空白。 |
| filterPlaceholder | `string` | `过滤节点` | 过滤框为空时显示的提示。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置节点行高、字号和过滤框尺寸。 |

每个 `TreeNode` 使用 `label` 显示分类名称，使用 `value` 唯一标识节点。值为字符串或数字（`TreeValue`），在整棵树中须唯一。`children` 为可选的子节点数组，可继续嵌套。过滤时会保留匹配节点及其祖先路径，清空关键词后恢复原有展开状态。

组件继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。组件显式传入的 `size` 优先。`mode` 决定浅色、深色或跟随系统显示，`theme` 控制文字、背景及节点高亮色，`radius` 控制节点行和过滤框的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: TreeValue` | 用户激活另一节点时同步高亮标识。 |
| change | `value: TreeValue, node: TreeNode` | 用户切换高亮节点时触发一次。可用第一个参数作分类查询条件，用第二个参数读取分类名称。 |

## 插槽

无插槽。

## 使用指南

父分类和末级分类都可以高亮。商品列表可监听 `@change`，用分类的 `value` 重新查询；过滤、展开、收起或重复点击当前分类时，商品列表会保持当前结果。使用键盘时，方向键用于浏览和展开，Enter 或空格用于激活焦点所在的节点。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmTree, type TreeNode, type TreeValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const category = ref<TreeValue | null>(null)
const categories: TreeNode[] = [
  { value: 'fruit', label: '水果', children: [
    { value: 'citrus', label: '柑橘类' },
    { value: 'berries', label: '浆果类' },
  ] },
]
</script>

<template>
  <YmTree v-model="category" :data="categories" :default-expanded="['fruit']" />
</template>
```
