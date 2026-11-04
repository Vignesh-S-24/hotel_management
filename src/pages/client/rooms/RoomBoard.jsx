import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BedDouble, DoorOpen, LogOut, Sparkles, Wrench } from 'lucide-react'
import CommonBadge, { toneDot } from '../../../components/common/CommonBadge'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonConfirmDialog from '../../../components/common/CommonConfirmDialog'
import CommonDrawer from '../../../components/common/CommonDrawer'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import { PageSkeleton } from '../../../components/common/CommonLoader'
import CommonSearch from '../../../components/common/CommonSearch'
import { useToast } from '../../../components/common/CommonToast'
import DetailList from '../../../components/shared/DetailList'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import MaintenanceFormModal from '../../../components/shared/MaintenanceFormModal'
import PageHeader from '../../../components/shared/PageHeader'
import { RoomStatusBadge } from '../../../components/shared/StatusBadge'
import { useData } from '../../../context/DataContext'
import { useDebounce } from '../../../hooks/useDebounce'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { FLOORS, ROOM_STATUS, ROOM_STATUS_OPTIONS, ROOM_TYPES } from '../../../utils/constants'
import { formatDateTime } from '../../../utils/formatDate'
import RequestForm from '../housekeeping/RequestForm'

// Reception groups the ten statuses into what matters at the front desk.
const AVAILABILITY = {
  ready: { label: 'Ready now', statuses: ['readyToUse'] },
  occupied: { label: 'Occupied', statuses: ['occupied'] },
  preparing: { label: 'Being prepared', statuses: ['vacant', 'cleaningRequired', 'cleaningAssigned', 'cleaningInProgress', 'inspectionPending', 'inspectionFailed'] },
  blocked: { label: 'Out of order', statuses: ['repairRequired', 'underRepair'] },
}

