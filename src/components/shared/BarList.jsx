// Single-hue horizontal bar list: label + value in text ink, bar carries magnitude.
// Each row is a hover/focus target with a native tooltip and an optional link.
import { Link } from 'react-router-dom'

export default function BarList({ items, valueSuffix = '', emptyLabel = 'No data' }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <p className="py-6 text-center text-sm text-text-secondary">{emptyLabel}</p>

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const row = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-text-primary">{item.label}</span>
              <span className="shrink-0 tabular-nums font-medium text-text-primary">
                {item.value}
                {valueSuffix}
              </span>
            </div>
            <div className="mt-1 h-2 rounded bg-surface-muted">
              <div className="h-2 rounded bg-primary transition-[width] group-hover:bg-primary-hover" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </>
        )
        return (
          <li key={item.key ?? item.label} title={`${item.label}: ${item.value}${valueSuffix}`}>
            {item.to ? (
              <Link to={item.to} className="group block rounded-md px-1 py-0.5 hover:bg-surface-muted/60">
                {row}
              </Link>
            ) : (
              <div className="group px-1 py-0.5">{row}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
