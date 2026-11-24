---
category: 表单组件
---

# YmSelect 选择器

从下拉列表中选择一项或多项，选项较多时可输入关键词过滤，或通过远程接口搜索。

## 交互示例

<ComponentDemo name="select" />

单选时，已选项的文字以主题色加粗显示。选择「多选」后，每个选项左侧会显示复选框。点击复选框或选项文字都可以切换选中状态。达到数量上限后，仍可取消已选项。切换到「远程搜索」，输入仓库代码 `HGH` 可以找到杭州仓。示例用异步函数模拟查询。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| options | `readonly SelectOption[]` | `[]` | 选项列表，每项包含唯一的 `value` 和显示文本 `label`，可用 `disabled` 禁选某项。 |
| modelValue | `SelectValue` | — | 当前选中值，支持 `v-model`。单选使用字符串或数字，多选使用值数组。 |
| defaultValue | `SelectValue` | 单选为空，多选为空数组 | 省略 `modelValue` 时的初始值。 |
| multiple | `boolean` | `false` | 开启多选，每个已选项在输入框内显示为一个直角 `YmTag` 标签。点击标签的移除按钮可取消选择，禁用项会保留。 |
| max | `number` | `0` | 多选数量上限，`0` 表示不限。达到上限后可以移除已选项，再选其他项。 |
| placeholder | `string` | `请选择` | 空值时的提示文字。 |
| filterable | `boolean` | `false` | 启用本地搜索，按 `label` 进行忽略大小写的包含匹配。 |
| filter | `(query, option) => boolean` | — | 自定义本地过滤函数，返回 `true` 的选项会保留。传入后即可输入搜索词。 |
| remoteMethod | `(query, signal) => readonly SelectOption[] \| Promise<readonly SelectOption[]>` | — | 打开列表或修改搜索词时调用。组件直接展示最新一次查询的结果。 |
| disabled | `boolean` | `false` | 禁用整个选择器。 |
| name | `string` | — | 原生表单提交选项的 `value`。多选时每个已选值占一个同名字段。 |
| form | `string` | — | 关联的原生表单 ID。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置输入框、选项行及文字的尺寸。 |

`SelectOption.value` 可以是字符串或数字，数字 `0` 是有效的选项值。可在选项对象上添加仓库代码等业务字段，供过滤函数和选项插槽读取。使用 `v-model` 时，可以用 `null` 清空单选，用 `[]` 清空多选。

输入框、多选标签和下拉面板继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。选择器显式传入的 `size` 优先。`mode` 和 `theme` 控制背景、文字、边框与选中项强调色。`radius` 控制输入框、面板及标签移除按钮的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: SelectValue` | 用户选择或移除选项时，同步新的选中值。 |
| change | `value: SelectValue` | 用户改变选择时触发，单选传出一个值，多选传出值数组。 |
| search | `query: string` | 用户输入搜索词时触发。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| option | 自定义下拉选项内容，默认显示 `option.label`。参数为 `{ option, index, selected, disabled }`，分别表示选项对象、显示列表中的索引、选中状态和当前禁用状态。 |

## 使用指南

以下示例最多可以选两个仓库。使用方向键定位选项，按 Enter 选择，按 Esc 关闭列表。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmSelect, type SelectValue } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const selected = ref<SelectValue>([])
const warehouses = [
  { value: 1, label: '上海仓', code: 'SHA' },
  { value: 2, label: '杭州仓', code: 'HGH' },
  { value: 3, label: '成都仓', code: 'CTU' },
]
</script>

<template>
  <YmSelect v-model="selected" :options="warehouses" multiple :max="2" filterable aria-label="配送仓库">
    <template #option="{ option }">{{ option.label }}（{{ option.code }}）</template>
  </YmSelect>
</template>
```

接入远程接口时，将查询函数传给 `remoteMethod`，并把组件提供的 `signal` 传给 `fetch`。这里假设接口直接返回包含 `label`、`value` 的选项数组。打开列表时搜索词为空字符串，可由接口返回首批选项。

```vue
<script setup lang="ts" vapor>
import { YmSelect, type SelectOption } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

async function searchWarehouses(query: string, signal: AbortSignal): Promise<SelectOption[]> {
  const params = new URLSearchParams({ q: query })
  const response = await fetch('/api/warehouses?' + params, { signal })
  if (!response.ok) throw new Error('仓库查询失败')
  return response.json()
}
</script>

<template>
  <YmSelect :remote-method="searchWarehouses" aria-label="配送仓库" placeholder="搜索仓库" />
</template>
```
