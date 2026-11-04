import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardCheck, Repeat } from 'lucide-react'
import CommonBadge from '../../../components/common/CommonBadge'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard, { StatCard } from '../../../components/common/CommonCard'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import AssignInspectorModal from '../../../components/shared/AssignInspectorModal'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import InspectionDetailsDrawer from '../../../components/shared/InspectionDetailsDrawer'
import InspectionFormModal from '../../../components/shared/InspectionFormModal'
import PageHeader from '../../../components/shared/PageHeader'
import { InspectionBadge } from '../../../components/shared/StatusBadge'
import Tabs from '../../../components/shared/Tabs'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useStaffOptions } from '../../../hooks/useStaffOptions'
import { useTableData } from '../../../hooks/useTableData'
import { isWithinRange, timeAgo } from '../../../utils/formatDate'

const TABS = {
  pending: (i) => i.status === 'pending',
  corrective: (i) => i.correctiveStatus === 'open',
  failed: (i) => i.status === 'failed',
  passed: (i) => i.status === 'passed',
  all: () => true,
}

export default function InspectionList() {
  const { inspections, tasks, roomLabel, staffName } = useData()
  const { inspectors } = useStaffOptions()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'pending'
  const [inspector, setInspector] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [inspecting, setInspecting] = useState(null)
  const [reassigning, setReassigning] = useState(null)
  const [detailId, setDetailId] = useState(null)

  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks])
  const done = inspections.filter((i) => i.status !== 'pending')
  const passRate = done.length ? Math.round((done.filter((i) => i.status === 'passed').length / done.length) * 100) : 0

  const filterFn = useCallback(
    (i) => TABS[tab](i) && (inspector === 'all' || i.inspectorId === inspector) && (!from && !to ? true : isWithinRange(i.createdAt, from, to)),
    [tab, inspector, from, to],
  )
  const searchText = useCallback((i) => `${roomLabel(i.roomId)} ${staffName(i.inspectorId)} ${i.remarks} ${i.defects.join(' ')}`, [roomLabel, staffName])
  const sortValue = useCallback((i, key) => (key === 'room' ? roomLabel(i.roomId) : i[key]), [roomLabel])
  const table = useTableData(inspections, { filterFn, searchText, sortValue, initialSort: { key: 'createdAt', dir: 'desc' }, resetKey: `${tab}${inspector}${from}${to}` })

  const setTab = (value) => setParams({ tab: value }, { replace: true })
  const detail = inspections.find((i) => i.id === detailId)

  const actions = (i) =>
    i.status === 'pending' ? (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <CommonButton size="sm" variant="ghost" icon={Repeat} onClick={() => setReassigning(i)}>
          Reassign
        </CommonButton>
        <CommonButton size="sm" variant="soft" icon={ClipboardCheck} onClick={() => setInspecting(i)}>
          Inspect
        </CommonButton>
      </div>
    ) : null

  const columns = [
    { key: 'room', header: 'Room', sortable: true, primary: true, render: (i) => <span className="font-medium text-text-primary">{roomLabel(i.roomId)}</span> },
    { key: 'cleaner', header: 'Cleaned by', render: (i) => staffName(taskById[i.taskId]?.assigneeId) },
    { key: 'inspectorId', header: 'Inspector', render: (i) => staffName(i.inspectorId) },
    { key: 'status', header: 'Result', sortable: true, render: (i) => <InspectionBadge value={i.status} /> },
    {
      key: 'defects',
      header: 'Remarks / defects',
      render: (i) =>
        i.defects.length ? (
          <div className="flex flex-wrap gap-1">
            {i.defects.map((d) => (
              <CommonBadge key={d} tone="error">
                {d}
              </CommonBadge>
            ))}
          </div>
        ) : (
          <span className="block max-w-[14rem] truncate text-text-secondary">{i.remarks || '—'}</span>
        ),
    },
    {
      key: 'correctiveStatus',
      header: 'Corrective action',
      render: (i) =>
        i.correctiveStatus ? (
          <CommonBadge tone={i.correctiveStatus === 'done' ? 'success' : 'warning'} dot>
            {i.correctiveStatus === 'done' ? 'Done' : 'Open'}
          </CommonBadge>
        ) : (
          <span className="text-text-secondary">—</span>
        ),
    },
    { key: 'createdAt', header: 'Submitted', sortable: true, render: (i) => <span className="text-text-secondary">{timeAgo(i.createdAt)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', render: actions },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Inspections" description="The assigned inspector visits the room and approves or rejects it." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending inspections" value={inspections.filter(TABS.pending).length} tone="warning" />
        <StatCard label="Open corrective actions" value={inspections.filter(TABS.corrective).length} tone="error" />
        <StatCard label="Inspections approved" value={inspections.filter(TABS.passed).length} tone="success" />
        <StatCard label="Pass rate" value={`${passRate}%`} tone="primary" hint={`${done.length} completed inspections`} />
      </div>
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'pending', label: 'Pending', count: inspections.filter(TABS.pending).length },
            { value: 'corrective', label: 'Corrective actions', count: inspections.filter(TABS.corrective).length },
            { value: 'failed', label: 'Failed' },
            { value: 'passed', label: 'Passed' },
            { value: 'all', label: 'All' },
          ]}
        />
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search room, inspector, defect" className="sm:w-64" />
          <FilterSelect label="Filter by inspector" value={inspector} onChange={setInspector} options={inspectors.map(({ value, label }) => ({ value, label: label.replace(/ \(.*\)$/, '') }))} allLabel="All inspectors" />
          <div className="flex items-center gap-2">
            <input type="date" aria-label="From date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" />
            <span className="text-text-secondary">–</span>
            <input type="date" aria-label="To date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" />
          </div>
        </FilterBar>
        <CommonTable caption="Inspections" columns={columns} rows={table.rows} sort={table.sort} onSort={table.toggleSort} loading={loading} onRowClick={(i) => setDetailId(i.id)} />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>

      {inspecting && <InspectionFormModal inspection={inspecting} onClose={() => setInspecting(null)} />}
      {reassigning && <AssignInspectorModal inspection={reassigning} onClose={() => setReassigning(null)} />}
      {detail && <InspectionDetailsDrawer inspection={detail} canResolve onClose={() => setDetailId(null)} footer={actions(detail)} />}
    </div>
  )
}
