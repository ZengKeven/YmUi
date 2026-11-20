---
category: 导航组件
---

# YmTabs 选项卡

将相关内容放在不同的面板中，点击标签即可切换当前面板。

## 交互示例

<ComponentDemo name="tabs" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| YmTabs.modelValue | `string \| number` | 第一个面板的标识 | 当前显示的面板，支持 `v-model`。 |
| YmTabs.size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置标签尺寸。 |
| YmTabPanel.value | `string \| number` | 必填 | 当前面板的唯一标识。 |
| YmTabPanel.label | `string` | 面板的 `value` | 标签标题，可通过 `#label` 插槽自定义。 |

选项卡继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。`size` 控制标签高度和字号，组件显式传入的尺寸优先。`mode` 和 `theme` 控制标签栏、面板、边框、文字及选中标签的强调色。`radius` 控制卡片圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `value: string \| number` | 同步选中的面板标识。 |
| change | `value: string \| number` | 用户切换到其他标签时触发。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| YmTabs.default | 放置各个 `YmTabPanel`，顺序决定标签的排列顺序。 |
| YmTabPanel.default | 该面板的正文，可直接放入文本、表单或其他 Vue 组件。切换面板会保留已输入的内容。 |
| YmTabPanel.label | 自定义标签头，可组合图标和文字，优先于 `label` 属性。 |
| YmTabPanel.action | 在标签栏右侧显示当前面板的操作或说明。每个面板可分别传入按钮、文本或其他组件。 |

## 使用指南

为每个面板设置唯一的 `value`，将该页的内容直接写在开始和结束标签之间。下面将 `YmTabPanel` 导入为 `TTabPanel`，模板中即可使用 `<t-tab-panel>`。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmButton, YmIcon, YmTabPanel as TTabPanel, YmTabs } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const active = ref('home')
</script>

<template>
  <YmTabs v-model="active">
    <t-tab-panel value="home">
      <template #label><YmIcon name="home" />首页</template>
      <template #action>
        <YmButton variant="text" @click="active = 'schedule'">查看日程</YmButton>
      </template>
      今天有 2 项日程。
    </t-tab-panel>
    <t-tab-panel value="schedule" label="日程">
      <template #action>共 2 项</template>
      <ul><li>09:30 采购例会</li><li>14:00 库存盘点</li></ul>
    </t-tab-panel>
    <t-tab-panel value="tasks" label="事项">
      <label>事项备注 <input type="text" /></label>
    </t-tab-panel>
  </YmTabs>
</template>
```
