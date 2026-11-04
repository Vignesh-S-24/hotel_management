const TONES = {
  neutral: 'bg-surface-muted text-text-secondary ring-border',
  primary: 'bg-primary-soft text-primary ring-primary/20',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning-soft text-warning ring-warning/25',
  error: 'bg-error-soft text-error ring-error/20',
  info: 'bg-info-soft text-info ring-info/20',
  violet: 'bg-violet-soft text-violet ring-violet/20',
}

const DOTS = {
  neutral: 'bg-text-secondary',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  violet: 'bg-violet',
}

export default function CommonBadge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone] ?? TONES.neutral} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone] ?? DOTS.neutral}`} aria-hidden />}
      {children}
    </span>
  )
}

export const toneDot = DOTS
