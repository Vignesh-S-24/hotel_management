import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Play, Plus, Send, UserPlus, XCircle } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonConfirmDialog from '../../../components/common/CommonConfirmDialog'
import CommonDropdown from '../../../components/common/CommonDropdown'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import { useToast } from '../../../components/common/CommonToast'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import { TaskStatusBadge } from '../../../components/shared/StatusBadge'
import Tabs from '../../../components/shared/Tabs'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useStaffOptions } from '../../../hooks/useStaffOptions'
import { useTableData } from '../../../hooks/useTableData'
import { PRIORITIES, PRIORITY_OPTIONS, TASK_STATUS, TASK_STATUS_OPTIONS } from '../../../utils/constants'
import { isWithinRange, timeAgo } from '../../../utils/formatDate'
import AssignTaskModal from './AssignTaskModal'
import SubmitInspectionModal from './SubmitInspectionModal'
import TaskDetailsDrawer from './TaskDetailsDrawer'
import TaskForm from './TaskForm'

const TABS = {
  pending: ['pending'],
  active: ['assigned', 'in_progress'],
  inspection: ['inspection'],
  completed: ['completed'],
  all: Object.keys(TASK_STATUS),
}

export default function HousekeepingList() {
  const { tasks, roomLabel, staffName, setTaskPriority, startTask, cancelTask } = useData()
  const { allHousekeepers } = useStaffOptions()
  const toast = useToast()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'active'
  const [staff, setStaff] = useState('all')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [detailId, setDetailId] = useState(null)

  // Deep links from dashboard / room details: ?new=1&room=… or ?assign=taskId
  const newParam = params.get('new')
  const roomParam = params.get('room') ?? ''
  const assignParam = params.get('assign')
  useEffect(() => {
    if (newParam) setFormOpen(true)
    if (assignParam) setAssigning(tasks.find((t) => t.id === assignParam) ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newParam, assignParam])

  const clearDeepLinks = () => {
    const next = new URLSearchParams(params)
    ;['new', 'room', 'assign'].forEach((k) => next.delete(k))
    setParams(next, { replace: true })
  }

  const setTab = (value) => {
    const next = new URLSearchParams(params)
    next.set('tab', value)
    setParams(next, { replace: true })
    setStatus('all')
  }

  const counts = useMemo(() => Object.fromEntries(Object.entries(TABS).map(([k, statuses]) => [k, tasks.filter((t) => statuses.includes(t.status)).length])), [tasks])

  const filterFn = useCallback(
    (t) =>
      TABS[tab].includes(t.status) &&
      (status === 'all' || t.status === status) &&
      (staff === 'all' || t.assigneeId === staff) &&
      (!from && !to ? true : isWithinRange(t.createdAt, from, to)),
    [tab, status, staff, from, to],
  )
  const searchText = useCallback((t) => `${roomLabel(t.roomId, t.location)} ${staffName(t.assigneeId)} ${t.notes}`, [roomLabel, staffName])
  const sortValue = useCallback(
    (t, key) => (key === 'priority' ? Object.keys(PRIORITIES).indexOf(t.priority) : key === 'room' ? roomLabel(t.roomId, t.location) : t[key]),
    [roomLabel],
  )
  const table = useTableData(tasks, { filterFn, searchText, sortValue, initialSort: { key: 'createdAt', dir: 'desc' }, resetKey: `${tab}${status}${staff}${from}${to}` })

  const detail = tasks.find((t) => t.id === detailId)

  const actionsFor = (t) => (
    <div className="flex flex-wrap justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      {['pending', 'assigned'].includes(t.status) && (
        <CommonButton size="sm" variant={t.assigneeId ? 'ghost' : 'soft'} icon={UserPlus} onClick={() => setAssigning(t)}>
          {t.assigneeId ? 'Reassign' : 'Assign'}
        </CommonButton>
      )}
      {t.status === 'assigned' && (
        <CommonButton
          size="sm"
          variant="ghost"
          icon={Play}
          onClick={() => {
            startTask(t.id)
            toast.info('Cleaning started', `${staffName(t.assigneeId)} is cleaning ${roomLabel(t.roomId, t.location)}.`)
          }}
          title="Simulate the housekeeper starting the task"
        >
          Start
        </CommonButton>
      )}
      {t.status === 'in_progress' && (
        <CommonButton size="sm" variant="soft" icon={Send} onClick={() => setSubmitting(t)}>
          Submit
        </CommonButton>
      )}
      {['pending', 'assigned'].includes(t.status) && <CommonButton size="sm" variant="ghost" icon={XCircle} onClick={() => setCancelling(t)} aria-label="Cancel task" />}
    </div>
  )

  const columns = [
    {
      key: 'room',
      header: 'Room / Area',
      sortable: true,
      primary: true,
      render: (t) => (
        <div>
          <p className="font-medium text-text-primary">{roomLabel(t.roomId, t.location)}</p>
          <p className="max-w-[16rem] truncate text-xs text-text-secondary">{t.notes || (t.type === 'common' ? 'Common area' : 'Room cleaning')}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (t) =>
        ['completed', 'cancelled'].includes(t.status) ? (
          PRIORITIES[t.priority].label
        ) : (
          <CommonDropdown
            size="sm"
            className="inline-block w-24"
            value={t.priority}
            onChange={(v) => {
              setTaskPriority(t.id, v)
              toast.success('Priority updated', `${roomLabel(t.roomId, t.location)}: ${PRIORITIES[v].label}`)
            }}
            options={PRIORITY_OPTIONS}
            label={`Priority for ${roomLabel(t.roomId, t.location)}`}
          />
        ),
    },
    { key: 'assignee', header: 'Housekeeper', render: (t) => (t.assigneeId ? staffName(t.assigneeId) : <span className="text-warning">Unassigned</span>) },
    { key: 'status', header: 'Status', sortable: true, render: (t) => <TaskStatusBadge value={t.status} /> },
    { key: 'createdAt', header: 'Created', sortable: true, render: (t) => <span className="text-text-secondary">{timeAgo(t.createdAt)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: actionsFor },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping"
        description="Tasks move between these tabs automatically as housekeepers work."
        actions={
          <CommonButton icon={Plus} onClick={() => setFormOpen(true)}>
            New Cleaning Task
          </CommonButton>
        }
      />
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'pending', label: 'Waiting', count: counts.pending },
            { value: 'active', label: 'In progress', count: counts.active },
            { value: 'inspection', label: 'Inspection', count: counts.inspection },
            { value: 'completed', label: 'Completed', count: counts.completed },
            { value: 'all', label: 'All', count: counts.all },
          ]}
        />
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search room, staff or notes" className="sm:w-64" />
          <FilterSelect label="Filter by staff" value={staff} onChange={setStaff} options={allHousekeepers} allLabel="All housekeepers" />
          <FilterSelect label="Filter by status" value={status} onChange={setStatus} options={TASK_STATUS_OPTIONS.filter((o) => TABS[tab].includes(o.value))} allLabel="All statuses" />
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="hk-from">
              From date
            </label>
            <input id="hk-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" />
            <span className="text-text-secondary">–</span>
            <label className="sr-only" htmlFor="hk-to">
              To date
            </label>
            <input id="hk-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" />
          </div>
          {(staff !== 'all' || status !== 'all' || from || to || table.query) && (
            <CommonButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setStaff('all')
                setStatus('all')
                setFrom('')
                setTo('')
                table.setQuery('')
              }}
            >
              Clear filters
            </CommonButton>
          )}
        </FilterBar>
        <CommonTable caption="Housekeeping tasks" columns={columns} rows={table.rows} sort={table.sort} onSort={table.toggleSort} loading={loading} onRowClick={(t) => setDetailId(t.id)} />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>

      <TaskForm
        open={formOpen}
        initialRoomId={roomParam}
        onClose={() => {
          setFormOpen(false)
          clearDeepLinks()
        }}
      />
      {assigning && (
        <AssignTaskModal
          task={assigning}
          onClose={() => {
            setAssigning(null)
            clearDeepLinks()
          }}
        />
      )}
      {submitting && <SubmitInspectionModal task={submitting} onClose={() => setSubmitting(null)} />}
      {detail && <TaskDetailsDrawer task={detail} onClose={() => setDetailId(null)} footer={actionsFor(detail)} />}
      <CommonConfirmDialog
        open={Boolean(cancelling)}
        title="Cancel this task?"
        message={cancelling ? `${roomLabel(cancelling.roomId, cancelling.location)} will be removed from the housekeeping queue. Room status is not changed.` : ''}
        confirmLabel="Cancel task"
        cancelLabel="Keep task"
        onCancel={() => setCancelling(null)}
        onConfirm={() => {
          cancelTask(cancelling.id)
          toast.success('Task closed')
          setCancelling(null)
        }}
      />
    </div>
  )
}
