// 按码点遍历，截取到上限时保留完整的代理对。
export function measureText(text: string, weighted: boolean, limit = Infinity) {
  if (!weighted && text.length <= limit) return { length: text.length, text }
  let length = 0
  let end = 0
  for (const character of text) {
    const width = weighted && character.charCodeAt(0) > 127 ? 2 : character.length
    if (length + width > limit) break
    length += width
    end += character.length
  }
  return { length, text: text.slice(0, end) }
}
