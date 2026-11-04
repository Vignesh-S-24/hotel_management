
export const lightColors = {
  primary: '#2563EB',
  'primary-hover': '#1D4ED8',
  'primary-soft': '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  'surface-muted': '#F1F5F9',
  'text-primary': '#0F172A',
  'text-secondary': '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  'success-soft': '#F0FDF4',
  warning: '#D97706',
  'warning-soft': '#FFFBEB',
  error: '#DC2626',
  'error-soft': '#FEF2F2',
  info: '#0891B2',
  'info-soft': '#ECFEFF',
  violet: '#7C3AED',
  'violet-soft': '#F5F3FF',
}

export const darkColors = {
  primary: '#3B82F6',
  'primary-hover': '#60A5FA',
  'primary-soft': '#172554',
  background: '#0B1120',
  surface: '#111827',
  'surface-muted': '#1E293B',
  'text-primary': '#F1F5F9',
  'text-secondary': '#94A3B8',
  border: '#1E293B',
  success: '#22C55E',
  'success-soft': '#052E16',
  warning: '#F59E0B',
  'warning-soft': '#2D1B04',
  error: '#F87171',
  'error-soft': '#2A0F0F',
  info: '#22D3EE',
  'info-soft': '#083344',
  violet: '#A78BFA',
  'violet-soft': '#1E1537',
}

export const colorTokens = Object.keys(lightColors)

// Tailwind reads colours as `rgb(var(--hm-x) / alpha)` so opacity modifiers work.
export const tailwindColors = Object.fromEntries(
  colorTokens.map((token) => [token, `rgb(var(--hm-${token}) / <alpha-value>)`]),
)
