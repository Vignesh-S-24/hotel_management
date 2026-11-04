import { useState } from 'react'

// Single-series column chart (e.g. cleanings per day). Hover/focus a column to
// read its exact value; only the max and latest columns are direct-labelled.
export default function ColumnChart({ data, height = 160, label = 'Chart', valueSuffix = '' }) {
  const [active, setActive] = useState(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const lastIdx = data.length - 1
  const maxIdx = data.findIndex((d) => d.value === max)

  return (
    <figure aria-label={label}>
      <div className="relative">
        <div className="flex items-end gap-1 border-b border-border" style={{ height }}>
          {data.map((d, i) => {
            const showLabel = i === lastIdx || i === maxIdx || active === i
            return (
              <button
                key={d.key ?? d.label}
                type="button"
                className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${d.label}: ${d.value}${valueSuffix}`}
              >
                {showLabel && <span className="mb-1 text-[11px] font-medium tabular-nums text-text-primary">{d.value}</span>}
                <span
                  className={`w-full max-w-8 rounded-t ${active === i ? 'bg-primary-hover' : 'bg-primary'}`}
                  style={{ height: `${Math.max(2, (d.value / max) * (height - 22))}px` }}
                />
              </button>
            )
          })}
        </div>
        {active !== null && (
          <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-card">
            <span className="text-text-secondary">{data[active].label}</span>{' '}
            <span className="font-medium tabular-nums text-text-primary">
              {data[active].value}
              {valueSuffix}
            </span>
          </div>
        )}
      </div>
      <div className="mt-1.5 flex gap-1 text-[10px] text-text-secondary">
        {data.map((d, i) => (
          <span key={d.key ?? d.label} className="flex-1 truncate text-center">
            {i % Math.ceil(data.length / 7) === 0 || i === lastIdx ? d.short ?? d.label : ''}
          </span>
        ))}
      </div>
    </figure>
  )
}
