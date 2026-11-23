import type { SelectKey } from '../select'
import type { TreeSelectOption } from './types'

export interface TreeRow {
  option: TreeSelectOption
  level: number
  parent: TreeRow | null
  disabled: boolean
  hasChildren: boolean
  index: number
}

export function buildTreeRows(options: readonly TreeSelectOption[], disabledLevels: readonly number[]): TreeRow[] {
  const rows: TreeRow[] = []
  const levels = new Set(disabledLevels)
  const pending: { option: TreeSelectOption; parent: TreeRow | null }[] =
    options.map(option => ({ option, parent: null })).reverse()
  while (pending.length) {
    const { option, parent } = pending.pop()!
    const level = (parent?.level ?? 0) + 1
    const children = option.children ?? []
    const row = {
      option, level, parent, index: rows.length,
      disabled: Boolean(option.disabled) || levels.has(level),
      hasChildren: children.length > 0,
    }
    rows.push(row)
    for (let i = children.length - 1; i >= 0; i--) {
      pending.push({ option: children[i], parent: row })
    }
  }
  return rows
}

export function visibleTreeRows(rows: readonly TreeRow[], expanded: ReadonlySet<SelectKey>, keyword: string): TreeRow[] {
  const term = keyword.trim().toLocaleLowerCase()
  if (term) {
    // 子节点排在父节点之后，倒序遍历即可在一次扫描内补齐所有匹配路径。
    const matches = new Set<TreeRow>()
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i]
      if (matches.has(row) || row.option.label.toLocaleLowerCase().includes(term)) {
        matches.add(row)
        if (row.parent) matches.add(row.parent)
      }
    }
    return rows.filter(row => matches.has(row))
  }

  const openBranches = new Set<TreeRow>()
  return rows.filter(row => {
    if (row.parent && !openBranches.has(row.parent)) return false
    if (row.hasChildren && expanded.has(row.option.value)) openBranches.add(row)
    return true
  })
}
