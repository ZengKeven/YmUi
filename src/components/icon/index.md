---
category: 基础组件
---

# YmIcon 图标

内置 208 个线形 SVG 图标，覆盖系统通用、常用工具、后台操作、一级菜单和行业后台。通用图形采用 TDesign Icons 0.4.8 的描边版，仓储、审批和打印等业务图形沿用同一套设计。图形随组件库打包，可离线使用。[TDesign 官方图标库](https://tdesign.tencent.com/icons) · [图形来源与 MIT 许可](https://github.com/Tencent/tdesign-icons)

## 交互示例

<ComponentDemo name="icon" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `IconName` | 必填 | 内置图标的英文名，例如 `user`、`print`、`approve`、`warehouse`、`product`。可在交互示例中按中文或英文名查找。 |
| size | `string / number` | 继承 | 支持 `extra-small / small / medium / large`、CSS 长度和像素数值。独立使用时跟随文字大小或最近设置的全局尺寸，按钮中的图标默认跟随按钮字号。 |
| color | `string` | `currentColor` | 默认跟随文字颜色，可传 CSS 颜色或主题变量。 |
| onClick | `(context: { e: MouseEvent }) => void` | — | 点击回调，也可通过 `@click` 监听。 |

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| click | `{ e: MouseEvent }` | 点击 SVG 时触发，`e` 为原生事件。 |

## 插槽

无插槽。

## 使用指南

```vue
<script setup lang="ts" vapor>
import { YmButton, YmIcon } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
</script>

<template>
  <YmIcon name="user" aria-label="个人中心" />
  <YmIcon name="warehouse" :size="20" aria-label="仓储" />
  <YmButton>
    <template #icon><YmIcon name="add" /></template>
    添加
  </YmButton>
  <YmIcon name="loading" :size="24" aria-label="加载中" />
</template>
```

图标默认作为装饰，由旁边的文字或外层按钮提供可访问名称。图标独立表达含义时，可以用 `aria-label` 或 `aria-labelledby` 命名。需要延迟显示、遮罩或加载状态提示时，使用 [YmLoading](../loading/index.md)。

### 线形图标设计规范 {#icon-guidelines}

新增图标以当前 `YmIcon` 图库为准。先按中文用途或英文名查找，含义相同就复用已有图标。新增动作或状态时，从同组图标的主体轮廓开始绘制。采用 TDesign 描边版的通用图形时，也按本库同类图标校准尺寸。

#### 画布与笔画

统一使用 `viewBox="0 0 24 24"`。以实际着色范围的长边衡量大小，计入端点、转角和实色细节，四周至少留 1 个单位。对称图形以 `(12, 12)` 为中心，具有位置含义的符号沿用同组对齐方式，如 `minimize` 的横线位于窗口下方。

| 图形 | 可见长边（SVG 单位） | 库内参照 |
| --- | --- | --- |
| 常规物件、菜单、业务操作 | 22 | `user`、`warehouse`、`print` |
| 水平或垂直箭头，含双向箭头 | 21 | `arrow-right`、`arrow-up-down` |
| 加号、减号、关闭、更多 | 20 | `add`、`minus`、`close`、`more` |
| 单折角、斜向箭头、拖动柄、窗口最小化 | 18.5 | `chevron-down`、`arrow-up-right`、`drag-handle`、`minimize` |

基准描边宽为 2，端点用方头（`square`），转角用斜接（`miter`）。例如 `add` 的水平线从 `(3, 12)` 到 `(21, 12)`，两端各伸出 1 个单位，可见宽度正好是 20。调整占比时移动路径坐标，保持笔画等粗。

#### 主体与动作标记

- **菜单和业务对象**用一个主要物件表达含义。比如 `purchase` 用购物车，`warehouse` 用卷帘门。绘制新菜单时，与这两枚并排检查轮廓大小和内部留白。
- **同组操作**保留主体，在留白处放一个动作标记。`approve`、`reject`、`revoke-approval` 共用印章，右下角分别放对勾、叉号和折返箭头。`print-preview` 沿用打印机，在出纸口旁留出镜片的位置。
- **颜色与动效**由组件统一处理，描边和填充都继承 `currentColor`。菜单和操作图标保持静止。`loading` 每 700ms 旋转一圈，开启「减少动态效果」时显示静态圆弧。

#### 入库与验收

1. 在 `src/components/icon/glyphs/` 选择所属分类文件，依次为系统通用（`system.ts`）、常用工具（`tools.ts`）、后台操作（`actions.ts`）、一级菜单（`menus.ts`）和行业后台（`business.ts`）。英文名按用途命名，多词用短横线，同组沿用已有词干，如 `print-preview`。
2. 普通描边直接保存 SVG 的 `d` 字符串，如 `add`。轮廓带实色细节时保存 `{ outline, fill }`，如 `print` 的机身和指示灯。整个图形已由填充路径描述时保存 `{ fill }`，如 `loading`。填充路径使用 `evenodd` 表达镂空。
3. 在 `playground/examples/icon-catalog.ts` 的 `iconLabels` 补上中文名，图库和 `IconName` 会从分类文件取到新名称。同步更新文档总数和图库测试中的分类数量。
4. 在 Playground 以 30px 查看细节，再切到 **16px 工具栏**和 **20px 侧栏**，在浅色、深色主题中与同组图标并排检查。小尺寸下仍应看清箭头方向、动作标记和镂空。运行 `npm run test:browser` 验证实际着色边界。

纯图标按钮建议提供至少 32 × 32px 的点击区域。审核、驳回、作废等操作保留可见文字。承担识别控件或状态作用的图形与相邻背景的对比度至少为 3:1。[WCAG 非文本对比度](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
