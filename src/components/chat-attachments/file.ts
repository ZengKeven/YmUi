/** 识别本窗口和其他窗口选择的 File，保留本地图片预览。 */
export function isAttachmentFile(value: unknown): value is File {
  if (typeof File === 'undefined' || !value || typeof value !== 'object') return false
  try {
    // File 的原生 getter 同样接受 iframe 中创建的文件。
    return typeof Reflect.get(File.prototype, 'name', value) === 'string'
  } catch {
    return false
  }
}
