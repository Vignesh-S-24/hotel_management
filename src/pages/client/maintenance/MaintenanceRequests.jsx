import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonDrawer from '../../../components/common/CommonDrawer'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import DetailList from '../../../components/shared/DetailList'
import FilterBar from '../../../components/shared/FilterBar'
import MaintenanceFormModal from '../../../components/shared/MaintenanceFormModal'
import MaintenanceTimeline from '../../../components/shared/MaintenanceTimeline'
import PageHeader from '../../../components/shared/PageHeader'
import { MaintenanceBadge, PriorityBadge } from '../../../components/shared/StatusBadge'
import Tabs from '../../../components/shared/Tabs'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useTableData } from '../../../hooks/useTableData'
import { formatDateTime, timeAgo } from '../../../utils/formatDate'

export default function MaintenanceRequests() {
  const { user } = useAuth()
  const { maintenance, roomLabel, staffName } = useData()
  const loading = useSimulatedLoading()
  const [tab, setTab] = useState('open')
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)

  // Data isolation: only requests reported by the logged-in receptionist.
  const mine = maintenance.filter((m) => m.reportedBy === user.staffId)
  const filterFn = useCallback((m) => (tab === 'open' ? m.status !== 'completed' : tab === 'completed' ? m.status === 'completed' : true), [tab])
  const searchText = useCallback((m) => `${roomLabel(m.roomId, m.location)} ${m.title} ${m.description}`, [roomLabel])
  const table = useTableData(mine, { filterFn, searchText, initialSort: { key: 'createdAt', dir: 'desc' }, resetKey: tab })
  const detail = mine.find((m) => m.id === detailId)

  const columns = [
    {
      key: 'title',
      header: 'Issue',
      primary: true,
      render: (m) => (
        <div>
          <p className="font-medium text-text-primary">{m.title}</p>
          <p className="text-xs text-text-secondary">
            {roomLabel(m.roomId, m.location)} · {m.category}
          </p>
        </div>
      ),
    },
    { key: 'priority', header: 'Priority', render: (m) => <PriorityBadge value={m.priority} /> },
    { key: 'status', header: 'Progress', sortable: true, render: (m) => <MaintenanceBadge value={m.status} /> },
    { key: 'resolution', header: 'Resolution', render: (m) => <span className="block max-w-[16rem] truncate text-text-secondary">{m.resolution || '—'}</span> },
    { key: 'createdAt', header: 'Reported', sortable: true, render: (m) => <span className="text-text-secondary">{timeAgo(m.createdAt)}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Requests"
        description="Report room or common-area issues. The Super Admin reviews and starts the repair."
        actions={
          <CommonButton icon={Plus} onClick={() => setFormOpen(true)}>
            Report issue
          </CommonButton>
        }
      />
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'open', label: 'Open', count: mine.filter((m) => m.status !== 'completed').length },
            { value: 'completed', label: 'Resolved', count: mine.filter((m) => m.status === 'completed').length },
            { value: 'all', label: 'All', count: mine.length },
          ]}
        />
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search issue or room" className="sm:w-64" />
        </FilterBar>
        <CommonTable
          caption="My maintenance requests"
          columns={columns}
          rows={table.rows}
          sort={table.sort}
          onSort={table.toggleSort}
          loading={loading}
          onRowClick={(m) => setDetailId(m.id)}
          emptyState={<CommonEmptyState title="No requests here" description="Issues you report will appear in this list." />}
        />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>
      <MaintenanceFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      {detail && (
        <CommonDrawer open onClose={() => setDetailId(null)} title={detail.title} description={`${roomLabel(detail.roomId, detail.location)} · ${detail.category}`}>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <MaintenanceBadge value={detail.status} />
              <PriorityBadge value={detail.priority} />
            </div>
            <p className="text-sm text-text-secondary">{detail.description}</p>
            <DetailList
              items={[
                ['Responsible', detail.assigneeId ? staffName(detail.assigneeId) : 'Not assigned yet'],
                ['Reported at', formatDateTime(detail.createdAt)],
                ['Resolved at', formatDateTime(detail.resolvedAt)],
              ]}
            />
            <section className={`rounded-lg border p-3 ${detail.resolution ? 'border-success/30 bg-success-soft' : 'border-border'}`}>
              <h3 className={`text-sm font-semibold ${detail.resolution ? 'text-success' : 'text-text-primary'}`}>Resolution remarks</h3>
              <p className="mt-1 text-sm text-text-primary">{detail.resolution || 'Not resolved yet.'}</p>
            </section>
            <section>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Progress</h3>
              <MaintenanceTimeline request={detail} staffName={staffName} />
            </section>
          </div>
        </CommonDrawer>
      )}
    </div>
  )
}
