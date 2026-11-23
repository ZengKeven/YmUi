---
category: 表单组件
---

# YmTreeSelect 树选择器

从树形数据中选择一项或多项，支持按名称过滤和逐层禁选。

## 交互示例

<ComponentDemo name="tree-select" />

示例默认禁选区域和城市。展开「华东区」和「上海市」即可选择「浦东仓」，也可以直接输入「浦东」查找。取消「禁选第二级（城市）」后可同时选择城市和仓库。「虹桥仓」由节点自身设为禁用。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | `readonly TreeSelectOption[]` | `[]` | 树节点列表，子节点放在各自的 `children` 中。 |
| modelValue | `TreeSelectValue` | — | 当前选中值，支持 `v-model`。单选使用节点值或 `null`，多选使用值数组。 |
| defaultValue | 同 `modelValue` | 空选择 | 未绑定 `modelValue` 时的初始选中值。 |
| multiple | `boolean` | `false` | 允许多选。各节点独立勾选，已选项以标签显示。 |
| filterable | `boolean` | `false` | 在本地按节点名称过滤，显示匹配项及其祖先路径。清空搜索词后恢复原来的展开状态。 |
| disabledLevels | `readonly number[]` | `[]` | 指定要禁选的层级，根节点为第 1 层。例如 `[1, 2]` 禁选前两层，第 3 层及更深节点仍可选择。 |
| disabled | `boolean` | `false` | 禁用整个选择器。 |
| placeholder | `string` | `请选择` | 空值时的提示文字。 |
| name | `string` | — | 原生表单字段名，多选时每个已选值作为同名字段提交。 |
| form | `string` | — | 关联的原生表单 ID。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置输入框、标签、树节点行高与字号。 |

每个 `TreeSelectOption` 包含整棵树中唯一的 `value`（字符串或数字）和显示名称 `label`，可选的 `children` 存放下一级节点。节点的 `disabled: true` 仅禁选该节点，仍可展开并访问子节点。节点所属层级被禁选时，该层所有节点都不可选。

组件继承最近的 `ConfigProvider`，嵌套时逐项覆盖。组件显式传入的 `size` 优先。`mode` 和 `theme` 控制输入框、标签和树面板的背景、文字、边框及选中色。`radius` 控制输入框和树面板的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: TreeSelectValue` | 用户选择或取消节点时同步新的选中值。 |
| change | `value: TreeSelectValue` | 用户更改选择时触发。单选返回节点值，多选返回已选节点值数组。 |
| search | `query: string` | 用户输入过滤词时触发。 |

## 插槽

无自定义插槽。

## 使用指南

以下示例只允许选择仓库。上下方向键可在可见节点之间移动，左右方向键可展开或收起分支，按 Enter 选择当前节点，按 Esc 关闭面板。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmTreeSelect } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const selected = ref<string[]>([])
const warehouses = [
  { value: 'east', label: '华东区', children: [
    { value: 'sh', label: '上海市', children: [
      { value: 'pudong', label: '浦东仓' },
      { value: 'hongqiao', label: '虹桥仓', disabled: true },
    ] },
  ] },
]
</script>

<template>
  <YmTreeSelect v-model="selected" :options="warehouses" :disabled-levels="[1, 2]"
    multiple filterable aria-label="仓库范围" />
</template>
```
