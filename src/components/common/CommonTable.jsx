import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import CommonEmptyState from './CommonEmptyState'
import { Skeleton } from './CommonLoader'

// columns: [{ key, header, render?(row), sortable?, className?, mobile?: false, primary?: true }]
// Desktop (md+) renders a table; small screens render one card per row.
export default function CommonTable({ columns, rows, rowKey = 'id', sort, onSort, onRowClick, loading = false, emptyState, caption }) {
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

  if (!rows.length) return emptyState ?? <CommonEmptyState title="No records found" description="Try adjusting your search or filters." />

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (sort?.key !== col.key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />
    return sort.dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" aria-hidden /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden />
  }

  const primary = columns.find((c) => c.primary) ?? columns[0]
  const rest = columns.filter((c) => c !== primary && c.mobile !== false)

  return (
    <>
      <div className="relative hidden max-h-[calc(100vh-16rem)] overflow-auto md:block">
        <table className="w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-10 border-b border-border bg-surface-muted shadow-sm text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 font-medium ${col.className ?? ''}`}
                  aria-sort={sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button type="button" onClick={() => onSort?.(col.key)} className="inline-flex items-center gap-1 uppercase hover:text-text-primary">
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
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-muted/60' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                    {cell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => (
          <li key={row[rowKey]}>
            <div
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              className={`space-y-2 px-4 py-3 ${onRowClick ? 'active:bg-surface-muted' : ''}`}
            >
              <div className="font-medium text-text-primary">{cell(primary, row)}</div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {rest.map((col) => (
                  <div key={col.key} className={col.key === 'actions' ? 'col-span-2' : 'min-w-0'}>
                    {col.key !== 'actions' && <dt className="text-text-secondary">{col.header}</dt>}
                    <dd className="mt-0.5 truncate text-text-primary">{cell(col, row)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
