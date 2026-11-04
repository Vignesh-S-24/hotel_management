import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import CommonBadge from '../../../components/common/CommonBadge'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import { useToast } from '../../../components/common/CommonToast'
import { ActivityIcon } from '../../../components/shared/ActivityFeed'
import DateRangeFilter from '../../../components/shared/DateRangeFilter'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import Tabs from '../../../components/shared/Tabs'
import { useData } from '../../../context/DataContext'
import { useDateRange } from '../../../hooks/useDateRange'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useTableData } from '../../../hooks/useTableData'
import { ACTIVITY_TYPES } from '../../../utils/constants'
import { exportCsv } from '../../../utils/exportCsv'
import { formatDateTime, isWithinRange, timeAgo } from '../../../utils/formatDate'

// Audit trail of everything recorded in DataContext.activities, newest first.
export default function ActivityLog() {
  const { activities, staff, staffName, roomLabel } = useData()
  const loading = useSimulatedLoading()
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [range, setRange] = useDateRange('last30')
  const [actor, setActor] = useState('all')
  const type = ACTIVITY_TYPES[params.get('type')] ? params.get('type') : 'all'

  const inRange = useMemo(() => activities.filter((a) => isWithinRange(a.at, range.from, range.to)), [activities, range.from, range.to])
  const actorOptions = useMemo(() => {
    const ids = new Set(activities.map((a) => a.actorId).filter(Boolean))
    return staff.filter((s) => ids.has(s.id)).map((s) => ({ value: s.id, label: s.name }))
  }, [activities, staff])

  const filterFn = useCallback((a) => (type === 'all' || a.type === type) && (actor === 'all' || a.actorId === actor), [type, actor])
  const searchText = useCallback((a) => `${a.message} ${a.actorId ? staffName(a.actorId) : ''} ${a.roomId ? roomLabel(a.roomId) : ''}`, [staffName, roomLabel])
  const sortValue = useCallback((a, key) => (key === 'actor' ? (a.actorId ? staffName(a.actorId) : '') : a[key]), [staffName])
  const table = useTableData(inRange, { filterFn, searchText, sortValue, initialSort: { key: 'at', dir: 'desc' }, pageSize: 20, resetKey: `${type}${actor}${range.from}${range.to}` })

  const setType = (value) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (value === 'all') p.delete('type')
        else p.set('type', value)
        return p
      },
      { replace: true },
    )

  const columns = [
    {
      key: 'message',
      header: 'Activity',
      primary: true,
      render: (a) => (
        <div className="flex items-center gap-3">
          <ActivityIcon type={a.type} />
          <span className="text-text-primary">{a.message}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (a) => <CommonBadge tone={ACTIVITY_TYPES[a.type]?.tone}>{ACTIVITY_TYPES[a.type]?.label ?? a.type}</CommonBadge>,
    },
    { key: 'actor', header: 'By', sortable: true, render: (a) => (a.actorId ? staffName(a.actorId) : <span className="text-text-secondary">System</span>) },
    {
      key: 'at',
      header: 'When',
      sortable: true,
      render: (a) => (
        <time dateTime={a.at} title={formatDateTime(a.at)} className="whitespace-nowrap text-text-secondary">
          {timeAgo(a.at)}
        </time>
      ),
    },
  ]

  const exportLog = () => {
    exportCsv(
      `activity-log_${range.from}_to_${range.to}`,
      [
        { key: 'at', header: 'Date & time', value: (a) => formatDateTime(a.at) },
        { key: 'type', header: 'Type', value: (a) => ACTIVITY_TYPES[a.type]?.label ?? a.type },
        { key: 'message', header: 'Activity' },
        { key: 'room', header: 'Room', value: (a) => (a.roomId ? roomLabel(a.roomId) : '') },
        { key: 'actor', header: 'By', value: (a) => (a.actorId ? staffName(a.actorId) : 'System') },
      ],
      table.filtered,
    )
    toast.success('Activity log exported', `${table.filtered.length} entries saved as CSV.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Every room, housekeeping, inspection, repair, stock and staff change, newest first."
        actions={
          <>
            <DateRangeFilter value={range} onChange={setRange} />
            <CommonButton variant="secondary" icon={Download} onClick={exportLog} disabled={!table.total}>
              Export CSV
            </CommonButton>
          </>
        }
      />
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={type}
          onChange={setType}
          tabs={[
            { value: 'all', label: 'All', count: inRange.length },
            ...Object.entries(ACTIVITY_TYPES).map(([value, t]) => ({ value, label: t.label, count: inRange.filter((a) => a.type === value).length })),
          ]}
        />
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search activity, staff, room" className="sm:w-72" />
          <FilterSelect label="Filter by staff" value={actor} onChange={setActor} options={actorOptions} allLabel="All staff" />
        </FilterBar>
        <CommonTable
          caption="Activity log"
          columns={columns}
          rows={table.rows}
          sort={table.sort}
          onSort={table.toggleSort}
          loading={loading}
          onRowClick={(a) => a.roomId && navigate(`/admin/rooms/${a.roomId}`)}
        />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>
    </div>
  )
}
