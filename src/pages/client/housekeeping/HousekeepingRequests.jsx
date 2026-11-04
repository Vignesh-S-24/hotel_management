import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import { PriorityBadge, TaskStatusBadge } from '../../../components/shared/StatusBadge'
import Tabs from '../../../components/shared/Tabs'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useTableData } from '../../../hooks/useTableData'
import { REQUEST_TYPES } from '../../../utils/constants'
import { timeAgo } from '../../../utils/formatDate'
import TaskDetailsDrawer from '../../admin/housekeeping/TaskDetailsDrawer'
import RequestForm from './RequestForm'

const OPEN = ['pending', 'assigned', 'in_progress', 'inspection']

export default function HousekeepingRequests() {
  const { user } = useAuth()
  const { tasks, roomLabel, staffName } = useData()
  const loading = useSimulatedLoading()
  const [tab, setTab] = useState('open')
  const [type, setType] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)

  // Data isolation: receptionists only see requests they created.
  const mine = tasks.filter((t) => t.requestedBy === user.id)

  const filterFn = useCallback(
    (t) => (tab === 'open' ? OPEN.includes(t.status) : tab === 'closed' ? !OPEN.includes(t.status) : true) && (type === 'all' || t.type === type),
    [tab, type],
  )
  const searchText = useCallback((t) => `${roomLabel(t.roomId)} ${t.notes} ${staffName(t.assigneeId)}`, [roomLabel, staffName])
  const sortValue = useCallback((t, key) => (key === 'room' ? roomLabel(t.roomId) : t[key]), [roomLabel])
  const table = useTableData(mine, { filterFn, searchText, sortValue, initialSort: { key: 'createdAt', dir: 'desc' }, resetKey: `${tab}${type}` })
  const detail = mine.find((t) => t.id === detailId)

  const columns = [
    {
      key: 'room',
      header: 'Room',
      sortable: true,
      primary: true,
      render: (t) => (
        <div>
          <p className="font-medium text-text-primary">{roomLabel(t.roomId)}</p>
          <p className="text-xs text-text-secondary">{REQUEST_TYPES.find((r) => r.value === t.type)?.label}</p>
        </div>
      ),
    },
    { key: 'priority', header: 'Priority', render: (t) => <PriorityBadge value={t.priority} /> },
    { key: 'status', header: 'Status', sortable: true, render: (t) => <TaskStatusBadge value={t.status} /> },
    { key: 'assignee', header: 'Housekeeper', render: (t) => (t.assigneeId ? staffName(t.assigneeId) : <span className="text-text-secondary">Waiting for assignment</span>) },
    { key: 'createdAt', header: 'Requested', sortable: true, render: (t) => <span className="text-text-secondary">{timeAgo(t.createdAt)}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping Requests"
        description="Requests you raised. The Super Admin assigns a housekeeper; you'll be notified as they progress."
        actions={
          <CommonButton icon={Plus} onClick={() => setFormOpen(true)}>
            New request
          </CommonButton>
        }
      />
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'open', label: 'Open', count: mine.filter((t) => OPEN.includes(t.status)).length },
            { value: 'closed', label: 'History', count: mine.filter((t) => !OPEN.includes(t.status)).length },
            { value: 'all', label: 'All', count: mine.length },
          ]}
        />
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search room or notes" className="sm:w-64" />
          <FilterSelect label="Filter by request type" value={type} onChange={setType} options={REQUEST_TYPES} allLabel="All request types" />
        </FilterBar>
        <CommonTable
          caption="My housekeeping requests"
          columns={columns}
          rows={table.rows}
          sort={table.sort}
          onSort={table.toggleSort}
          loading={loading}
          onRowClick={(t) => setDetailId(t.id)}
          emptyState={<CommonEmptyState title="No requests yet" description="Create a request when a guest checks out or needs service." action={<CommonButton onClick={() => setFormOpen(true)}>New request</CommonButton>} />}
        />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>
      <RequestForm open={formOpen} onClose={() => setFormOpen(false)} />
      {detail && <TaskDetailsDrawer task={detail} onClose={() => setDetailId(null)} />}
    </div>
  )
}
