---
category: 导航组件
---

# YmMenu 导航菜单

在侧栏中混合展示一级入口和带二级节点的菜单组。展开时点击组名可打开二级列表，收起时悬停或聚焦图标即可查看一级名称和可选子项。

## 交互示例

<ComponentDemo name="menu" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| items | `MenuItem[]` | `[]` | 菜单节点，按数组顺序展示。一级节点可通过 `children` 指定一层子项。 |
| collapsed | `boolean` | `false` | 收起时侧栏只显示一级图标。可绑定 `YmLayout` 的 `aside` 插槽提供的 `collapsed`。 |
| modelValue | `MenuValue` | — | 当前选中叶项的标识，支持 `v-model`。 |
| expanded | `MenuValue[]` | `[]` | 展开模式下已打开的一级菜单组标识，支持 `v-model:expanded`。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置菜单项尺寸。组件显式指定的值优先于 `ConfigProvider.size`。 |

每个节点以 `value`（字符串或数值）在整个菜单中唯一标识，以 `label` 指定显示名称。`icon` 接受 `YmIcon` 的内置图标名，收起后缺少图标的一级节点显示默认菜单图标。叶项可设置 `href` 作为目标链接。带子项的一级节点用于展开和收起。

菜单和浮层使用最近的 `ConfigProvider` 配置。`size` 控制行高与字号，`mode` 切换浅色、深色或跟随系统的配色，`theme` 控制背景、文字和选中状态颜色，`radius` 控制菜单项和浮层圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: MenuValue` | 选择一级或二级叶项时传出该项的标识。 |
| update:expanded | `values: MenuValue[]` | 在展开模式打开或收起菜单组时，传出更新后的组标识列表。 |

## 插槽

无插槽。

## 使用指南

用 `v-model` 读取选中的页面。收起后可将指针从一级图标移入浮层选择子项，也可用 Tab 移动焦点，按 Esc 关闭浮层。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmMenu, type MenuItem, type MenuValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const page = ref<MenuValue>('overview')
const items: MenuItem[] = [
  { value: 'overview', label: '工作台', icon: 'dashboard' },
  {
    value: 'purchase', label: '采购管理', icon: 'purchase',
    children: [{ value: 'orders', label: '采购订单', icon: 'file-text' }],
  },
]
</script>

<template>
  <YmMenu v-model="page" :items="items" />
</template>
```
