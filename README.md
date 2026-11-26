# ym-ui-vapor

基于 Vue `3.6.0-rc.16` 的 Vapor 组件库，使用 Node.js `>=26.0.0` 和 npm。包入口导出 `YmButton`、`YmIcon`、`YmLoading`、`ConfigProvider`、`version` 及其公开类型，主题样式从 `ym-ui-vapor/style.css` 引入。

## 本地开发

在项目根目录执行以下命令。使用 nvm 时，可先运行 `nvm install` 加载 `.nvmrc` 指定的 Node.js 26。

```sh
npm ci
npm run dev
```

| 命令 | 用途 |
| --- | --- |
| `npm run typecheck` | 检查组件库、示例及 Vite 和 VitePress 配置的类型 |
| `npm run build` | 在 `dist/` 生成 ESM、类型声明和 CSS |
| `npm run build:playground` | 在 `playground/dist/` 生成可独立部署的静态组件文档 |
| `npm run test:browser` | 构建组件库和文档，用 Chromium 验证组件交互、文档导航和主题。首次运行可用 `npx playwright install chromium` 安装浏览器，或设置 `PLAYWRIGHT_CHANNEL=chrome` 使用本机 Chrome。 |
| `npm pack --dry-run` | 运行类型检查和库构建，查看将进入 npm 包的文件 |
| `npm pack` | 生成可在其他项目中安装的 `.tgz` |

各组件的操作步骤、预期结果和自动化覆盖情况见[组件测试清单](./docs/component-test-checklist.md)。

## YmButton

YmButton 的接口和文件组织参考 TDesign Vue Next。业务应用通过 Vite 等浏览器构建器加载组件，并用 `createVaporApp` 挂载入口。该 Vue RC 的原生 Node.js 入口缺少 `template` 等 Vapor 运行时导出。[上游 Button 目录](https://github.com/Tencent/tdesign-vue-next/tree/develop/packages/components/button)

按钮正文可以通过 `content` 字符串属性或默认插槽传入。两种写法都会显示“保存”。

```vue
<YmButton content="保存"></YmButton>
<YmButton>保存</YmButton>
```

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmButton, YmIcon, ConfigProvider } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const count = ref(0)
const theme = { light: { primary: '#28664c', onAccent: '#ffffff' }, dark: { primary: '#83d3ac' } }
</script>

<template>
  <ConfigProvider mode="auto" size="medium" :radius="8" :theme="theme">
    <YmButton @click="count++">
      <template #icon><YmIcon name="add" /></template>
      已添加 {{ count }} 次
    </YmButton>
  </ConfigProvider>
</template>
```

按钮进入加载状态时会使用 `YmLoading`，可通过 `loadingProps` 配置指示器。[YmButton 组件说明](./src/components/button/index.md)

### 主题与全局配置

`ConfigProvider` 将配置应用到所在的 DOM 子树。嵌套时可单独覆盖一个尺寸、圆角或颜色。组件的显式 `size` 优先，默认尺寸为 `medium`。圆角接受像素数值（包括 `0`）或 CSS 长度，`round` 和 `circle` 保持各自的形状。

`mode` 支持 `light`、`dark`、`auto`，其中 `auto` 随系统配色实时切换。通过 `theme.light` 和 `theme.dark` 分别设置 `primary`、`success`、`warning`、`danger`、`surface`、`text`、`border` 和 `onAccent`。按钮的悬停、按下和键盘焦点样式使用这些颜色。也可在容器上直接覆盖 `--ym-color-primary`、`--ym-control-height`、`--ym-radius` 等 CSS 变量。

## YmLoading

从包入口导入 `YmLoading` 可独立显示进度。使用默认插槽时，遮罩覆盖插槽所在的区域。[YmLoading 组件说明](./src/components/loading/index.md)

```vue
<YmLoading text="加载中" />
<YmLoading :loading="busy" text="刷新中">
  <span>订单详情</span>
</YmLoading>
```

## 添加组件

在 `src/components/` 下添加使用 `<script setup lang="ts" vapor>` 的单文件组件，通过 `src/index.ts` 导出。库构建将 Vue 设为外部依赖，由消费应用提供运行时。升级 Vue RC 时，同步更新 `peerDependencies.vue`、`devDependencies.vue`、`@vue/compiler-sfc` 及锁文件。

基础样式集中在 `src/style.css`。已有主题容器可继续使用 `ym-theme` 类和 `data-theme="light"`、`dark` 或 `auto` 设置配色。

### Playground 文档

`npm run dev` 启动 VitePress，首页默认打开按钮文档。每个组件的 `src/components/<目录名>/index.md` 直接对应 `/<目录名>/`。左侧按文档顶部的 `category` 分组，使用第一个一级标题作为菜单名称，也可以用 `title` 指定名称。添加文档后，开发服务器会自动更新菜单。

组件文档统一使用以下五个二级标题，并保持示例中的顺序。属性、事件和插槽直接写在各自章节中。没有自定义事件时，在「事件」下写「无自定义事件」。

要添加可操作的示例，在 `playground/examples/<目录名>.demo.vue` 编写 Vapor 组件，并在 Markdown 中引用。文档正文会预渲染为 HTML，浏览器按需加载示例并通过 `createVaporApp` 挂载。

```md
---
category: 基础组件
---

# YmButton 按钮

## 交互示例

<ComponentDemo name="button" />

## 属性

## 事件

## 插槽

## 使用指南
```

## 从业务项目试装

在库项目运行 `npm pack`，再在业务项目安装打出的文件和匹配的 Vue 版本。将示例中的相对路径替换为实际位置。

```sh
npm install ../YmUi/ym-ui-vapor-0.1.0-alpha.0.tgz vue@3.6.0-rc.16
```

```ts
import { version } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'
```

## 发布到 npm

初始版本为 `0.1.0-alpha.0`，默认发布到公共 npm registry 的 `next` 标签。包中包含 `dist/`、各组件的使用说明、`package.json` 和本说明。许可证字段初始设为 `UNLICENSED`，可按实际授权方式设置。

准备正式执行预发布时，使用拥有包发布权限的 npm 账号运行以下命令。`prepack` 会自动重新检查类型并构建。

```sh
npm login
npm pack --dry-run
npm publish --tag next --access public
```

发布后，业务项目可以使用 `npm install ym-ui-vapor@next vue@3.6.0-rc.16` 安装。发布稳定版时，将版本号及 `publishConfig.tag` 更新为对应的稳定版本和 `latest`。
