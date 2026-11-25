import { toRaw } from 'vue'
import { measureText } from '../textarea/length'
import { validDate, validEmail, validUrl } from './formats'
import type {
  FormErrorMessage, FormRule, FormRuleContext, FormRuleFeedback, FormRuleKey, FormRuleResult, FormValidateTrigger,
} from './rule-types'

function fieldPath(data: object, name: string): string[] {
  if (!name) return []
  // 独立的键优先，规则表既可嵌套，也可直接使用 "items[0].name" 作为键。
  const keys = name in data && Object.hasOwn(data, name) ? [name] : Array.from(
    name.matchAll(/\[(?:"([^"]*)"|'([^']*)')\]|([^.[\]]+)/g), part => part[1] ?? part[2] ?? part[3],
  )
  return keys.some(key => ['__proto__', 'prototype', 'constructor'].includes(key)) ? [] : keys
}

export function getField(data: object | undefined, name: string): unknown {
  if (!data) return undefined
  const keys = fieldPath(data, name)
  if (!keys.length) return undefined
  let current: unknown = data
  for (const key of keys) {
    if (current === null || typeof current !== 'object' || !(key in current) || !Object.hasOwn(current, key)) return undefined
    current = Reflect.get(current, key)
  }
  return current
}

export function setField(data: object, name: string, value: unknown) {
  const keys = fieldPath(data, name)
  let target = data
  for (const [index, key] of keys.entries()) {
    if (index === keys.length - 1) {
      Reflect.set(target, key, value)
      return
    }
    const child = Object.hasOwn(target, key) ? Reflect.get(target, key) : undefined
    if (typeof child !== 'object' || child === null) {
      Reflect.set(target, key, /^\d+$/.test(keys[index + 1]) ? [] : {})
    }
    target = Reflect.get(target, key)
  }
}

function plainRecord(value: object) {
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

// 数组、对象和集合各自保存快照。文件等原生对象保留原实例及其行为。
export function cloneField(value: unknown, seen = new WeakMap<object, unknown>()): unknown {
  const raw = toRaw(value)
  if (raw === null || typeof raw !== 'object') return raw
  if (seen.has(raw)) return seen.get(raw)
  if (raw instanceof Date) return new Date(raw.getTime())
  if (raw instanceof Map) {
    const copy = new Map()
    seen.set(raw, copy)
    for (const [key, item] of raw) copy.set(key, cloneField(item, seen))
    return copy
  }
  if (raw instanceof Set) {
    const copy = new Set()
    seen.set(raw, copy)
    for (const item of raw) copy.add(cloneField(item, seen))
    return copy
  }
  if (!Array.isArray(raw) && !plainRecord(raw)) return raw
  const copy = Array.isArray(raw) ? new Array(raw.length) : Object.create(Object.getPrototypeOf(raw))
  seen.set(raw, copy)
  for (const [key, item] of Object.entries(raw)) {
    Object.defineProperty(copy, key, { value: cloneField(item, seen), writable: true, enumerable: true, configurable: true })
  }
  return copy
}

export function emptyField(value: unknown): unknown {
  if (typeof value === 'string') return ''
  if (Array.isArray(value)) return []
  if (value !== null && typeof value === 'object' && plainRecord(value)) return {}
  return undefined
}

function isEmpty(value: unknown) {
  if (value == null || value === '') return true
  if (Array.isArray(value)) return !value.length
  if (value instanceof Set || value instanceof Map) return !value.size
  return typeof value === 'object' && plainRecord(value) && !Object.keys(value).length
}

function lengthOf(value: unknown) {
  return Array.isArray(value) ? value.length : measureText(String(value), true).length
}

const messages = {
  required: '${name}必填', whitespace: '${name}不能为空', boolean: '${name}必须是布尔值', number: '${name}必须是数字',
  min: '${name}不能少于 ${validate}', max: '${name}不能超过 ${validate}', len: '${name}长度必须是 ${validate}',
  enum: '${name}必须是 ${validate} 中的一项', pattern: '请输入正确的${name}', telnumber: '请输入正确的${name}',
  idcard: '请输入正确的${name}', date: '请输入正确的${name}', email: '请输入正确的${name}', url: '请输入正确的${name}',
  validator: '${name}不符合要求',
} satisfies Record<FormRuleKey, string>

export function matchesTrigger(rule: FormRule, trigger: FormValidateTrigger) {
  return trigger === 'all' || rule.trigger === 'all' || (rule.trigger ?? 'change') === trigger
}

function testRule(key: FormRuleKey, rule: FormRule, value: unknown, context: FormRuleContext) {
  switch (key) {
    case 'required': return !isEmpty(value)
    case 'whitespace': return typeof value !== 'string' || !!value.trim()
    case 'boolean': return typeof value === 'boolean'
    case 'number': return Number.isFinite(value)
    case 'min': return (typeof value === 'number' ? value : lengthOf(value)) >= rule.min!
    case 'max': return (typeof value === 'number' ? value : lengthOf(value)) <= rule.max!
    case 'len': return lengthOf(value) === rule.len
    case 'enum': return rule.enum!.includes(value)
    case 'pattern': return new RegExp(rule.pattern!).test(String(value))
    case 'idcard': return /^(?:\d{15}|\d{17}[\dX])$/i.test(String(value))
    case 'telnumber': return /^1[3-9]\d{9}$/.test(String(value))
    case 'date': return validDate(value, rule.date)
    case 'email': return validEmail(value, rule.email)
    case 'url': return validUrl(value, rule.url)
    case 'validator': return rule.validator!(value, context)
  }
}

type ValidationContext = FormRuleContext & { label?: string; errorMessage?: FormErrorMessage }

async function validateRule(value: unknown, rule: FormRule, context: ValidationContext): Promise<FormRuleResult> {
  if (!rule.required && !rule.validator && isEmpty(value)) return { result: true }
  // 与参考表单一致，每个规则对象选取第一个启用的条件，多项约束依次写入规则数组。
  const key = (Object.keys(rule) as FormRuleKey[]).find(
    key => Object.hasOwn(messages, key) && rule[key] != null && rule[key] !== false,
  )
  if (!key) return { result: true }
  let feedback: FormRuleFeedback
  try {
    const result = await testRule(key, rule, value, context)
    feedback = result && typeof result === 'object' ? result : { result: result === true }
  } catch (error) {
    const reason = error instanceof Error ? error.message : typeof error === 'string' ? error : undefined
    feedback = { result: false, message: rule.message ?? reason }
  }
  if (feedback.result) return { ...rule, ...feedback }
  const template = feedback.message ?? rule.message ?? context.errorMessage?.[key] ?? messages[key]
  const message = template.replace(/\$\{(\w+)\}/g, (token, name: string) => {
    if (name === 'name') return context.label || context.name
    if (name === 'validate' || name === key) return String(rule[key])
    return token
  })
  return { ...rule, ...feedback, type: feedback.type ?? rule.type ?? 'error', message }
}

export function validateRules(value: unknown, rules: readonly FormRule[], context: ValidationContext) {
  return Promise.all(rules.map(rule => validateRule(value, rule, context)))
}
