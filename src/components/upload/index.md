---
category: 表单组件
---

# YmUpload 文件上传

选择或拖入附件，支持单文件替换、多文件追加、上传进度和失败重试。已有原生 `File` 对象时，也可直接调用 `uploadFiles()`。

## 交互示例

<ComponentDemo name="upload" />

选择一个文件后，点击「重新选择」可替换它。开启「允许多文件」可一次选择多个附件，也可分次追加。关闭「自动上传」后，点击「开始上传」发送待上传文件。示例在浏览器内模拟上传进度，所选文件保留在本机。

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `UploadFile[]` | — | 受控文件列表，支持 `v-model`。单文件也使用数组。 |
| defaultValue | `UploadFile[]` | `[]` | 非受控模式的初始文件。已有附件可传入 `{ name, url }`。 |
| multiple | `boolean` | `false` | 单文件模式用新选择替换原文件，多文件模式可以追加。 |
| max | `number` | `0` | 多文件模式的文件总数上限，`0` 表示不限。 |
| accept | `string` | `''` | 默认接受所有文件。可用逗号分隔 MIME 类型和扩展名，例如 `.pdf,image/*`。 |
| sizeLimit | `number` 或 `{ size, unit }` | — | 每个文件的大小上限。数字的单位为 KB，对象的 `unit` 支持 `B`、`KB`、`MB`、`GB`。 |
| placeholder | `string` | — | 文件列表为空时显示的提示。 |
| draggable | `boolean` | `false` | 允许拖放文件，拖入和点击选择遵循相同的校验规则。 |
| disabled | `boolean` | `false` | 禁用文件选择、上传和移除。 |
| size | `extra-small / small / medium / large` | 继承全局尺寸，初始为 `medium` | 设置按钮和文件列表的尺寸。 |
| autoUpload | `boolean` | `true` | 配置请求后自动上传。关闭后可点击「开始上传」，也可调用组件实例的 `uploadFiles()`。 |
| showUploadProgress | `boolean` | `true` | 上传时显示百分比。 |
| action | `string` | — | 内置请求的接口地址，每个文件发送一个 `multipart/form-data` POST 请求。 |
| name | `string` | `'file'` | 内置请求使用的文件字段名。 |
| headers | `Record<string, string>` | — | 内置请求附带的请求头。 |
| withCredentials | `boolean` | `false` | 允许内置跨域请求携带凭据。 |
| formatResponse | `(response, file) => UploadResponse` | — | 将内置请求的响应转换为 `{ url }` 或 `{ error }`。 |
| requestMethod | `(file, context) => Promise<UploadResult>` | — | 自定义单个文件的请求，优先于 `action`。从 `file.raw` 获取原文件，通过 `context.onProgress(percent)` 上报进度，使用 `context.signal` 响应取消。 |

`UploadFile` 包含文件名 `name`，可选字段包括 `id`、`url`、`raw`、`size`、`type`、`status`、`percent` 和 `response`。组件仅选择文件时可省略上传接口，在 `v-model` 中读取待上传项的 `raw`。

组件继承最近的 `ConfigProvider` 配置，嵌套时逐项覆盖。`size` 控制按钮尺寸与列表字号，组件显式传入的 `size` 优先。`mode` 和 `theme` 控制背景、边框、文字及状态颜色，`radius` 控制按钮和文件行的圆角。

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| update:modelValue | `files: UploadFile[]` | 同步当前文件列表。 |
| change | `files: UploadFile[]` | 添加、替换、移除文件或单个请求成功、失败时，传入最新列表。 |
| progress | `{ file, percent }` | 某个文件的上传进度更新。 |
| success | `{ file, index }` | 单个文件上传成功。 |
| fail | `{ file, index }` | 单个文件上传失败，可从 `file.response?.error` 读取原因。 |
| remove | `{ file, index }` | 用户移除列表中的文件。 |
| validate | `{ file: File, reason }` | 文件被拒绝。类型、大小和数量超限的原因分别为 `type`、`size` 和 `max`。 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| trigger | 自定义上传图标右侧的按钮内容，默认显示「上传文件」或「重新选择」。 |

## 使用指南

将 `action` 指向附件上传接口。默认使用 `file` 字段发送文件，成功响应可返回 `{ "url": "/files/contract.pdf" }`。

```vue
<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmUpload, type UploadFile } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const attachments = ref<UploadFile[]>([])
</script>

<template>
  <YmUpload v-model="attachments" action="/api/attachments" multiple :max="5" />
</template>
```

组件实例的 `choose()` 打开文件选择器，`uploadFiles()` 上传列表中等待或失败的文件。

如果业务页面已经取得原生文件，可从包入口导入 `uploadFiles(files, options)` 直接上传。第一个参数接受单个 `File` 或只读文件数组，第二个参数可使用与组件相同的 `action`、`name`、`headers`、`withCredentials`、`formatResponse` 和 `requestMethod`。

```ts
import { uploadFiles } from 'ym-ui-vapor'

async function sendContract(file: File) {
  const [contract] = await uploadFiles(file, { action: '/api/attachments' })
  return contract
}

function sendAttachments(files: FileList, signal: AbortSignal) {
  return uploadFiles(Array.from(files), { action: '/api/attachments', signal })
}
```

有文件时需提供 `action` 或 `requestMethod`。方法返回 `Promise<UploadFile[]>`，结果按输入顺序排列，空数组返回空结果。单个请求失败时，在对应项的 `status` 和 `response.error` 中查看结果。可通过 `options.onProgress(file, percent)` 接收逐文件进度，传入 `AbortSignal` 可取消整次调用并使 Promise 拒绝。
