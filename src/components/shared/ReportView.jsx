import { Download, Printer } from 'lucide-react'
import CommonButton from '../common/CommonButton'
import CommonCard, { StatCard } from '../common/CommonCard'
import CommonEmptyState from '../common/CommonEmptyState'
import { useToast } from '../common/CommonToast'
import { exportCsv } from '../../utils/exportCsv'
import BarList from './BarList'
import ColumnChart from './ColumnChart'

// Renders one report: KPI tiles, one chart, and the table view of the data
// (the table doubles as the accessible alternative to the chart).
export default function ReportView({ report, filename }) {
  const toast = useToast()
  const { stats, chart, columns, rows, note } = report

  const download = () => {
    exportCsv(filename, columns, rows)
    toast.success('Report exported', `${rows.length} rows saved as CSV (mock data).`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      {chart && (
        <CommonCard title={chart.title} subtitle={chart.subtitle}>
          {chart.kind === 'column' ? <ColumnChart data={chart.data} label={chart.title} valueSuffix={chart.suffix} /> : <BarList items={chart.data} valueSuffix={chart.suffix} />}
        </CommonCard>
      )}
      <CommonCard
        title="Report data"
        subtitle={note ?? `${rows.length} rows`}
        bodyClassName="p-0"
        actions={
          <div className="flex gap-2 print:hidden">
            <CommonButton size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>
              Export PDF
            </CommonButton>
            <CommonButton size="sm" icon={Download} onClick={download} disabled={!rows.length}>
              Export CSV
            </CommonButton>
          </div>
        }
      >
        {rows.length === 0 ? (
          <CommonEmptyState title="Nothing in this period" description="Widen the date range or clear the status filter." />
        ) : (
          <div className="relative max-h-[calc(100vh-16rem)] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-surface-muted shadow-sm text-xs uppercase tracking-wide text-text-secondary">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 200).map((r, i) => (
                  <tr key={r.id ?? i}>
                    {columns.map((c) => (
                      <td key={c.key} className="whitespace-nowrap px-4 py-2.5 text-text-primary">
                        {c.value ? c.value(r) : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CommonCard>
    </div>
  )
}
