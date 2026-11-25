---
category: 表单组件
---

# YmForm 表单

用 `YmForm` 管理一组字段的校验、提交和重置。每个 `YmFormItem` 通过 `name` 关联数据路径，输入控件的 `v-model` 绑定到同一字段。

## 交互示例

<ComponentDemo name="form" />

## 属性

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| YmForm.data | `object` | `{}` | 响应式业务数据。重置时会写回已注册的字段。 |
| YmForm.rules | [`FormRules`](#form-rules) | — | 整张表单的校验规则，按 `YmFormItem.name` 查找对应字段的规则数组。 |
| YmForm.errorMessage | `FormErrorMessage` | 中文内置提示 | 按规则名提供文案模板，例如 `{ required: '请填写${name}' }`。`${validate}` 可插入规则参数。 |
| YmForm.layout | `vertical / inline` | `vertical` | 逐行排列或行内排列，行内布局可自动换行。 |
| YmForm.labelAlign / labelWidth | `left / right / top`、`number / string` | `right`、`100px` | 标签的位置和宽度，数值按像素计算。宽度为零时隐藏标签。 |
| YmForm.colon | `boolean` | `false` | 在标签后显示冒号。 |
| YmForm.requiredMark / requiredMarkPosition | `boolean`、`left / right` | 按必填规则、`left` | 控制星号的显示和位置。字段是否必填由 `required` 规则决定。 |
| YmForm.showErrorMessage / statusIcon | `boolean` | `true`、`false` | 显示校验反馈、显示状态图标。 |
| YmForm.disabled / readonly | `boolean` | `false` | 统一设置 Ym 字段状态。只读时文本仍可聚焦复制，选择类字段锁定选择；有原生名称的只读字段保留提交值。按钮继承禁用状态，组件显式设置优先。原生控件可绑定默认插槽提供的状态。 |
| YmForm.resetType | `empty / initial` | `empty` | `initial` 恢复字段注册时的值。`empty` 将字符串、数组及普通对象置空，其他类型设为 `undefined`。 |
| YmForm.preventSubmitDefault | `boolean` | `true` | 默认拦截原生提交与重置。设为 `false` 时允许原生提交及整表还原。局部重置和清空已注册字段始终由组件处理。 |
| YmForm.scrollToFirstError | `auto / smooth` | — | 校验失败后滚动到文档顺序中的首个错误字段。 |
| YmForm.size | `extra-small / small / medium / large` | 继承 | 影响文字、字段间距及内部控件尺寸。 |
| YmFormItem.name | `string` | — | 数据路径，例如 `contact.email` 或 `items[0].code`。未命名的项可放置操作按钮。 |
| YmFormItem.label / for | `string` | — | 字段标签、与标签关联的控件 ID。也可用默认插槽提供的属性自动关联。 |
| YmFormItem.rules | [`FormRule[]`](#form-rule) | 继承同路径规则 | 传入非空数组时，该字段只使用这组规则。 |
| YmFormItem.labelAlign / labelWidth / requiredMark | 同表单 | 继承 | 单独覆盖该字段的标签和必填标记。 |
| YmFormItem.showErrorMessage / statusIcon | `boolean` | 继承 | 单独设置字段反馈和状态图标。 |
| YmFormItem.status / successBorder | `error / warning / success`、`boolean` | —、`false` | 手动设置状态，或在校验成功时显示成功色边框。 |
| YmFormItem.help / tips | `string` | — | 常驻说明、随状态着色的提示。 |

表单继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。局部 `size` 优先。全局 `mode`、`theme` 控制标签、必填标记、输入边框和反馈的配色，`radius` 作用于内部控件的圆角，设为 `0` 即显示直角。

### FormRules 字段规则表 {#form-rules}

`FormRules` 把字段路径映射到规则数组。普通字段可以直接用字段名作键。嵌套字段可以写成完整路径，也可以按 `data` 的对象和数组层级组织。两种写法同时匹配同一个 `name` 时，优先使用完整路径键。

```ts
import type { FormRules } from 'ym-ui-vapor'

const rules: FormRules = {
  contact: [{ required: true, message: '请填写联系人' }],
  'delivery.email': [{ email: true, trigger: 'blur', message: '请输入有效邮箱' }],
  items: [
    { code: [{ required: true, message: '请填写商品编号' }] }, // 对应 name="items[0].code"
  ],
}
```

### FormRule 单条校验规则 {#form-rule}

同一规则对象只执行第一个启用的约束。字段有多个约束时，请在数组中分开写。异步规则可以并行执行，字段按数组顺序显示第一条失败提示。空值会跳过可选的内置规则，自定义 `validator` 仍会收到空值。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `required` | `boolean` | 必填。`0` 和 `false` 均视为已填写。 |
| `whitespace` | `boolean` | 拒绝仅含空白的字符串。要同时拒绝空字符串，另加一条 `required` 规则。 |
| `number`、`boolean` | `boolean` | 分别要求字段值为有限数字或布尔值。 |
| `min`、`max`、`len` | `number` | `min` 和 `max` 对数字比较大小，对数组比较元素个数，对字符串比较长度。`len` 指定确切长度。字符串中每个 ASCII 字符计 1，其他 Unicode 码点计 2。 |
| `enum` | `readonly unknown[]` | 字段值必须是数组成员，例如 `{ enum: ['快递', '自提'] }`。 |
| `pattern` | `RegExp` 或 `string` | 字段值须匹配指定的正则表达式。 |
| `date` | `boolean` 或配置对象 | 校验日期。可设置 `format`、`delimiters`、`strictMode`，例如 `{ date: { format: 'YYYY-MM-DD', strictMode: true } }`。 |
| `email` | `boolean` 或配置对象 | 校验邮箱。可设置 `require_tld`、`allow_utf8_local_part` 和 `ignore_max_length`。 |
| `url` | `boolean` 或配置对象 | 校验网址。可设置 `protocols`、`require_protocol` 和 `require_tld`。 |
| `telnumber`、`idcard` | `boolean` | 分别检查中国大陆手机号、身份证号码的格式。 |
| `validator` | `(value, { formData, name }) => …` | 自定义校验。可读取其他字段，返回布尔值、`{ result, message?, type? }` 或对应的 Promise。 |
| `trigger` | `'change'`、`'blur'`、`'submit'` 或 `'all'` | 默认 `'change'`。表单提交时会检查所有规则。 |
| `message` | `string` | 该规则失败时的提示文字。省略时使用表单的 `errorMessage` 或内置文案。 |
| `type` | `'error'` 或 `'warning'` | 失败提示的级别，默认 `'error'`。警告也会计入校验失败。 |

## 事件

| 名称 | 参数 | 触发时机 |
| --- | --- | --- |
| validate | `{ validateResult, firstError }` | 显式调用 `validate()` 或提交的整次校验结束。 |
| submit | `{ validateResult, firstError, e }` | 原生提交或调用 `submit()` 完成校验。通过时 `validateResult === true`；失败时按字段路径返回规则结果，`firstError` 为首条错误提示。 |
| reset | `{ e }` | 点击重置按钮或调用 `reset()`，字段数据已重置。 |

异步提交期间修改字段、增删表单项、重置或再次提交，都会使前一次提交失效。保存数据的逻辑应在 `submit` 回调中检查 `validateResult === true` 后执行。

## 插槽

| 名称 | 说明 |
| --- | --- |
| YmForm.default | 放置表单项，提供 `{ disabled, readonly }` 供原生或自定义控件使用。 |
| YmForm.statusIcon | 统一自定义字段反馈图标，接收 `{ status, name }`。 |
| YmFormItem.default | 放置字段控件。将 `controlProps` 绑定到控件即可关联标签、必填状态及说明文字，也可以单独使用插槽中的 `id`。 |
| YmFormItem.label / help / tips | 自定义标签、说明或提示，优先于对应属性。 |
| YmFormItem.statusIcon | 自定义该项的反馈图标，接收 `{ status, name }`，优先于表单级图标。 |

## 使用指南

```vue
<script setup lang="ts" vapor>
import { reactive, useTemplateRef } from 'vue'
import { YmButton, YmForm, YmFormItem, YmInput, type FormInstance, type FormRules } from 'ym-ui-vapor'
import 'ym-ui-vapor/style.css'

const data = reactive({ contact: { email: '' } })
const rules: FormRules = {
  'contact.email': [
    { required: true, message: '请填写邮箱' },
    { email: true, trigger: 'blur', message: '邮箱格式有误' },
  ],
}
const form = useTemplateRef<FormInstance>('form')
</script>

<template>
  <YmForm ref="form" :data="data" :rules="rules" reset-type="initial">
    <YmFormItem v-slot="{ controlProps }" label="通知邮箱" name="contact.email">
      <YmInput v-bind="controlProps" v-model="data.contact.email" />
    </YmFormItem>
    <YmFormItem>
      <YmButton type="submit">提交</YmButton>
      <YmButton type="reset" variant="outline">重置</YmButton>
    </YmFormItem>
  </YmForm>
</template>
```

通过表单 ref 可执行以下操作。

| 方法 | 行为 |
| --- | --- |
| `validate({ fields?, trigger?, showErrorMessage? })` | 校验已挂载的字段并更新反馈。省略参数检查全部字段和规则，返回 Promise。 |
| `validateOnly({ fields?, trigger? })` | 返回相同结构的结果，保留现有界面状态，也不触发事件。 |
| `submit({ showErrorMessage? })` | 走与提交按钮相同的校验和提交流程，可等待完成。 |
| `reset({ fields?, type? })` | 重置全部或指定字段的数据与反馈。 |
| `clearValidate(fields?)` | 清除指定字段的反馈并使在途校验失效，保留输入值。 |
| `setValidateMessage({ [name]: [{ type, message }] })` | 写入服务器或业务逻辑返回的字段提示，支持 `error`、`warning` 和 `success`。 |
