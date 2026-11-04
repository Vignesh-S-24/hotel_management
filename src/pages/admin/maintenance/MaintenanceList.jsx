import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, MessageSquarePlus, Play, Plus, RotateCcw } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonDrawer from '../../../components/common/CommonDrawer'
import CommonInput from '../../../components/common/CommonInput'
import CommonModal from '../../../components/common/CommonModal'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonSelect from '../../../components/common/CommonSelect'
import CommonTable from '../../../components/common/CommonTable'
import { useToast } from '../../../components/common/CommonToast'
import DetailList from '../../../components/shared/DetailList'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import MaintenanceFormModal from '../../../components/shared/MaintenanceFormModal'
import MaintenanceTimeline from '../../../components/shared/MaintenanceTimeline'
import PageHeader from '../../../components/shared/PageHeader'
import { MaintenanceBadge, PriorityBadge } from '../../../components/shared/StatusBadge'
import Tabs from '../../../components/shared/Tabs'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useStaffOptions } from '../../../hooks/useStaffOptions'
import { useTableData } from '../../../hooks/useTableData'
import { MAINTENANCE_CATEGORIES, PRIORITIES, PRIORITY_OPTIONS } from '../../../utils/constants'
import { formatDateTime, minutesBetween, timeAgo } from '../../../utils/formatDate'

const TABS = {
  open: (m) => m.status !== 'completed',
  reported: (m) => m.status === 'reported',
  in_progress: (m) => m.status === 'in_progress',
  completed: (m) => m.status === 'completed',
  all: () => true,
}

