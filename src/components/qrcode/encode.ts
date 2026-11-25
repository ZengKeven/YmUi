import { Ecc, QrCode, QrSegment } from './qrcodegen'

const levels = { L: Ecc.LOW, M: Ecc.MEDIUM, Q: Ecc.QUARTILE, H: Ecc.HIGH }

export function encodeQRCode(value: string, level: keyof typeof levels): boolean[][] {
  // 版本 40-L 的纯数字模式可容纳 7089 位，是所有编码模式的上限。
  if (value.length > 7089) throw new RangeError('Data too long')
  const segments = QrSegment.makeSegments(value)
  // ECI 26 明示 UTF-8，扫码器无需猜测中文或表情的编码。
  if (/[^\x00-\x7f]/.test(value)) segments.unshift(QrSegment.makeEci(26))
  return QrCode.encodeSegments(segments, levels[level]).getModules()
}