// APK "Room Board": read-only status plus the front-desk actions
// (Check Out, Mark Occupied, report a repair). No editing of room records.
export default function RoomBoard() {
  const { rooms, tasks, staffName, markOccupied } = useData()
  const toast = useToast()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const group = params.get('group') ?? 'all'
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [request, setRequest] = useState(null)
  const [repairRoom, setRepairRoom] = useState(null)
  const [occupying, setOccupying] = useState(null)
  const q = useDebounce(query, 200).trim()

  const visible = useMemo(
    () =>
      rooms
        .filter((r) => r.active)
        .filter((r) => (group === 'all' || AVAILABILITY[group].statuses.includes(r.status)) && (status === 'all' || r.status === status) && (type === 'all' || r.type === type) && (!q || r.number.includes(q)))
        .sort((a, b) => a.number.localeCompare(b.number)),
    [rooms, group, status, type, q],
  )

  const counts = useMemo(() => Object.fromEntries(Object.entries(AVAILABILITY).map(([k, g]) => [k, rooms.filter((r) => r.active && g.statuses.includes(r.status)).length])), [rooms])
  const selected = rooms.find((r) => r.id === selectedId)
  const selectedTask = selected && tasks.find((t) => t.roomId === selected.id && ['pending', 'assigned', 'in_progress', 'inspection'].includes(t.status))

  if (loading) return <PageSkeleton cards={4} rows={4} />

  const setGroup = (g) => setParams(g === 'all' ? {} : { group: g }, { replace: true })

  return (
    <div className="space-y-6">
      <PageHeader title="Rooms" description="Front desk and room occupancy. Status updates live as housekeeping works." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Filter by availability">
        {Object.entries(AVAILABILITY).map(([key, g]) => (
          <button
            key={key}
            type="button"
            onClick={() => setGroup(group === key ? 'all' : key)}
            aria-pressed={group === key}
            className={`card p-4 text-left transition ${group === key ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40'}`}
          >
            <p className="text-sm text-text-secondary">{g.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{counts[key]}</p>
          </button>
        ))}
      </div>

      <CommonCard bodyClassName="p-0">
        <FilterBar>
          <CommonSearch value={query} onChange={setQuery} placeholder="Search room number" className="sm:w-56" />
          <FilterSelect label="Filter by status" value={status} onChange={setStatus} options={ROOM_STATUS_OPTIONS} allLabel="All statuses" />
          <FilterSelect label="Filter by room type" value={type} onChange={setType} options={ROOM_TYPES.map((t) => ({ value: t, label: t }))} allLabel="All types" />
          {(group !== 'all' || status !== 'all' || type !== 'all' || query) && (
            <CommonButton
              size="sm"
              variant="ghost"
              onClick={() => {
                setGroup('all')
                setStatus('all')
                setType('all')
                setQuery('')
              }}
            >
              Clear filters
            </CommonButton>
          )}
        </FilterBar>
        {visible.length === 0 ? (
          <CommonEmptyState icon={BedDouble} title="No rooms match" description="Try another filter or room number." />
        ) : (
          <div className="space-y-6 p-4">
            {FLOORS.map((floor) => {
              const list = visible.filter((r) => r.floor === floor)
              if (!list.length) return null
              return (
                <section key={floor} aria-labelledby={`floor-${floor}`}>
                  <h2 id={`floor-${floor}`} className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Floor {floor}
                  </h2>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                    {list.map((r) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => setSelectedId(r.id)} className="card relative w-full overflow-hidden p-3 text-left transition hover:border-primary/40" aria-label={`Room ${r.number}, ${ROOM_STATUS[r.status].label}`}>
                          <span className={`absolute inset-y-0 left-0 w-1 ${toneDot[ROOM_STATUS[r.status].tone]}`} aria-hidden />
                          <p className="text-lg font-semibold text-text-primary">{r.number}</p>
                          <p className="mb-2 text-xs text-text-secondary">{r.type}</p>
                          <RoomStatusBadge value={r.status} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </CommonCard>

      {selected && (
        <CommonDrawer
          open
          onClose={() => setSelectedId(null)}
          title={`Room ${selected.number}`}
          description={`${selected.type} · Floor ${selected.floor}`}
          footer={
            <>
              <CommonButton variant="ghost" icon={Wrench} onClick={() => setRepairRoom(selected.id)}>
                Report issue
              </CommonButton>
              {selected.status === 'occupied' && !selectedTask && (
                <>
                  <CommonButton variant="secondary" icon={Sparkles} onClick={() => setRequest({ roomId: selected.id, type: 'daily' })}>
                    Request service
                  </CommonButton>
                  <CommonButton icon={LogOut} onClick={() => setRequest({ roomId: selected.id, type: 'checkout' })}>
                    Check Out
                  </CommonButton>
                </>
              )}
              {selected.status === 'readyToUse' && (
                <CommonButton icon={DoorOpen} onClick={() => setOccupying(selected)}>
                  Mark Occupied
                </CommonButton>
              )}
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <RoomStatusBadge value={selected.status} />
              {selected.status === 'readyToUse' && <CommonBadge tone="success">Can be allocated</CommonBadge>}
              {['repairRequired', 'underRepair'].includes(selected.status) && <CommonBadge tone="error">Blocked from allocation until fixed</CommonBadge>}
            </div>
            <DetailList
              items={[
                ['Beds', selected.beds],
                ['Max occupancy', `${selected.maxOccupancy} guests`],
                ['Last cleaned', formatDateTime(selected.lastCleanedAt)],
                ['Last inspected', formatDateTime(selected.lastInspectedAt)],
                selectedTask && ['Housekeeper', selectedTask.assigneeId ? staffName(selectedTask.assigneeId) : 'Waiting for assignment'],
              ]}
            />
            {selectedTask && <p className="rounded-lg bg-info-soft px-3 py-2 text-sm text-info">A housekeeping task is already open for this room.</p>}
          </div>
        </CommonDrawer>
      )}

      <RequestForm open={Boolean(request)} initialRoomId={request?.roomId} initialType={request?.type} onClose={() => setRequest(null)} />
      <MaintenanceFormModal open={Boolean(repairRoom)} initialRoomId={repairRoom ?? ''} onClose={() => setRepairRoom(null)} />
      <CommonConfirmDialog
        open={Boolean(occupying)}
        tone="primary"
        title={`Mark Room ${occupying?.number} occupied?`}
        message="Use this when a guest has been allocated the room."
        confirmLabel="Mark Occupied"
        onCancel={() => setOccupying(null)}
        onConfirm={() => {
          markOccupied(occupying.id)
          toast.success('Room occupied', `Room ${occupying.number} is now occupied.`)
          setOccupying(null)
        }}
      />
    </div>
  )
}
