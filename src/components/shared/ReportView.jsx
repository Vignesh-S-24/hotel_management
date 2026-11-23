import { Download, Printer } from 'lucide-react'
import CommonButton from '../common/CommonButton'
import CommonCard, { StatCard } from '../common/CommonCard'
import CommonTable from '../common/CommonTable'
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

  const tableColumns = columns.map((c) => ({
    key: c.key,
    header: c.header,
    render: (r) => (c.value ? c.value(r) : r[c.key]),
  }))

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
        <CommonTable
          columns={tableColumns}
          rows={rows.slice(0, 200)}
          rowKey="id"
        />
      </CommonCard>
    </div>
  )
}
