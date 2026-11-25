---
category: 基础组件
---

# YmLayout 布局

左侧放置系统标识与导航，右侧依次排列顶栏和内容区。收起侧栏时，系统名称隐藏，内容区随侧栏变窄而加宽。

## 交互示例

<ComponentDemo name="layout" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| logo | `string` | — | 系统 Logo 的图片地址，展开和收起时均显示。 |
| systemName | `string` | — | 展开时显示在 Logo 旁的系统名称。 |
| headerHeight | `number` | `48` | 顶栏与侧栏顶部品牌区的高度，单位为 px。 |
| asideWidth | `number` | `232` | 展开时的侧栏宽度，单位为 px。 |
| collapsedWidth | `number` | `48` | 收起时的侧栏宽度，单位为 px，可独立于顶栏高度设置。 |
| collapsed | `boolean` | 初始为 `false` | 侧栏是否收起，可通过 `v-model:collapsed` 同步。省略时由组件管理。 |
| showWatermark | `boolean` | `false` | 在内容区上方平铺倾斜的文字水印。滚动内容时水印保持在可视区域内。 |
| watermarkText | `string \| readonly string[]` | `systemName`，系统名称为空时取「内部使用」 | 可传入带换行的字符串或逐行排列的文本数组。显式传入空文本或空数组时隐藏水印。 |

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:collapsed | `collapsed: boolean` | 点击侧栏右下角的按钮时触发，参数为新的收起状态。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| header | 右侧顶栏，可放页面标题或工具栏。 |
| aside | 侧栏中部，可放导航。接收 `{ collapsed: boolean }`，用于在收起时隐藏导航文字。 |
| content | 顶栏下方的主内容区，通过 `flex: 1` 占满剩余空间。 |

## 使用指南

布局默认填满父容器高度。下面的示例用 `100dvh` 填满视口，请将 `/logo.svg` 换成系统的 Logo 地址。

```vue
<script setup lang="ts" vapor>
import { YmIcon, YmLayout } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmLayout logo="/logo.svg" system-name="仓储管理" :collapsed-width="56" style="height: 100dvh"
    show-watermark :watermark-text="['仓储管理', '内部资料']">
    <template #header>库存查询</template>
    <template #aside="{ collapsed }">
      <a href="/inventory" aria-label="库存查询">
        <YmIcon name="inventory" />
        <span v-if="!collapsed">库存查询</span>
      </a>
    </template>
    <template #content>当前库存清单</template>
  </YmLayout>
</template>
```
