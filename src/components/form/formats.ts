import { parseDate } from '../calendar/dates'
import type { FormRule } from './rule-types'

export function validDate(value: unknown, options: FormRule['date']) {
  if (value instanceof Date) return Number.isFinite(value.getTime())
  if (typeof value !== 'string') return false
  const config = typeof options === 'object' ? options : {}
  const format = (config.format ?? 'YYYY/MM/DD').toUpperCase()
  const tokens = format.match(/YYYY|YY|MM?|DD?/g)
  const parts = value.match(/^(\d{1,4})(\D)(\d{1,4})\2(\d{1,4})$/)
  if (!tokens || tokens.length !== 3 || !parts) return false
  const separator = parts[2]
  if (config.strictMode ? !format.includes(separator) : !(config.delimiters ?? ['/', '-']).includes(separator)) return false
  const digits = [parts[1], parts[3], parts[4]]
  const date: Record<string, string> = {}
  for (const [index, token] of tokens.entries()) {
    const part = digits[index]
    if (config.strictMode && (token.length === 1 ? part !== String(Number(part)) : token.length !== part.length)) return false
    if (token.startsWith('Y') && part.length !== token.length) return false
    if (!token.startsWith('Y') && part.length > 2) return false
    date[token[0]] = token === 'YY' ? '20' + part : part.padStart(2, '0')
  }
  return !!parseDate(`${date.Y}-${date.M}-${date.D}`)
}

function validDomain(domain: string, requireTld: boolean) {
  const labels = domain.split('.')
  if (domain.length > 253 || labels.some(label => !/^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u.test(label))) return false
  const tld = labels[labels.length - 1]
  return !requireTld || (labels.length > 1 && tld.length >= 2 && !/^\d+$/.test(tld))
}

export function validEmail(value: unknown, options: FormRule['email']) {
  if (typeof value !== 'string') return false
  const config = typeof options === 'object' ? options : {}
  const at = value.lastIndexOf('@')
  if (at < 1) return false
  const local = value.slice(0, at)
  if (!config.ignore_max_length) {
    const encoder = new TextEncoder()
    if (encoder.encode(local).length > 64 || encoder.encode(value).length > 254) return false
  }
  if (config.allow_utf8_local_part === false && /[^\x00-\x7f]/.test(local)) return false
  const quoted = /^"(?:[^"\\\r\n]|\\[^\r\n])*"$/.test(local)
  if (!quoted && !local.split('.').every(atom => /^[\p{L}\p{M}\p{N}!#$%&'*+\-/=?^_`{|}~]+$/u.test(atom))) return false
  return validDomain(value.slice(at + 1), config.require_tld !== false)
}

export function validUrl(value: unknown, options: FormRule['url']) {
  if (typeof value !== 'string' || /[\s\\]/.test(value) || value.startsWith('//')) return false
  const config = typeof options === 'object' ? options : {}
  const protocol = value.match(/^([a-z][a-z\d+.-]*):\/\//i)?.[1].toLowerCase()
  if (config.require_protocol && !protocol) return false
  if (protocol && !(config.protocols ?? ['http', 'https', 'ftp']).includes(protocol)) return false
  try {
    const { hostname } = new URL(protocol ? value : `http://${value}`)
    return hostname.startsWith('[') || /^\d+(\.\d+){3}$/.test(hostname) || validDomain(hostname, config.require_tld !== false)
  } catch {
    return false
  }
}
