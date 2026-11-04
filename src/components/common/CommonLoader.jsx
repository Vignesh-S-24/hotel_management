import { Loader2 } from 'lucide-react'

export default function CommonLoader({ label = 'Loading…', fullPage = false, className = '' }) {
  return (
    <div role="status" aria-live="polite" className={`flex items-center justify-center gap-2 text-sm text-text-secondary ${fullPage ? 'min-h-[60vh]' : 'py-12'} ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-surface-muted ${className}`} aria-hidden />
}

export function PageSkeleton({ cards = 4, rows = 5 }) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading content">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: cards }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="card space-y-3 p-5">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </div>
  )
}
