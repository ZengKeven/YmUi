---
category: 全局配置
---

# ConfigProvider 全局配置

为一组组件统一指定主题、尺寸和圆角。嵌套配置可以单独覆盖某一项，按钮上显式指定的尺寸优先。

## 交互示例

<ComponentDemo name="config-provider" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | `light / dark / auto` | 继承，初始为 `light` | 设置配色模式。`auto` 随系统切换。 |
| size | `extra-small / small / medium / large` | 继承，初始为 `medium` | 设置后代控件的尺寸。 |
| radius | `number / string` | 继承，初始为 `0.375rem` | 设置圆角。数字按像素计算，字符串接受 CSS 长度。 |
| theme | `{ light?: ThemeColors, dark?: ThemeColors }` | 继承 | 分别覆盖浅色和深色配色。 |

`ThemeColors` 支持 `primary`、`success`、`warning`、`danger`、`surface`、`text`、`border` 和 `onAccent`。

`text` 设置主题区域的默认文字颜色，`onAccent` 设置彩色填充按钮的文字颜色。深色模式下两者默认为 `#ffffff`，可分别覆盖。按钮内的图标和加载指示器默认继承按钮文字颜色。

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 放置需要共享主题、尺寸和圆角配置的组件。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { ConfigProvider, YmButton } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <ConfigProvider mode="auto" size="large" :radius="8">
    <YmButton>保存</YmButton>
    <ConfigProvider size="small">
      <YmButton variant="outline">取消</YmButton>
    </ConfigProvider>
  </ConfigProvider>
</template>
```
