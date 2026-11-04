import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, LayoutGrid, List, MoreHorizontal, Pencil, Plus, RefreshCcw } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import RoomStatusModal from '../../../components/shared/RoomStatusModal'
import RoomDrawer from './RoomDrawer'
import { ActiveBadge, RoomStatusBadge } from '../../../components/shared/StatusBadge'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useTableData } from '../../../hooks/useTableData'
import { FLOORS, ROOM_STATUS, ROOM_STATUS_OPTIONS, ROOM_TYPES } from '../../../utils/constants'
import { timeAgo } from '../../../utils/formatDate'

export default function RoomList() {
  const { rooms, tasks, staffName } = useData()
  const navigate = useNavigate()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? 'all'
  const [type, setType] = useState('all')
  const [floor, setFloor] = useState('all')
  const [active, setActive] = useState('active')
  const [view, setView] = useState('table')
  const [statusRoom, setStatusRoom] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)

  const setStatus = (value) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete('status')
    else next.set('status', value)
    setParams(next, { replace: true })
  }

  const assigneeFor = useCallback(
    (roomId) => {
      const t = tasks.find((x) => x.roomId === roomId && ['assigned', 'in_progress', 'inspection'].includes(x.status))
      return t ? staffName(t.assigneeId) : null
    },
    [tasks, staffName],
  )

  const filterFn = useCallback(
    (r) =>
      (status === 'all' || r.status === status) &&
      (type === 'all' || r.type === type) &&
      (floor === 'all' || String(r.floor) === floor) &&
      (active === 'all' || (active === 'active' ? r.active : !r.active)),
    [status, type, floor, active],
  )
  const searchText = useCallback((r) => `${r.number} ${r.type} ${ROOM_STATUS[r.status].label}`, [])
  const table = useTableData(rooms, { filterFn, searchText, initialSort: { key: 'number', dir: 'asc' }, resetKey: `${status}${type}${floor}${active}` })

  const reset = () => {
    setStatus('all')
    setType('all')
    setFloor('all')
    setActive('active')
    table.setQuery('')
  }

  const columns = [
    {
      key: 'number',
      header: 'Room',
      sortable: true,
      primary: true,
      render: (r) => (
        <div>
          <p className="font-medium text-text-primary">Room {r.number}</p>
          <p className="text-xs text-text-secondary">Floor {r.floor}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <RoomStatusBadge value={r.status} /> },
    { key: 'assignee', header: 'Housekeeper', render: (r) => assigneeFor(r.id) ?? <span className="text-text-secondary">—</span> },
    { key: 'active', header: 'Record', render: (r) => <ActiveBadge active={r.active} /> },
    { key: 'updatedAt', header: 'Last updated', sortable: true, render: (r) => <span className="text-text-secondary">{timeAgo(r.updatedAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <CommonButton size="sm" variant="ghost" icon={RefreshCcw} onClick={() => setStatusRoom(r)} aria-label={`Update status of room ${r.number}`}>
            <span className="hidden xl:inline">Status</span>
          </CommonButton>
          <CommonButton
            size="sm"
            variant="ghost"
            icon={Pencil}
            onClick={() => {
              setEditingRoom(r)
              setDrawerOpen(true)
            }}
            aria-label={`Edit room ${r.number}`}
          />
          <CommonButton size="sm" variant="ghost" icon={Eye} to={`/admin/rooms/${r.id}`} aria-label={`View room ${r.number}`} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        description={`${rooms.filter((r) => r.active).length} active rooms across ${FLOORS.length} floors`}
        actions={
          <CommonButton
            icon={Plus}
            onClick={() => {
              setEditingRoom(null)
              setDrawerOpen(true)
            }}
          >
            Add Room
          </CommonButton>
        }
      />
      <CommonCard bodyClassName="p-0">
        <FilterBar className="sm:flex-nowrap">
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search room number or status" className="w-full sm:w-48 lg:w-56 shrink-0" />
          <FilterSelect label="Filter by status" value={status} onChange={setStatus} options={ROOM_STATUS_OPTIONS} allLabel="All statuses" />
          <FilterSelect label="Filter by room type" value={type} onChange={setType} options={ROOM_TYPES.map((t) => ({ value: t, label: t }))} allLabel="All types" />
          <FilterSelect label="Filter by floor" value={floor} onChange={setFloor} options={FLOORS.map((f) => ({ value: String(f), label: `Floor ${f}` }))} allLabel="All floors" />
          <FilterSelect
            label="Filter by record status"
            value={active}
            onChange={setActive}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            allLabel="Active & inactive"
          />
          <div className="flex items-center gap-2 sm:ml-auto shrink-0">
            <CommonButton variant="ghost" size="sm" onClick={reset}>
              Reset filters
            </CommonButton>
            <div className="inline-flex rounded-lg border border-border p-0.5" role="group" aria-label="View mode">
              {[
                ['table', List, 'List view'],
                ['grid', LayoutGrid, 'Grid view'],
              ].map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={label}
                  className={`rounded-md p-1.5 ${view === v ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </FilterBar>

        {view === 'table' ? (
          <CommonTable
            caption="Rooms"
            columns={columns}
            rows={table.rows}
            sort={table.sort}
            onSort={table.toggleSort}
            loading={loading}
            onRowClick={(r) => navigate(`/admin/rooms/${r.id}`)}
            emptyState={<CommonEmptyState title="No rooms match" description="Try another status, type or search." action={<CommonButton variant="secondary" onClick={reset}>Clear filters</CommonButton>} />}
          />
        ) : table.rows.length === 0 ? (
          <CommonEmptyState title="No rooms match" description="Try another status, type or search." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
            {table.rows.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => navigate(`/admin/rooms/${r.id}`)} className="card w-full p-3 text-left transition hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-text-primary">{r.number}</span>
                    <MoreHorizontal className="h-4 w-4 text-text-secondary" aria-hidden />
                  </div>
                  <p className="mb-2 text-xs text-text-secondary">{r.type}</p>
                  <RoomStatusBadge value={r.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>
      <RoomStatusModal room={statusRoom} onClose={() => setStatusRoom(null)} />
      <RoomDrawer
        open={drawerOpen}
        room={editingRoom}
        onClose={() => {
          setDrawerOpen(false)
          setEditingRoom(null)
        }}
      />
    </div>
  )
}
