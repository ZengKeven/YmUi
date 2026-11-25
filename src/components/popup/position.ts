import type { PopupPlacement } from './types'

export function positionPanel(anchor: HTMLElement, panel: HTMLElement, preferred: PopupPlacement, showArrow = false) {
  const rect = anchor.getBoundingClientRect()
  panel.style.setProperty('--ym-popup-trigger-width', `${rect.width}px`)
  const { width, height } = panel.getBoundingClientRect()
  const { clientWidth, clientHeight } = anchor.ownerDocument.documentElement
  const space = { top: rect.top, bottom: clientHeight - rect.bottom, left: rect.left, right: clientWidth - rect.right }
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const
  const [direction, align] = preferred.split('-') as [keyof typeof opposite, string?]
  const other = opposite[direction]
  const gap = showArrow ? 7 : 0
  const aboveOrBelow = direction === 'top' || direction === 'bottom'
  const needed = (aboveOrBelow ? height : width) + gap
  const side = space[direction] < needed && space[other] > space[direction] ? other : direction
  let left = rect.left
  let top = rect.top
  if (side === 'bottom') top = rect.bottom + gap
  if (side === 'top') top -= height + gap
  if (side === 'right') left = rect.right + gap
  if (side === 'left') left -= width + gap
  if (align === 'right') left = rect.right - width
  if (align === 'bottom') top = rect.bottom - height
  if (align === 'center') {
    if (aboveOrBelow) left += (rect.width - width) / 2
    else top += (rect.height - height) / 2
  }
  left = Math.max(0, Math.min(left, clientWidth - width))
  top = Math.max(0, Math.min(top, clientHeight - height))
  panel.style.left = `${left}px`
  panel.style.top = `${top}px`
  panel.dataset.placement = side
  if (showArrow) {
    panel.style.setProperty('--ym-popup-arrow-x', `${Math.max(7, Math.min(width - 7, rect.left + rect.width / 2 - left))}px`)
    panel.style.setProperty('--ym-popup-arrow-y', `${Math.max(7, Math.min(height - 7, rect.top + rect.height / 2 - top))}px`)
  }
}
