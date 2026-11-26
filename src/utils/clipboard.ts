/** 在没有 Clipboard API 的浏览器中复制文字，完成后将焦点还给触发元素。 */
export function copyWithSelection(text: string) {
  const previous = document.activeElement
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.style.cssText = 'position:fixed;top:0;left:-10000px'
  document.body.append(field)
  try {
    field.select()
    return document.execCommand('copy')
  } finally {
    field.remove()
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
  }
}
