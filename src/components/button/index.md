---
category: 基础组件
---

# YmButton 按钮

用于触发操作、提交表单或打开链接。

## 交互示例

<ComponentDemo name="button" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| block | `boolean` | `false` | 占满容器宽度。 |
| content | `string` | — | 按钮正文。默认插槽有内容时优先显示插槽。 |
| disabled | `boolean` | `undefined` | 禁用按钮。默认可交互。 |
| form | `string` | — | 关联表单的 ID，可用于表单外的提交或重置按钮。 |
| ghost | `boolean` | `false` | 使用透明背景。 |
| href | `string` | `''` | 链接地址。传入非空地址时默认渲染为链接。 |
| icon | `string` | — | 正文前的图标文本。可用 `#icon` 插入图标组件。 |
| loading | `boolean` | `false` | 显示加载指示器，拦截按钮激活，保留键盘焦点。 |
| loadingProps | `LoadingProps` | — | 传给 YmLoading 的属性，详见 [YmLoading 组件说明](../loading/index.md)。 |
| shape | `rectangle / square / round / circle` | `rectangle` | 矩形、方形、胶囊形或圆形。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 显式设置时覆盖全局尺寸。 |
| suffix | `string` | — | 正文后的文本。也可使用 `#suffix`。 |
| tag | `button / a / div` | 随 `href` 选择 | 有链接时为 `a`，其他情况为 `button`。显式指定的标签优先。 |
| theme | `default / primary / danger / warning / success` | 随 `variant` 选择 | `base` 默认使用 `primary`，其他样式默认使用 `default`。 |
| type | `button / submit / reset` | `button` | 原生按钮在表单中的行为。 |
| variant | `base / outline / dashed / text` | `base` | 填充、描边、虚线或文字按钮。 |
| onClick | `(event: MouseEvent) => void` | — | 点击回调，也可通过 `@click` 监听。 |

原生属性会传给根元素，例如链接上的 `target` 和 `rel`。纯图标按钮可通过 `aria-label` 提供可访问名称。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| click | `event: MouseEvent` | 鼠标或键盘激活按钮时触发。禁用和加载状态会阻止点击、链接跳转和按钮触发的表单提交。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 按钮正文，可包含文本或元素。为空时回退到 `content`。 |
| icon | 正文前的图标。非空 `icon` 属性优先，加载期间此位置显示加载提示。 |
| suffix | 正文后的内容。非空 `suffix` 属性优先。 |


## 使用指南

按钮正文支持 `content` 字符串和默认插槽，两种写法都会显示「保存」。

```vue
<script setup lang="ts" vapor>
import { YmButton } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmButton content="保存"></YmButton>
  <YmButton>保存</YmButton>
</template>
```