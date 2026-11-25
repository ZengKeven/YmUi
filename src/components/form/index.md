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
| YmForm.rules | `FormRules` | — | 字段的规则数组。支持路径键 `'items[0].code'`，也支持与数据结构一致的嵌套规则。 |
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
| YmFormItem.rules | `FormRule[]` | 继承同路径规则 | 非空时优先使用字段自身的规则。 |
| YmFormItem.labelAlign / labelWidth / requiredMark | 同表单 | 继承 | 单独覆盖该字段的标签和必填标记。 |
| YmFormItem.showErrorMessage / statusIcon | `boolean` | 继承 | 单独设置字段反馈和状态图标。 |
| YmFormItem.status / successBorder | `error / warning / success`、`boolean` | —、`false` | 手动设置状态，或在校验成功时显示成功色边框。 |
| YmFormItem.help / tips | `string` | — | 常驻说明、随状态着色的提示。 |

表单继承最近的 `ConfigProvider`，嵌套配置逐项覆盖。局部 `size` 优先。全局 `mode`、`theme` 控制标签、必填标记、输入边框和反馈的配色，`radius` 作用于内部控件的圆角，设为 `0` 即显示直角。

**规则写法**

每个规则对象写一个约束。规则数组依次定义显示顺序，异步规则可并行执行。空值跳过可选的内置规则，`0` 和 `false` 均视为已填写。

| 约束 | 用法 |
| --- | --- |
| 必填和类型 | `required`、`whitespace`、`number`、`boolean`。仅含空格的字符串可用 `whitespace: true` 检查。 |
| 大小和长度 | `min`、`max` 对数字比较大小，对数组比较元素个数，对字符串按 ASCII 字符 1、其他码点 2 计算长度。`len` 指定长度。 |
| 枚举和格式 | `enum`、`pattern`、`date`、`email`、`url`、`telnumber`、`idcard`。身份证规则检查号码格式。 |
| 自定义校验 | `validator(value, { formData, name })` 支持跨字段检查。返回布尔值、`{ result, message, type }` 或相应 Promise。 |
| 触发和反馈 | `trigger` 支持 `change`（默认）、`blur`、`submit` 和 `all`。常规提交检查所有规则。带 `type: 'warning'` 的失败结果也会出现在校验结果中。 |

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
