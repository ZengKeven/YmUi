import type { settings } from './settings'

export interface PreviewSource {
  template: string
  scriptParts: (string | { binding: string })[]
  style: string
}

function literal(value: unknown) {
  // 文本可能包含 </script>，不能让输入提前结束 Vue 的脚本块。
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

export function renderPreviewSource(source: PreviewSource, state: Record<string, unknown>, config: typeof settings) {
  const script = source.scriptParts.map(part => {
    if (typeof part === 'string') return part
    if (!Object.hasOwn(state, part.binding)) throw new Error(`Missing preview state: ${part.binding}`)
    const value = state[part.binding]
    return value === undefined ? '' : literal(value)
  }).join('')
  const preview = source.template.split('\n').map(line => line ? `    ${line}` : '').join('\n')
  const globalConfig = [
    'const globalConfig = {',
    `  mode: ${literal(config.mode)}, size: ${literal(config.size)}, radius: ${literal(config.radius)},`,
    '  theme: {',
    `    light: { primary: ${literal(config.lightPrimary)} },`,
    `    dark: { primary: ${literal(config.darkPrimary)} },`,
    '  },',
    '} as const',
  ].join('\n')
  return [
    `<script setup lang="ts" vapor>\n${script.trim()}\n\n${globalConfig}\n</script>`,
    `<template>\n  <ConfigProvider v-bind="globalConfig">\n${preview}\n  </ConfigProvider>\n</template>`,
    source.style,
  ].filter(Boolean).join('\n\n') + '\n'
}
