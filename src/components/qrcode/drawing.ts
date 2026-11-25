import type { QRCodeProps } from './types'

// 四周各留四个模块的静区，随码图等比例缩放。
const quietZone = 4

export function createDrawing(cells: boolean[][], displaySize: number, iconSize?: QRCodeProps['iconSize']) {
  const side = cells.length + quietZone * 2
  const scale = side / displaySize
  const width = (typeof iconSize === 'number' ? iconSize : iconSize?.width ?? 0) * scale
  const height = (typeof iconSize === 'number' ? iconSize : iconSize?.height ?? 0) * scale
  const icon = width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height)
    ? { x: (side - width) / 2, y: (side - height) / 2, width, height } : undefined

  // 合并同一行中相连的深色模块。中心图标加载成功后才为它留出完整的模块。
  const runs: string[] = []
  for (const [row, cellsInRow] of cells.entries()) {
    const y = row + quietZone
    let start = 0
    let length = 0
    for (let column = 0; column <= cellsInRow.length; column++) {
      const x = column + quietZone
      const behindIcon = icon && y + 1 > icon.y && y < icon.y + icon.height &&
        x + 1 > icon.x && x < icon.x + icon.width
      if (cellsInRow[column] && !behindIcon) {
        if (length === 0) start = x
        length++
      } else if (length > 0) {
        runs.push(`M${start} ${y}h${length}v1H${start}z`)
        length = 0
      }
    }
  }
  return { side, path: runs.join(''), icon }
}

export function paintCanvas(canvas: HTMLCanvasElement, drawing: ReturnType<typeof createDrawing>,
  pixelSize: number, ink: string, paper: string, image: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // 每个模块占整数个设备像素，避免相邻码点间出现抗锯齿细缝。
  const scale = Math.max(1, Math.ceil(pixelSize / drawing.side))
  const pixels = drawing.side * scale
  canvas.width = canvas.height = pixels
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, drawing.side, drawing.side)
  ctx.fillStyle = ink
  ctx.fill(new Path2D(drawing.path))
  if (image && drawing.icon) {
    const { x, y, width, height } = drawing.icon
    ctx.drawImage(image, x, y, width, height)
  }
}
