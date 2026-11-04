import { AlertOctagon, Inbox } from 'lucide-react'

export default function CommonEmptyState({ icon, title = 'Nothing here yet', description, action, variant = 'empty', compact = false }) {
  const Icon = icon ?? (variant === 'error' ? AlertOctagon : Inbox)
  return (
    <div role={variant === 'error' ? 'alert' : undefined} className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-14'} px-4`}>
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${variant === 'error' ? 'bg-error-soft text-error' : 'bg-surface-muted text-text-secondary'}`}>
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
