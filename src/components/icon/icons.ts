import { systemIcons } from './glyphs/system'
import { toolIcons } from './glyphs/tools'
import { actionIcons } from './glyphs/actions'
import { menuIcons } from './glyphs/menus'
import { businessIcons } from './glyphs/business'

// 普通轮廓共用方头描边。圆点、裁切轮廓等实色细节使用独立的填充路径。
export type IconDrawing = string | { outline?: string; fill: string }

// 按选型清单的大类顺序注册，图形共用 24 × 24 的 SVG 坐标系。
export const iconPaths = {
  ...systemIcons,
  ...toolIcons,
  ...actionIcons,
  ...menuIcons,
  ...businessIcons,
} satisfies Record<string, IconDrawing>
