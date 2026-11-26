import type { ChatSearchReference } from './types'

export function hasSearchTitle(item: ChatSearchReference) {
  return typeof item?.title === 'string' && item.title.trim().length > 0
}
