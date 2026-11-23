import type { PopupPlacement } from './types'

export function positionPanel(anchor: HTMLElement, panel: HTMLElement, preferred: PopupPlacement) {
  const rect = anchor.getBoundingClientRect()
  panel.style.setProperty('--ym-popup-trigger-width', `${rect.width}px`)
  const { width, height } = panel.getBoundingClientRect()
  const { clientWidth, clientHeight } = anchor.ownerDocument.documentElement
  const space = { top: rect.top, bottom: clientHeight - rect.bottom, left: rect.left, right: clientWidth - rect.right }
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const
  const other = opposite[preferred]
  const needed = preferred === 'top' || preferred === 'bottom' ? height : width
  const side = space[preferred] < needed && space[other] > space[preferred] ? other : preferred
  let left = rect.left
  let top = rect.top
  if (side === 'bottom') top = rect.bottom
  if (side === 'top') top -= height
  if (side === 'right') left = rect.right
  if (side === 'left') left -= width
  panel.style.left = `${Math.max(0, Math.min(left, clientWidth - width))}px`
  panel.style.top = `${Math.max(0, Math.min(top, clientHeight - height))}px`
}