export default function MaintenanceList() {
  const { maintenance, roomLabel, staffName, updateMaintenance, setMaintenanceStatus, addMaintenanceNote } = useData()
  const { technicians } = useStaffOptions()
  const toast = useToast()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'open'
  const [priority, setPriority] = useState('all')
  const [category, setCategory] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [resolution, setResolution] = useState('')
  const [resolutionError, setResolutionError] = useState('')
  const [note, setNote] = useState('')

  const newParam = params.get('new')
  useEffect(() => {
    if (newParam) setFormOpen(true)
  }, [newParam])

  const setTab = (value) => setParams({ tab: value }, { replace: true })

  const filterFn = useCallback((m) => TABS[tab](m) && (priority === 'all' || m.priority === priority) && (category === 'all' || m.category === category), [tab, priority, category])
  const searchText = useCallback((m) => `${roomLabel(m.roomId, m.location)} ${m.title} ${m.description} ${staffName(m.assigneeId)}`, [roomLabel, staffName])
  const sortValue = useCallback((m, key) => (key === 'priority' ? Object.keys(PRIORITIES).indexOf(m.priority) : key === 'room' ? roomLabel(m.roomId, m.location) : m[key]), [roomLabel])
  const table = useTableData(maintenance, { filterFn, searchText, sortValue, initialSort: { key: 'createdAt', dir: 'desc' }, resetKey: `${tab}${priority}${category}` })

  const detail = maintenance.find((m) => m.id === detailId)

  const start = (m) => {
    if (!m.assigneeId) {
      toast.warning('Assign responsible staff first')
      setDetailId(m.id)
      return
    }
    setMaintenanceStatus(m.id, 'in_progress')
    toast.success('Repair started', m.title)
  }

  const statusActions = (m) => (
    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      {m.status === 'reported' && (
        <CommonButton size="sm" variant="soft" icon={Play} onClick={() => start(m)}>
          Start Repair
        </CommonButton>
      )}
      {m.status === 'in_progress' && (
        <CommonButton
          size="sm"
          variant="success"
          icon={CheckCircle2}
          onClick={() => {
            setCompleting(m)
            setResolution('')
            setResolutionError('')
          }}
        >
          Mark Repair Complete
        </CommonButton>
      )}
      {m.status === 'completed' && (
        <CommonButton
          size="sm"
          variant="ghost"
          icon={RotateCcw}
          onClick={() => {
            setMaintenanceStatus(m.id, 'reported')
            toast.info('Request reopened', m.title)
          }}
        >
          Reopen
        </CommonButton>
      )}
    </div>
  )

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
    { key: 'priority', header: 'Priority', sortable: true, render: (m) => <PriorityBadge value={m.priority} /> },
    { key: 'assigneeId', header: 'Responsible', render: (m) => (m.assigneeId ? staffName(m.assigneeId) : <span className="text-warning">Unassigned</span>) },
    { key: 'status', header: 'Status', sortable: true, render: (m) => <MaintenanceBadge value={m.status} /> },
    { key: 'createdAt', header: 'Reported', sortable: true, render: (m) => <span className="text-text-secondary">{timeAgo(m.createdAt)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: statusActions },
  ]

  const openCount = maintenance.filter(TABS.open).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description={`${openCount} open request${openCount === 1 ? '' : 's'} · called "Repairs" in the mobile app`}
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
            { value: 'open', label: 'Open', count: openCount },
            { value: 'reported', label: 'Reported', count: maintenance.filter(TABS.reported).length },
            { value: 'in_progress', label: 'Under repair', count: maintenance.filter(TABS.in_progress).length },
            { value: 'completed', label: 'Completed', count: maintenance.filter(TABS.completed).length },
            { value: 'all', label: 'All' },
          ]}
        />
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search issue, room, staff" className="sm:w-64" />
          <FilterSelect label="Filter by priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} allLabel="All priorities" />
          <FilterSelect label="Filter by category" value={category} onChange={setCategory} options={MAINTENANCE_CATEGORIES.map((c) => ({ value: c, label: c }))} allLabel="All categories" />
        </FilterBar>
        <CommonTable caption="Maintenance requests" columns={columns} rows={table.rows} sort={table.sort} onSort={table.toggleSort} loading={loading} onRowClick={(m) => setDetailId(m.id)} />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>

      <MaintenanceFormModal
        open={formOpen}
        allowAssign
        initialRoomId={params.get('room') ?? ''}
        onClose={() => {
          setFormOpen(false)
          if (newParam) setParams({ tab }, { replace: true })
        }}
      />

      {detail && (
        <CommonDrawer open onClose={() => setDetailId(null)} title={detail.title} description={`${roomLabel(detail.roomId, detail.location)} · ${detail.category}`} footer={statusActions(detail)}>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <MaintenanceBadge value={detail.status} />
              <PriorityBadge value={detail.priority} />
            </div>
            <p className="text-sm text-text-secondary">{detail.description}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CommonSelect
                label="Responsible staff"
                placeholder="Not assigned"
                options={technicians}
                value={detail.assigneeId ?? ''}
                disabled={detail.status === 'completed'}
                onChange={(e) => {
                  updateMaintenance(detail.id, { assigneeId: e.target.value || null })
                  toast.success('Responsible staff updated')
                }}
              />
              <CommonSelect
                label="Priority"
                options={PRIORITY_OPTIONS}
                value={detail.priority}
                disabled={detail.status === 'completed'}
                onChange={(e) => {
                  updateMaintenance(detail.id, { priority: e.target.value })
                  toast.success('Priority updated')
                }}
              />
            </div>
            <DetailList
              items={[
                ['Reported by', staffName(detail.reportedBy)],
                ['Reported at', formatDateTime(detail.createdAt)],
                ['Started', formatDateTime(detail.startedAt)],
                ['Resolved', formatDateTime(detail.resolvedAt)],
                detail.resolvedAt && ['Resolution time', `${minutesBetween(detail.startedAt ?? detail.createdAt, detail.resolvedAt)} min`],
              ]}
            />
            {detail.resolution && (
              <section className="rounded-lg border border-success/30 bg-success-soft p-3">
                <h3 className="text-sm font-semibold text-success">Resolution</h3>
                <p className="mt-1 text-sm text-text-primary">{detail.resolution}</p>
              </section>
            )}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Progress</h3>
              <MaintenanceTimeline request={detail} staffName={staffName} />
            </section>
            {detail.status !== 'completed' && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!note.trim()) return
                  addMaintenanceNote(detail.id, note.trim())
                  setNote('')
                  toast.success('Update added')
                }}
              >
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a progress update" aria-label="Progress update" className="field-control" />
                <CommonButton type="submit" variant="secondary" icon={MessageSquarePlus} disabled={!note.trim()}>
                  Add
                </CommonButton>
              </form>
            )}
          </div>
        </CommonDrawer>
      )}

      <CommonModal
        open={Boolean(completing)}
        onClose={() => setCompleting(null)}
        size="sm"
        title="Mark Repair Complete"
        description="The room moves to Cleaning Required so a housekeeper can be assigned."
        footer={
          <>
            <CommonButton variant="secondary" onClick={() => setCompleting(null)}>
              Cancel
            </CommonButton>
            <CommonButton
              variant="success"
              onClick={() => {
                if (resolution.trim().length < 5) return setResolutionError('Describe what was fixed (5+ characters)')
                setMaintenanceStatus(completing.id, 'completed', resolution.trim())
                toast.success('Repair completed', completing.title)
                setCompleting(null)
              }}
            >
              Complete repair
            </CommonButton>
          </>
        }
      >
        <CommonInput
          label="Resolution details"
          required
          multiline
          rows={3}
          value={resolution}
          onChange={(e) => {
            setResolution(e.target.value)
            setResolutionError('')
          }}
          error={resolutionError}
          placeholder="e.g. P-trap replaced, no leak after test"
          data-autofocus
        />
      </CommonModal>
    </div>
  )
}
