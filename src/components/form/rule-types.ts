export type FormValidateTrigger = 'change' | 'blur' | 'submit' | 'all'

export interface FormRuleContext {
  /** 当前表单的完整数据，可用于跨字段校验。 */
  formData: Record<string, any>
  /** 当前字段路径。 */
  name: string
}

export interface FormRuleFeedback {
  /** 校验是否通过。 */
  result: boolean
  /** 自定义校验返回的说明。 */
  message?: string
  /** 反馈状态，成功时可附带成功提示。 */
  type?: 'error' | 'warning' | 'success'
}

interface DateOptions {
  /** 年月日的位置和分隔符，默认 YYYY/MM/DD。 */
  format?: string
  /** 可用的日期分隔符，默认斜线和连字符。 */
  delimiters?: readonly string[]
  /** 是否要求分隔符与数字位数均符合 format。 */
  strictMode?: boolean
}

interface EmailOptions {
  /** 是否跳过邮箱总长度与本地部分的长度检查。 */
  ignore_max_length?: boolean
  /** 是否允许邮箱本地部分包含非 ASCII 字符，默认允许。 */
  allow_utf8_local_part?: boolean
  /** 是否要求域名包含顶级域，默认要求。 */
  require_tld?: boolean
}

interface UrlOptions {
  /** 允许的 URL 协议，默认 http、https 和 ftp。 */
  protocols?: readonly string[]
  /** 是否要求显式填写协议。 */
  require_protocol?: boolean
  /** 是否要求主机名包含顶级域，默认要求。 */
  require_tld?: boolean
}

export interface FormRule {
  /** 是否必填，0 和 false 视为已填写。 */
  required?: boolean
  /** 是否拒绝只有空白字符的字符串。 */
  whitespace?: boolean
  /** 是否要求布尔值。 */
  boolean?: boolean
  /** 是否要求有限数值。 */
  number?: boolean
  /** 最小数值、加权字符长度或数组长度。 */
  min?: number
  /** 最大数值、加权字符长度或数组长度。 */
  max?: number
  /** 指定加权字符长度或数组长度。 */
  len?: number
  /** 值必须属于的集合。 */
  enum?: readonly unknown[]
  /** 值必须匹配的正则表达式。 */
  pattern?: RegExp | string
  /** 检查日期对象或日期字符串，可自定义年月日格式。 */
  date?: boolean | DateOptions
  /** 检查邮件地址，可配置长度、国际字符及域名要求。 */
  email?: boolean | EmailOptions
  /** 检查网络地址，可配置协议及域名要求。 */
  url?: boolean | UrlOptions
  /** 检查中国大陆身份证号码的格式。 */
  idcard?: boolean
  /** 检查中国大陆手机号码的格式。 */
  telnumber?: boolean
  /** 自定义同步或异步校验函数，可检查表单其他字段。 */
  validator?: (value: any, context: FormRuleContext) => boolean | FormRuleFeedback | Promise<boolean | FormRuleFeedback>
  /** 不满足本条规则时的提示文字。 */
  message?: string
  /** 本条规则的错误或警告级别。 */
  type?: 'error' | 'warning'
  /** 触发时机，省略时为 change。 */
  trigger?: FormValidateTrigger
}

export interface FormRuleResult extends Omit<FormRule, 'type'>, FormRuleFeedback {}

export type FormRuleKey = Exclude<keyof FormRule, 'message' | 'type' | 'trigger'>
export type FormErrorMessage = Partial<Record<FormRuleKey, string>>
