import type { ImageUploadFile, ImageUploadProps, ImageUploadRequestContext, ImageUploadResponse, ImageUploadResult } from './types'

const imageTypes: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg', png: 'image/png', apng: 'image/apng',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp',
  ico: 'image/x-icon', tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic', heif: 'image/heif',
}

export function acceptsImage(file: File, accept: string) {
  const extension = file.name.match(/\.([^.]+)$/)?.[1].toLowerCase() ?? ''
  const mime = file.type.toLowerCase() || (Object.hasOwn(imageTypes, extension) ? imageTypes[extension] : '')
  if (!mime.startsWith('image/')) return false
  const tokens = accept.toLowerCase().split(',').map(token => token.trim()).filter(Boolean)
  return !tokens.length || tokens.some(token => token === 'image/*' || token === '*/*' || token === mime || token === '.' + extension)
}

export function maxBytes(limit: ImageUploadProps['sizeLimit']) {
  if (limit === undefined) return Infinity
  if (typeof limit === 'number') return limit * 1024
  return limit.size * { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[limit.unit]
}

export function postImage(file: ImageUploadFile, props: ImageUploadProps, context: ImageUploadRequestContext) {
  return new Promise<ImageUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const abort = () => xhr.abort()
    context.signal.throwIfAborted()
    xhr.open('POST', props.action!)
    xhr.withCredentials = !!props.withCredentials
    for (const [key, value] of Object.entries(props.headers ?? {})) xhr.setRequestHeader(key, value)
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total) context.onProgress(100 * event.loaded / event.total)
    }
    xhr.onload = () => {
      try {
        let body: unknown = xhr.responseText
        if (xhr.responseText) {
          try { body = JSON.parse(xhr.responseText) } catch { /* 文本接口可由 formatResponse 处理。 */ }
        }
        const response: ImageUploadResponse = props.formatResponse
          ? props.formatResponse(body, file)
          : body && typeof body === 'object' ? body as ImageUploadResponse : {}
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(response.error || `上传失败（HTTP ${xhr.status}）`)
        resolve({ status: response.error || response.status === 'fail' ? 'fail' : 'success', response })
      } catch (error) { reject(error) }
    }
    xhr.onerror = () => reject(new Error('网络异常，上传失败'))
    xhr.onabort = () => reject(new DOMException('上传已取消', 'AbortError'))
    xhr.onloadend = () => context.signal.removeEventListener('abort', abort)
    const data = new FormData()
    data.append(props.name ?? 'file', file.raw!, file.raw!.name)
    context.signal.addEventListener('abort', abort, { once: true })
    xhr.send(data)
  })
}
