
export const lightColors = {
  primary: '#1B2A56',          // Dark Navy Blue (matches screenshot button & titles #1B2A56 / #152244)
  'primary-hover': '#131B38',    // Deep Navy Hover
  'primary-soft': '#F1F4F9',     // Subtle Soft Blue-Gray
  background: '#F8F9FC',         // Off-white / light silver canvas from screenshot
  surface: '#FFFFFF',            // Crisp White Card / Content
  'surface-muted': '#F1F4F8',    // Table header & subtle background (#F1F4F8 / #EBF0F6)
  'text-primary': '#1A274E',     // Deep Navy-Black text for headings and labels
  'text-secondary': '#62718E',   // Muted slate navy for subtitles
  border: '#E3E8EF',             // Clean crisp table & card border
  gold: '#B68832',               // Gold accent bar & typography tone from screenshot
  'gold-soft': '#FBF6EB',        // Soft gold background
  success: '#107C41',
  'success-soft': '#E6F4EA',
  warning: '#C27803',
  'warning-soft': '#FEF3D6',
  error: '#C5221F',
  'error-soft': '#FCE8E6',
  info: '#1B2A56',
  'info-soft': '#EEF2F9',
  violet: '#5B4EB5',
  'violet-soft': '#F0EEFA',
}

export const darkColors = {
  primary: '#324C8C',
  'primary-hover': '#4365B6',
  'primary-soft': '#131C35',
  background: '#0B1120',
  surface: '#111827',
  'surface-muted': '#1E293B',
  'text-primary': '#F1F5F9',
  'text-secondary': '#94A3B8',
  border: '#1E293B',
  gold: '#D4AF37',
  'gold-soft': '#2A2312',
  success: '#22C55E',
  'success-soft': '#052E16',
  warning: '#F59E0B',
  'warning-soft': '#2D1B04',
  error: '#F87171',
  'error-soft': '#2A0F0F',
  info: '#38BDF8',
  'info-soft': '#083344',
  violet: '#A78BFA',
  'violet-soft': '#1E1537',
}

export const colorTokens = Object.keys(lightColors)

// Tailwind reads colours as `rgb(var(--hm-x) / alpha)` so opacity modifiers work.
export const tailwindColors = Object.fromEntries(
  colorTokens.map((token) => [token, `rgb(var(--hm-${token}) / <alpha-value>)`]),
)
