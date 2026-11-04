import { useCallback, useState } from 'react'
import { Pencil, Plus, Power } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonConfirmDialog from '../../../components/common/CommonConfirmDialog'
import CommonDrawer from '../../../components/common/CommonDrawer'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonSelect from '../../../components/common/CommonSelect'
import CommonTable from '../../../components/common/CommonTable'
import { useToast } from '../../../components/common/CommonToast'
import { Avatar } from '../../../components/layout/HeaderShell'
import DetailList from '../../../components/shared/DetailList'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import { ActiveBadge, AvailabilityBadge, InspectionBadge, MaintenanceBadge, TaskStatusBadge } from '../../../components/shared/StatusBadge'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useTableData } from '../../../hooks/useTableData'
import { STAFF_AVAILABILITY, STAFF_ROLES } from '../../../utils/constants'
import { formatDate, timeAgo } from '../../../utils/formatDate'
import StaffForm from './StaffForm'

const roleLabel = (r) => STAFF_ROLES.find((x) => x.value === r)?.label ?? r
const panelAccess = { super_admin: 'Admin panel', receptionist: 'Client (Reception) panel', housekeeper: 'Mobile app only', maintenance: 'No app access (assumption)' }

export default function StaffList() {
  const { staff, tasks, inspections, maintenance, roomLabel, toggleStaffActive, saveStaff } = useData()
  const toast = useToast()
  const loading = useSimulatedLoading()
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [viewId, setViewId] = useState(null)

  const activeLoad = (id) => tasks.filter((t) => t.assigneeId === id && ['assigned', 'in_progress'].includes(t.status)).length

  const filterFn = useCallback(
    (s) => (role === 'all' || s.role === role) && (status === 'all' || (status === 'active' ? s.active : status === 'inactive' ? !s.active : s.availability === status)),
    [role, status],
  )
  const searchText = useCallback((s) => `${s.name} ${s.employeeId} ${s.email} ${s.phone}`, [])
  const table = useTableData(staff, { filterFn, searchText, initialSort: { key: 'name', dir: 'asc' }, resetKey: `${role}${status}` })

  const viewing = staff.find((s) => s.id === viewId)

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      primary: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.name} size="h-8 w-8" />
          <div className="min-w-0">
            <p className="font-medium text-text-primary">{s.name}</p>
            <p className="truncate text-xs text-text-secondary">
              {s.employeeId} · {s.email}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', sortable: true, render: (s) => roleLabel(s.role) },
    { key: 'shift', header: 'Shift', sortable: true },
    { key: 'availability', header: 'Availability', render: (s) => <AvailabilityBadge value={s.availability} /> },
    { key: 'load', header: 'Active tasks', render: (s) => (s.role === 'housekeeper' ? activeLoad(s.id) : '—') },
    { key: 'active', header: 'Account', render: (s) => <ActiveBadge active={s.active} /> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (s) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <CommonButton
            size="sm"
            variant="ghost"
            icon={Pencil}
            aria-label={`Edit ${s.name}`}
            onClick={() => {
              setEditing(s)
              setFormOpen(true)
            }}
          />
          <CommonButton size="sm" variant="ghost" icon={Power} aria-label={s.active ? `Deactivate ${s.name}` : `Activate ${s.name}`} onClick={() => setToggling(s)} disabled={s.id === 's-admin'} />
        </div>
      ),
    },
  ]

  const assignments = viewing
    ? [
        ...tasks.filter((t) => t.assigneeId === viewing.id).map((t) => ({ id: t.id, at: t.createdAt, label: `Cleaning · ${roomLabel(t.roomId, t.location)}`, badge: <TaskStatusBadge value={t.status} /> })),
        ...inspections.filter((i) => i.inspectorId === viewing.id).map((i) => ({ id: i.id, at: i.createdAt, label: `Inspection · ${roomLabel(i.roomId)}`, badge: <InspectionBadge value={i.status} /> })),
        ...maintenance.filter((m) => m.assigneeId === viewing.id).map((m) => ({ id: m.id, at: m.createdAt, label: `Repair · ${m.title}`, badge: <MaintenanceBadge value={m.status} /> })),
      ].sort((a, b) => b.at.localeCompare(a.at))
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description={`${staff.filter((s) => s.active).length} active of ${staff.length} staff records`}
        actions={
          <CommonButton
            icon={Plus}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add staff
          </CommonButton>
        }
      />
      <CommonCard bodyClassName="p-0">
        <FilterBar>
          <CommonSearch value={table.query} onChange={table.setQuery} placeholder="Search name, ID, email" className="sm:w-64" />
          <FilterSelect label="Filter by role" value={role} onChange={setRole} options={STAFF_ROLES} allLabel="All roles" />
          <FilterSelect
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={[{ value: 'active', label: 'Active accounts' }, { value: 'inactive', label: 'Inactive accounts' }, ...STAFF_AVAILABILITY]}
            allLabel="All statuses"
          />
        </FilterBar>
        <CommonTable caption="Staff" columns={columns} rows={table.rows} sort={table.sort} onSort={table.toggleSort} loading={loading} onRowClick={(s) => setViewId(s.id)} />
        <CommonPagination page={table.page} pageSize={table.pageSize} total={table.total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />
      </CommonCard>

      <StaffForm open={formOpen} staff={editing} onClose={() => setFormOpen(false)} />

      {viewing && (
        <CommonDrawer
          open
          onClose={() => setViewId(null)}
          title={viewing.name}
          description={`${roleLabel(viewing.role)} · ${viewing.employeeId}`}
          footer={
            <CommonButton
              variant="secondary"
              icon={Pencil}
              onClick={() => {
                setEditing(viewing)
                setFormOpen(true)
              }}
            >
              Edit
            </CommonButton>
          }
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <ActiveBadge active={viewing.active} />
              <AvailabilityBadge value={viewing.availability} />
            </div>
            <DetailList
              items={[
                ['Email', viewing.email],
                ['Phone', viewing.phone],
                ['Shift', viewing.shift],
                ['Joined', formatDate(viewing.joinedAt)],
                ['Demo panel access', panelAccess[viewing.role]],
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CommonSelect
                label="Demo role"
                options={STAFF_ROLES}
                value={viewing.role}
                disabled={viewing.id === 's-admin'}
                onChange={(e) => {
                  saveStaff({ ...viewing, role: e.target.value }, viewing.id)
                  toast.success('Role updated', `${viewing.name} is now ${roleLabel(e.target.value)}.`)
                }}
              />
              <CommonSelect
                label="Availability"
                options={STAFF_AVAILABILITY}
                value={viewing.availability}
                onChange={(e) => {
                  saveStaff({ ...viewing, availability: e.target.value }, viewing.id)
                  toast.success('Staff status changed')
                }}
              />
            </div>
            <section>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Task assignments</h3>
              {assignments.length === 0 ? (
                <CommonEmptyState compact title="No assignments" />
              ) : (
                <ul className="divide-y divide-border">
                  {assignments.slice(0, 20).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-text-primary">{a.label}</p>
                        <p className="text-xs text-text-secondary">{timeAgo(a.at)}</p>
                      </div>
                      {a.badge}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </CommonDrawer>
      )}

      <CommonConfirmDialog
        open={Boolean(toggling)}
        title={toggling?.active ? `Deactivate ${toggling?.name}?` : `Activate ${toggling?.name}?`}
        message={toggling?.active ? 'Inactive staff cannot be assigned new tasks. Existing history is kept.' : 'The staff member can be assigned tasks again.'}
        confirmLabel={toggling?.active ? 'Deactivate' : 'Activate'}
        tone={toggling?.active ? 'danger' : 'primary'}
        onCancel={() => setToggling(null)}
        onConfirm={() => {
          toggleStaffActive(toggling.id)
          toast.success(toggling.active ? 'Account deactivated' : 'Account activated', toggling.name)
          setToggling(null)
        }}
      />
    </div>
  )
}
