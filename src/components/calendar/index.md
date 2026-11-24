---
category: 表单组件
---

# YmCalendar 日历

按月浏览并选择日期。卡片模式适合嵌入日期选择器的浮层，完整模式适合在页面中展示。

## 交互示例

<ComponentDemo name="calendar" />

开启「显示节假日」，切换到 2026 年 10 月，可查看国庆假期和调休补班的标记。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string \| null` | — | 选中的本地日期，格式为 `YYYY-MM-DD`，支持 `v-model`。传入 `null` 可清空选择。 |
| defaultValue | `string` | — | 非受控模式下的初始选中日期。未提供初始日期时，面板展示本月，等待用户选择。 |
| theme | `full / card` | `full` | `full` 铺满容器宽度，`card` 展示紧凑的日历卡片。两种样式均固定显示六周。 |
| showLunar | `boolean` | `false` | 在完整和卡片模式的公历日期下方显示农历。每月初一显示月名（如「正月」「闰六月」），其余日期显示日名（如「初二」）。 |
| showHoliday | `boolean` | `false` | 在日期格右上角标记放假日「休」和补班日「班」。「班」使用橙色，悬停提示为「补班」。每段假期的第一天在日期下方显示节假日名称。 |
| firstDayOfWeek | `1 / 2 / 3 / 4 / 5 / 6 / 7` | `1` | 每周的第一天，`1` 为周一，`7` 为周日。 |
| disabledDate | `(date: Date) => boolean` | — | 按本地日期判断能否选择，返回 `true` 表示禁选该日。 |
| disabled | `boolean` | `false` | 禁用日期选择与月份导航。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 调整日期格和导航控件的尺寸与字号。 |

日历继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。组件的 `size` 优先于全局尺寸。`ConfigProvider` 的 `mode` 和 `theme` 控制面板的背景、文字、边框和选中日期的强调色，`radius` 控制面板和日期按钮的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string` | 选择新日期时同步 `v-model`，格式为 `YYYY-MM-DD`。 |
| change | `value: string` | 用户选择的日期发生变化时触发，传入新日期。 |
| select | `value: string` | 每次点击可选日期或用键盘确认时触发，包括再次确认已选日期。日期选择器可监听此事件关闭浮层。 |
| monthChange | `month: string` | 展示月份变化时触发，格式为 `YYYY-MM`。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| cell | 替换日期按钮中的日号。接收 `date`（本地 `Date`）、`value`（`YYYY-MM-DD`）、`selected`（已选中）、`today`（今天）和 `inMonth`（属于当前展示月）。节假日名称或农历显示在插槽内容下方，「休」「班」角标显示在右上角。 |

## 使用指南

使用 `v-model` 将卡片日历绑定到表单日期。卡片左上角可选择月份和年份。右侧的左右箭头用于翻月，中间的圆圈按钮可返回今天所在的月份。选择相邻月份的日期时，面板也会切换到该月。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmCalendar } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const deliveryDate = ref<string | null>(null)
</script>

<template>
  <YmCalendar v-model="deliveryDate" theme="card" show-lunar show-holiday />
</template>
```

`showHoliday` 和 `showLunar` 可分别开启。同时开启时，假期首日优先显示节假日名称，其他日期继续显示农历。

组件内置 2025 至 2027 年中国大陆的放假调休安排，按国务院办公厅年度通知整理。`src/components/calendar/holidays/` 下每年一个文件，各节假日名称对应按时间排列的放假日期数组，「补班」对应调休上班日期数组，日期格式均为 `YYYY-MM-DD`。

焦点在日期上时，左右方向键按天移动，上下方向键按周移动。Home 和 End 定位到该周的首日和末日，Page Up 和 Page Down 按月移动。按 Enter 或空格选中焦点所在的日期。
