import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function CommonCard({ title, subtitle, actions, children, className = '', bodyClassName = 'p-4 sm:p-5', as: Tag = 'section' }) {
  return (
    <Tag className={`card ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-text-primary">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  )
}

const ICON_TONES = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  info: 'bg-info-soft text-info',
  violet: 'bg-violet-soft text-violet',
  neutral: 'bg-surface-muted text-text-secondary',
}

// Interactive KPI tile. Renders as a link when `to` is given.
export function StatCard({ label, value, icon: Icon, tone = 'primary', hint, to }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-text-secondary">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_TONES[tone]}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
      {hint && (
        <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
          {hint}
          {to && <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />}
        </p>
      )}
    </>
  )
  const cls = 'card group block p-4 transition'
  return to ? (
    <Link to={to} className={`${cls} hover:border-primary/40`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
