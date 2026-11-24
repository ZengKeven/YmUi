---
category: 表单组件
---

# YmColorPicker 颜色选择器

从色板选取颜色、按通道输入精确色值，或编辑带有多个色标的线性渐变。需要始终显示编辑器时，可使用 `YmColorPickerPanel`。

## 交互示例

<ComponentDemo name="color-picker" />

点击色值打开面板。「渐变」模式支持点击渐变轨道添加色标，拖动色标调整位置，选中色标后按 Delete 或 Backspace 删除。至少保留两个色标。「最近使用」中的加号会收藏当前颜色，删除按钮移除当前选中的最近色。

## 属性

以下属性适用于两个入口，表中注明了仅用于弹出选择器的属性。

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string` | — | 当前颜色或 CSS 线性渐变，支持 `v-model`，优先于 `value`。 |
| value | `string` | — | 外部控制的颜色，支持 `v-model:value`。 |
| defaultValue | `string` | 空字符串 | 非受控初始值。空值打开时，单色面板从 `#001F97` 开始编辑。 |
| colorModes | `ColorMode[]` | `['monochrome', 'linear-gradient']` | 允许单色、线性渐变或两者。仅一种模式时隐藏模式切换。 |
| format | `ColorFormat` | `RGB` | 单色输出支持 HEX、RGB、HSL、HSV、CMYK、CSS，以及 HEX8、RGBA、HSLA、HSVA。渐变输出 CSS `linear-gradient(...)`。面板中的格式菜单只切换编辑方式。 |
| enableAlpha | `boolean` | `false` | 显示透明度滑杆；HEX、RGB、HSL、HSV 自动使用带透明度的格式。 |
| enableMultipleGradient | `boolean` | `true` | 允许点击轨道增加色标。关闭后仍可编辑已有渐变的颜色和角度。 |
| showPrimaryColorPreview | `boolean` | `true` | 显示色相滑杆旁的颜色或渐变预览。 |
| swatchColors | `string[] \| null` | 40 个内置系统色 | 可提供颜色或渐变字符串。`[]` 或 `null` 隐藏系统色板。 |
| recentColors | `string[] \| boolean \| null` | — | 自定义最近色，支持 `v-model:recent-colors`。空数组或 `true` 使用内部记录，`false` 或 `null` 隐藏。 |
| defaultRecentColors | `string[] \| boolean \| null` | `[]` | 非受控最近色初始列表。最多保存 100 项。 |
| disabled | `boolean` | `false` | 禁用触发器和面板中的编辑操作。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 调整触发器、面板控件和文字大小。 |
| borderless | `boolean` | `false` | 隐藏默认触发框的边框，仅用于 `YmColorPicker`。 |
| clearable | `boolean` | `false` | 允许清空默认触发框中的色值，仅用于 `YmColorPicker`。 |
| inputProps | `InputProps` | — | 向颜色输入框传入占位文字、对齐方式等属性。 |
| selectInputProps | `SelectProps` | — | 设置面板中的编辑格式选择器，例如单独禁用格式切换。 |
| popupProps | `PopupProps` | 点击打开，左下对齐 | 向 `YmPopup` 传入触发方式、位置、可见性、面板样式、箭头或 `attach` 挂载位置，仅用于 `YmColorPicker`。 |

触发器、弹出面板和独立面板均继承最近的 `ConfigProvider`。使用 `popupProps.attach` 时，浮层继续跟随触发器所在位置的配置。局部 `size` 优先于全局尺寸。`mode` 和 `theme` 决定界面背景、文字、边框和焦点强调色，色板展示实际颜色。`radius` 控制输入框、按钮及面板圆角，支持设置为 0。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue / update:value | `value: string` | 选色、编辑色值或清空时同步模型。 |
| change | `(value: string, context: { color: ColorObject, trigger: ColorPickerChangeTrigger })` | 颜色改变时触发。上下文包含当前颜色的多种表示、透明度和操作来源。 |
| palette-bar-change | `{ color: ColorObject }` | 调节色相滑杆时触发。 |
| recent-colors-change / update:recentColors | `colors: string[]` | 添加或删除最近色时触发。 |
| clear | `{ e: MouseEvent }` | 点击默认触发器的清空按钮时触发。 |

`trigger` 可取 `input`、`preset`、`recent`、`palette-hue-bar`、`palette-alpha-bar`、`palette-saturation`、`palette-brightness` 或 `palette-saturation-brightness`。在渐变模式中，`context.color.linearGradient` 为完整渐变，RGB、HSL 等通道描述当前色标。

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 自定义 `YmColorPicker` 的触发元素，接收 `{ value, visible, panelId }`。建议使用可聚焦按钮以支持键盘。 |

## 使用指南

使用 `YmColorPicker` 在表单中选择单个色值。需要在同一页面持续编辑时，可将示例中的组件替换为 `YmColorPickerPanel`，继续使用相同的颜色模型和事件。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmColorPicker } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const color = ref('#0052d9')
</script>

<template>
  <YmColorPicker v-model="color" format="HEX" :color-modes="['monochrome']" clearable />
</template>
```
