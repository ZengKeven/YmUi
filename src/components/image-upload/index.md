---
category: 表单组件
---

# YmImageUpload 图片上传

选择一张或多张图片，查看上传进度，点击缩略图可放大预览。

## 交互示例

<ComponentDemo name="image-upload" />

点击配送日历可预览已有图片。开启「允许多张」后，点击「上传图片」追加图片，在预览中使用左右方向键切换。预览工具栏支持缩放和旋转，按 Esc 可返回。示例使用浏览器读取本地图片，选择的文件仅保存在当前页面。关闭「自动上传」可体验先选择、再点击「开始上传」的流程。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `ImageUploadFile[]` | — | 受控图片列表，支持 `v-model`。单张和多张模式均使用数组。 |
| defaultValue | `ImageUploadFile[]` | `[]` | 非受控模式下的初始列表。传入 `{ name, url }` 即可回显已有图片。 |
| multiple | `boolean` | `false` | 开启时可一次选择多张，并继续追加。单张模式可先删除原图再选择新图。 |
| max | `number` | `0` | 多张模式允许的图片总数，`0` 表示不限。达到上限后隐藏添加按钮。 |
| accept | `string` | `'image/*'` | 允许的图片 MIME 类型或扩展名，可用逗号分隔，例如 `image/png,.jpg`。 |
| sizeLimit | `number` 或 `{ size, unit }` | — | 单张图片的大小上限。数字的单位为 KB，对象的 `unit` 支持 `B`、`KB`、`MB` 和 `GB`。 |
| draggable | `boolean` | `false` | 允许将本地图片拖入上传区域，使用与文件选择相同的校验规则。 |
| showImageFileName | `boolean` | `true` | 在缩略图下显示文件名。 |
| showUploadProgress | `boolean` | `true` | 上传时显示百分比。 |
| disabled | `boolean` | `false` | 禁用添加、上传和移除，已有图片仍可预览。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置缩略图卡片和操作控件的尺寸。 |
| autoUpload | `boolean` | `true` | 配置了请求时，选图后自动上传。关闭后，可点击「开始上传」或调用组件实例的 `uploadFiles()`。 |
| action | `string` | — | 接收图片的服务地址。内置请求为每张图片发送一个 `multipart/form-data` POST，默认读取响应中的 `url`。 |
| name | `string` | `'file'` | 内置请求的文件字段名。 |
| headers | `Record<string, string>` | — | 内置请求附带的请求头。 |
| withCredentials | `boolean` | `false` | 允许内置跨域请求携带凭据。 |
| requestMethod | `(file, context) => Promise<ImageUploadResult>` | — | 自定义单张图片的上传方法，优先于 `action`。从 `file.raw` 读取原文件，使用 `context.onProgress(percent)` 上报进度，使用 `context.signal` 响应取消。 |
| formatResponse | `(response, file) => ImageUploadResponse` | — | 将内置请求的响应转换为 `{ url }` 或 `{ error }`。 |

`ImageUploadFile` 包含文件名 `name`，以及可选的 `id`、`url`、`raw`、`size`、`type`、`status`、`percent` 和 `response`。已选文件的状态依次可为 `waiting`（待上传）、`progress`（上传中）、`success`（成功）或 `fail`（失败）。仅需选择和预览时，可省略 `action` 和 `requestMethod`，此时新图片停留在待上传状态。

组件继承最近的 `ConfigProvider`，嵌套时逐项覆盖。`size` 控制卡片和操作控件尺寸，组件显式传入的 `size` 优先。`mode` 和 `theme` 控制卡片、文字、边框与操作按钮的颜色。`radius` 控制卡片和按钮的圆角，预览打开后仍继承上传区域的配置。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `files: ImageUploadFile[]` | 图片列表变化时同步 `v-model`。 |
| change | `files: ImageUploadFile[]` | 图片进入列表、上传成功、上传失败或被移除时传入最新列表。 |
| progress | `{ file, percent }` | 上传进度更新时触发。 |
| success | `{ file, index }` | 单张图片上传成功时触发。 |
| fail | `{ file, index }` | 单张图片上传失败时触发。 |
| remove | `{ file, index }` | 用户从列表中移除图片时触发。 |
| preview | `{ file, index }` | 用户从缩略图打开预览时触发。 |
| validate | `{ file: File, reason }` | 文件未通过校验，`reason` 分别以 `type`、`size` 或 `max` 表示类型、大小和数量限制。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| trigger | 自定义添加按钮内的图标或文字，点击仍打开文件选择器。 |

## 使用指南

将 `action` 指向自己的上传接口，接口成功时可返回 `{ "url": "/images/photo.jpg" }`。以下示例最多保存三张图片，每张不超过 5 MB。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmImageUpload, type ImageUploadFile } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const photos = ref<ImageUploadFile[]>([])
</script>

<template>
  <YmImageUpload v-model="photos" action="/api/images" multiple :max="3" :size-limit="{ size: 5, unit: 'MB' }" />
</template>
```

自定义 `requestMethod` 时，成功返回 `{ status: 'success', response: { url } }`，失败可返回 `{ status: 'fail', error: '上传失败' }`。通过组件实例的 `choose()` 可打开文件选择器，`uploadFiles()` 可发送待上传图片并重试失败项。
