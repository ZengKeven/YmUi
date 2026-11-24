---
category: 表单组件
---

# YmDatePicker 日期选择器

从弹出的卡片日历选择一个日期，可在选日期时查看农历、放假和调休补班安排。

## 交互示例

<ComponentDemo name="date-picker" />

打开收货日期，面板左上角可以选择月份和年份。右上角的左右箭头用于翻月，中间的圆圈按钮可定位到今天。示例中「休」表示放假，「班」表示调休补班。选择某一天后，面板收起，日期回填到输入框。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string \| null` | — | 选中的本地日期，格式为 `YYYY-MM-DD`，支持 `v-model`。`null` 表示未选择日期。 |
| defaultValue | `string` | — | 非受控模式下的初始日期。未选择日期时，打开面板展示本月。 |
| placeholder | `string` | `请选择日期` | 日期为空时显示的提示文字。 |
| showLunar | `boolean` | `false` | 在公历日号下方显示农历，农历初一显示月名。 |
| showHoliday | `boolean` | `false` | 使用日历内置的中国大陆节假日安排，标记休假和补班日期。假期首日优先显示节名，其他日期按 `showLunar` 设置显示农历。 |
| firstDayOfWeek | `1 / 2 / 3 / 4 / 5 / 6 / 7` | `1` | 每周的第一天，`1` 为周一，`7` 为周日。 |
| disabledDate | `(date: Date) => boolean` | — | 根据本地日期判断是否禁选，返回 `true` 时该日不可选。 |
| disabled | `boolean` | `false` | 禁用选择器。 |
| borderless | `boolean` | `false` | 隐藏日期输入框的边框。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置输入框和日历面板中控件的尺寸。 |
| name | `string` | — | 提交原生表单时使用的字段名。 |
| form | `string` | — | 关联的原生表单 ID。 |
| popupProps | `DatePickerProps['popupProps']` | 默认在输入框左下方展开 | 通过 `placement` 设置浮层位置，通过 `attach` 指定挂载容器。 |

输入框和浮层日历继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。组件显式传入的 `size` 优先。`mode` 和 `theme` 控制背景、文字、边框和选中日期的颜色，`radius` 控制输入框、浮层和日期按钮的圆角。浮层挂载到外部容器时仍随选择器所在处的配置更新。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string` | 选择新日期时同步 `v-model`，格式为 `YYYY-MM-DD`。 |
| change | `value: string` | 用户选择的日期发生变化时触发，传入新日期。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| cell | 自定义日历中的日号，接收 `date`（本地 `Date`）、`value`（`YYYY-MM-DD`）、`selected`（已选中）、`today`（今天）和 `inMonth`（属于当前展示月）。农历或节名显示在自定义内容下方。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmDatePicker } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const deliveryDate = ref<string | null>(null)
</script>

<template>
  <YmDatePicker v-model="deliveryDate" aria-label="收货日期" show-lunar show-holiday />
</template>
```

输入框获得焦点后，按 Enter、空格或下方向键打开日历。用方向键移动到日期，再按 Enter 或空格确认。再次确认已选日期也会收起面板。按 Esc 可取消本次浏览。
