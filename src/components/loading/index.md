---
category: 反馈组件
---

# YmLoading 加载

用作行内进度提示，或通过默认插槽为一块内容添加加载遮罩。切换 `loading` 时，插槽中的表单和其他组件保持挂载。

## 交互示例

<ComponentDemo name="loading" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| attach | 选择器、DOM 元素或挂载函数 | — | 指定挂载点。函数接收指示器的源元素，可返回元素或文档。 |
| content | `string` | — | 供局部遮罩覆盖的文本。 |
| default | `string` | — | 同 `content`，两者都有内容时优先。 |
| delay | `number` | `0` | 显示提示前等待的毫秒数。 |
| fullscreen | `boolean` | `false` | 使用覆盖视口的遮罩，默认挂载到 `body`。 |
| indicator | `boolean / string` | `true` | 默认显示 YmIcon 的 `loading` 图标，传入字符串可替换为文本。 |
| inheritColor | `boolean` | `true` | 指示器继承父元素的文字颜色。 |
| loading | `boolean` | `true` | 控制加载提示的可见性。 |
| preventScrollThrough | `boolean` | `true` | 显示全屏遮罩时锁定页面滚动。 |
| showOverlay | `boolean` | `true` | 为包裹的内容或指定的挂载元素显示遮罩背景。 |
| size | `string` | `1em` | 图标大小，支持 `small / medium / large` 或 CSS 长度。 |
| text | `string` | — | 图标旁的提示文本。 |
| zIndex | `number` | 由样式决定 | 自定义加载层的堆叠层级。 |

## 事件

无自定义事件。

## 插槽

| 名称 | 说明 |
| --- | --- |
| default | 放置局部遮罩覆盖的内容。插槽为空时，可通过 `default` 或 `content` 属性提供文本。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmLoading } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const busy = ref(false)
</script>

<template>
  <YmLoading text="正在加载" />
  <label><input v-model="busy" type="checkbox" /> 正在刷新</label>
  <YmLoading :loading="busy" :delay="150" text="刷新中">
    <span>订单详情</span>
  </YmLoading>
</template>
```

需要覆盖指定区域时，可使用 `<YmLoading :loading="busy" attach="#orders" />`。使用 `fullscreen` 时，遮罩默认挂载到当前文档的 `body`，结束后自动解除滚动锁定。

通过 `YmButton` 的 `loadingProps` 也可以传入同一组属性。[YmButton 组件说明](../button/index.md#属性)
