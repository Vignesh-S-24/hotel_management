import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown } from 'lucide-react'
import { DATE_PRESETS } from '../../hooks/useDateRange'
import { toInputDate } from '../../utils/formatDate'
import CommonButton from '../common/CommonButton'

// Preset + custom date range picker; pair with useDateRange().
export default function DateRangeFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(value.from)
  const [to, setTo] = useState(value.to)
  const rootRef = useRef(null)
  const today = toInputDate()

  useEffect(() => {
    if (!open) return undefined
    setFrom(value.from)
    setTo(value.to)
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open, value.from, value.to])

  const pick = (next) => {
    onChange(next)
    setOpen(false)
  }

  const validCustom = from && to && from <= to

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted"
      >
        <CalendarDays className="h-4 w-4 text-text-secondary" aria-hidden />
        <span className="max-w-[14rem] truncate">{value.label}</span>
        <ChevronDown className="h-4 w-4 text-text-secondary" aria-hidden />
      </button>

      {open && (
        <div role="dialog" aria-label="Filter by date" className="animate-pop-in absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-overlay">
          <ul className="py-1">
            {DATE_PRESETS.map((p) => {
              const active = value.preset === p.value
              return (
                <li key={p.value}>
                  <button
                    type="button"
                    onClick={() => pick({ preset: p.value })}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-surface-muted ${active ? 'font-medium text-primary' : 'text-text-primary'}`}
                  >
                    {p.label}
                    {active && <Check className="h-4 w-4" aria-hidden />}
                  </button>
                </li>
              )
            })}
          </ul>
          <form
            className="space-y-3 border-t border-border p-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (validCustom) pick({ preset: 'custom', from, to })
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Custom range</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-text-secondary">
                From
                <input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} className="field-control mt-1 px-2 text-sm" />
              </label>
              <label className="text-xs text-text-secondary">
                To
                <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} className="field-control mt-1 px-2 text-sm" />
              </label>
            </div>
            <CommonButton type="submit" size="md" fullWidth disabled={!validCustom}>
              Apply
            </CommonButton>
          </form>
        </div>
      )}
    </div>
  )
}
