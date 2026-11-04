import { ChevronLeft, ChevronRight } from 'lucide-react'
import CommonDropdown from './CommonDropdown'
import { PAGE_SIZE_OPTIONS } from '../../utils/constants'

export default function CommonPagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  const base = 'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm disabled:opacity-40'
  const btn = `${base} border-border bg-surface text-text-primary hover:bg-surface-muted disabled:hover:bg-surface`
  const current = `${base} border-primary bg-primary font-medium text-white`

  const pages = []
  for (let p = Math.max(1, page - 1); p <= Math.min(pageCount, page + 1); p += 1) pages.push(p)

  return (
    <nav className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-surface/95 px-4 py-3 text-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between" aria-label="Pagination">
      <div className="flex items-center gap-3 text-text-secondary">
        <span>
          {from}–{to} of {total}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <CommonDropdown
              size="sm"
              className="w-16"
              value={pageSize}
              onChange={(v) => onPageSizeChange(Number(v))}
              options={PAGE_SIZE_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
              label="Rows per page"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className={btn} onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages[0] > 1 && <span className="px-1 text-text-secondary">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={p === page ? current : btn}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < pageCount && <span className="px-1 text-text-secondary">…</span>}
        <button type="button" className={btn} onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
