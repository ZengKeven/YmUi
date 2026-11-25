import type { SharedUploadProps, UploadFile, UploadFilesOptions, UploadRequestContext, UploadRequestOptions, UploadResponse, UploadResult } from './types'

export function acceptsFile(file: Pick<File, 'name' | 'type'>, accept: string) {
  const tokens = accept.toLowerCase().split(',').map(token => token.trim()).filter(Boolean)
  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()
  return !tokens.length || tokens.some(token => {
    if (token === '*/*') return true
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1))
    return mime === token
  })
}

export function maxBytes(limit: SharedUploadProps['sizeLimit']) {
  if (limit === undefined) return Infinity
  if (typeof limit === 'number') return limit * 1024
  return limit.size * { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[limit.unit]
}

export function toUploadFile(raw: File): UploadFile {
  return { raw, name: raw.name, type: raw.type, size: raw.size, status: 'waiting' }
}

function postFile(file: UploadFile, options: UploadRequestOptions, context: UploadRequestContext) {
  return new Promise<UploadResult>((resolve, reject) => {
    if (!options.action || !file.raw) throw new Error('缺少上传地址或原始文件')
    const xhr = new XMLHttpRequest()
    xhr.open('POST', options.action)
    xhr.withCredentials = !!options.withCredentials
    for (const [key, value] of Object.entries(options.headers ?? {})) xhr.setRequestHeader(key, value)
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total) context.onProgress(100 * event.loaded / event.total)
    }
    xhr.onload = () => {
      try {
        let body: unknown = xhr.responseText
        if (xhr.responseText) {
          try { body = JSON.parse(xhr.responseText) } catch { /* 保留文本响应供 formatResponse 解析。 */ }
        }
        const response: UploadResponse = options.formatResponse
          ? options.formatResponse(body, file)
          : body && typeof body === 'object' ? body as UploadResponse : {}
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(response.error || `上传失败（HTTP ${xhr.status}）`)
        resolve({ status: response.error || response.status === 'fail' ? 'fail' : 'success', response })
      } catch (error) { reject(error) }
    }
    xhr.onerror = () => reject(new Error('网络异常，上传失败'))
    xhr.onabort = () => reject(context.signal.reason)
    const abort = () => xhr.abort()
    xhr.onloadend = () => context.signal.removeEventListener('abort', abort)
    const data = new FormData()
    data.append(options.name ?? 'file', file.raw, file.raw.name)
    xhr.send(data)
    context.signal.addEventListener('abort', abort, { once: true })
  })
}

// 自定义请求可以自行监听 signal；即使它不处理取消，也要及时结束调用方的等待。
function customRequest(method: NonNullable<UploadRequestOptions['requestMethod']>, file: UploadFile, context: UploadRequestContext) {
  const { signal } = context
  return new Promise<UploadResult>((resolve, reject) => {
    const abort = () => reject(signal.reason)
    signal.addEventListener('abort', abort, { once: true })
    Promise.resolve().then(() => {
      signal.throwIfAborted()
      return method(file, context)
    }).then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}

export async function requestFile(file: UploadFile, options: UploadRequestOptions, context: UploadRequestContext): Promise<UploadResult> {
  let active = true
  const progress: UploadRequestContext = {
    signal: context.signal,
    onProgress(value) {
      if (active && !context.signal.aborted && Number.isFinite(value)) {
        context.onProgress(Math.min(100, Math.max(0, Math.round(value))))
      }
    },
  }
  try {
    context.signal.throwIfAborted()
    return options.requestMethod
      ? await customRequest(options.requestMethod, file, progress)
      : await postFile(file, options, progress)
  } catch (error) {
    return { status: 'fail', error: error instanceof Error ? error.message : '上传失败' }
  } finally {
    active = false
  }
}

export function finishFile(file: UploadFile, result: UploadResult, percent: number): UploadFile {
  if (result?.status !== 'success' || result.error || result.response?.error) {
    const error = result?.error || result?.response?.error || '上传失败'
    return { ...file, status: 'fail', percent, response: { ...result?.response, error } }
  }
  return { ...file, status: 'success', percent: 100, response: result.response, url: result.response?.url || file.url }
}

/** 上传单个或多个文件，按传入顺序返回每个文件的结果。 */
export async function uploadFiles(input: File | readonly File[], options: UploadFilesOptions = {}): Promise<UploadFile[]> {
  const list: readonly File[] = Array.isArray(input) ? input : [input as File]
  if (!list.length) return []
  const signal = options.signal ?? new AbortController().signal
  signal.throwIfAborted()
  if (!options.action && !options.requestMethod) throw new TypeError('请提供 action 或 requestMethod')
  return Promise.all(list.map(async raw => {
    const file = toUploadFile(raw)
    let percent = 0
    const result = await requestFile(file, options, {
      signal,
      onProgress(value) {
        percent = value
        options.onProgress?.({ ...file, status: 'progress', percent }, percent)
      },
    })
    signal.throwIfAborted()
    return finishFile(file, result, percent)
  }))
}
