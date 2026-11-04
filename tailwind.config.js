import { tailwindColors } from './src/theme/colors.js'
import { fontFamily } from './src/theme/typography.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: tailwindColors,
      fontFamily: { sans: fontFamily.sans },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        overlay: '0 20px 40px -12px rgb(15 23 42 / 0.25)',
      },
    },
  },
  plugins: [],
}
