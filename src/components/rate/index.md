---
category: 表单组件
---

# YmRate 评分

点击星星给出评分。开启半星后，点击第四颗星的左半侧可选 3.5 分，点击右半侧可选 4 分。

## 交互示例

<ComponentDemo name="rate" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `number` | — | 当前分数，支持 `v-model`，优先于 `value`。 |
| value | `number` | — | 由外部控制的分数，可通过 `change` 更新。 |
| defaultValue | `number` | `0` | 非受控模式的初始分数，`0` 表示未评分。 |
| count | `number` | `5` | 星星总数，也是最高分。 |
| allowHalf | `boolean` | `false` | 允许以半星为单位评分。每颗星的中点计入右半侧。 |
| clearable | `boolean` | `false` | 再次点击当前分数时清零，也适用于半星。 |
| disabled | `boolean` | `false` | 禁用鼠标预览、选择和键盘操作。 |
| showText | `boolean` | `false` | 在星星旁显示预览或选中分数的评语，零分时留空。 |
| texts | `readonly string[]` | 极差、失望、一般、满意、惊喜 | 每颗星对应一条评语。半星向上取整匹配评语，例如 3.5 分显示第四条。缺少对应评语时显示分数。 |
| color | `string / [string, string]` | 调色板的 `warning` 和 `border` | 单个颜色设置选中部分的颜色。传入一对颜色可依次设置选中和未选中部分。 |
| size | `string / number` | 继承全局尺寸，初始为 `medium` | 支持四档预设尺寸、CSS 长度和像素数值。默认中号的星星为 24px。 |
| gap | `number` | `4` | 相邻星星之间的距离，单位为 px。 |

评分继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。`size` 支持 `extra-small`、`small`、`medium` 和 `large`。组件显式设置的 `size` 和 `color` 优先。全局 `mode` 切换浅色、深色或跟随系统的配色，`theme` 提供星星、评语和焦点轮廓的颜色。`radius` 控制键盘焦点轮廓的圆角，设为 `0` 时显示直角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: number` | 用户提交新分数时同步绑定值。 |
| change | `value: number` | 点击或使用键盘改变分数时触发，清除时传入 `0`。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| icon | 自定义评分图标，接收 `{ index, size, color }`。序号从 1 开始，`size` 为 CSS 长度，`color` 为当前图层的颜色。组件通过裁切选中图层显示半星。 |

## 使用指南

鼠标移到星星上可预览评分，点击后提交。按 Tab 聚焦评分，使用方向键增减分数，开启半星时每次调整 0.5 分。Home 清零，End 选满分。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmRate } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const score = ref(3.5)
</script>

<template>
  <YmRate v-model="score" allow-half show-text aria-label="服务评分" />
</template>
```
