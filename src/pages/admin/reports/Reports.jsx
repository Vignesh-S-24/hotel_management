import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import { PageSkeleton } from '../../../components/common/CommonLoader'
import { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import ReportView from '../../../components/shared/ReportView'
import Tabs from '../../../components/shared/Tabs'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { toInputDate } from '../../../utils/formatDate'
import { REPORT_TYPES, buildReport } from './buildReports'

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: '7 days', days: 6 },
  { label: '14 days', days: 13 },
  { label: '30 days', days: 29 },
]

const daysBack = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toInputDate(d)
}

export default function Reports() {
  const data = useData()
  const loading = useSimulatedLoading(400)
  const [params, setParams] = useSearchParams()
  const type = REPORT_TYPES.some((r) => r.value === params.get('type')) ? params.get('type') : 'rooms'
  const [from, setFrom] = useState(daysBack(13))
  const [to, setTo] = useState(toInputDate())
  const [status, setStatus] = useState('all')

  const meta = REPORT_TYPES.find((r) => r.value === type)
  const report = useMemo(() => buildReport(type, data, { from, to, status }), [type, data, from, to, status])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analytics computed from the demo data. Export uses the current filters." />
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={type}
          onChange={(v) => {
            setParams({ type: v }, { replace: true })
            setStatus('all')
          }}
          tabs={REPORT_TYPES.map((r) => ({ value: r.value, label: r.label }))}
        />
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Date presets">
            {PRESETS.map((p) => {
              const active = from === daysBack(p.days) && to === toInputDate()
              return (
                <CommonButton
                  key={p.label}
                  size="sm"
                  variant={active ? 'soft' : 'ghost'}
                  aria-pressed={active}
                  onClick={() => {
                    setFrom(daysBack(p.days))
                    setTo(toInputDate())
                  }}
                >
                  {p.label}
                </CommonButton>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <input type="date" aria-label="Start Date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" disabled={type === 'rooms'} />
            <span className="text-text-secondary">–</span>
            <input type="date" aria-label="End Date" value={to} min={from} max={toInputDate()} onChange={(e) => e.target.value && setTo(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" disabled={type === 'rooms'} />
          </div>
          <FilterSelect label={type === 'staff' ? 'Filter by role' : 'Filter by status'} value={status} onChange={setStatus} options={meta.statusOptions} allLabel={type === 'staff' ? 'All roles' : 'All statuses'} />
        </div>
      </CommonCard>
      <ReportView report={report} filename={`${type}-report_${from}_to_${to}`} />
    </div>
  )
}
