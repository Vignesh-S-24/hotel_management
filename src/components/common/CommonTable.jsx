import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import CommonEmptyState from './CommonEmptyState'
import { Skeleton } from './CommonLoader'

export default function CommonTable({
  columns,
  rows,
  rowKey = 'id',
  sort,
  onSort,
  onRowClick,
  loading = false,
  emptyState,
  caption,
}) {
  const cell = (col, row) => (col.render ? col.render(row) : row[col.key] ?? '—')

  if (loading) {
    return (
      <div className="space-y-2 p-4" role="status" aria-label="Loading rows">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>
    )
  }

  if (!rows || !rows.length) {
    return (
      emptyState ?? (
        <CommonEmptyState
          title="No records found"
          description="Try adjusting your search or filters."
        />
      )
    )
  }

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (sort?.key !== col.key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40 ml-1 inline" aria-hidden />
    return sort.dir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 inline text-primary" aria-hidden />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 inline text-primary" aria-hidden />
    )
  }

  const primary = columns.find((c) => c.primary) ?? columns[0]
  const rest = columns.filter((c) => c !== primary && c.mobile !== false)

  return (
    <div className="rounded-xl bg-surface overflow-hidden border border-border">
      {/* Desktop Table View */}
      <div className="relative hidden max-h-[calc(100vh-14rem)] overflow-auto md:block scrollbar-thin">
        <table className="w-full text-left text-sm border-collapse">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-10 bg-surface-muted border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-text-secondary ${
                    col.className ?? ''
                  }`}
                  aria-sort={
                    sort?.key === col.key
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(col.key)}
                      className="inline-flex items-center gap-1 uppercase hover:text-text-primary transition-colors"
                    >
                      {col.header}
                      <SortIcon col={col} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface text-text-primary [&>tr:first-child]:border-t-0">
            {rows.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors hover:bg-surface-muted/60 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-middle text-xs text-text-primary ${
                      col.className ?? ''
                    }`}
                  >
                    {cell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <ul className="divide-y divide-border md:hidden bg-surface">
        {rows.map((row, idx) => (
          <li key={row[rowKey] ?? idx}>
            <div
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined
              }
              className={`p-4 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-surface-muted/60' : ''
              }`}
            >
              <div className="font-semibold text-sm text-text-primary">
                {cell(primary, row)}
              </div>
              {rest.length > 0 && (
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                  {rest.map((col) => (
                    <div key={col.key} className="space-y-0.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        {col.header}
                      </span>
                      <div className="text-xs text-text-primary font-medium">
                        {cell(col, row)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
