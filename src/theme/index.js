import { lightColors, darkColors, colorTokens } from './colors.js'

export { lightColors, darkColors, tailwindColors } from './colors.js'
export { typography, fontFamily } from './typography.js'
export { spacing, layout } from './spacing.js'

const hexToChannels = (hex) => {
  const value = hex.replace('#', '')
  const n = parseInt(value, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export function applyTheme(mode = 'light') {
  const palette = mode === 'dark' ? darkColors : lightColors
  const root = document.documentElement
  colorTokens.forEach((token) => {
    root.style.setProperty(`--hm-${token}`, hexToChannels(palette[token]))
  })
  root.dataset.theme = mode
  root.style.colorScheme = mode
}
