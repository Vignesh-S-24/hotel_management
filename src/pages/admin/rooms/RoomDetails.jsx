import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Power, RefreshCcw, Sparkles, Wrench } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonConfirmDialog from '../../../components/common/CommonConfirmDialog'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import { PageSkeleton } from '../../../components/common/CommonLoader'
import { useToast } from '../../../components/common/CommonToast'
import ActivityFeed from '../../../components/shared/ActivityFeed'
import DetailList from '../../../components/shared/DetailList'
import PageHeader from '../../../components/shared/PageHeader'
import RoomStatusModal from '../../../components/shared/RoomStatusModal'
import RoomDrawer from './RoomDrawer'
import Tabs from '../../../components/shared/Tabs'
import { ActiveBadge, InspectionBadge, MaintenanceBadge, RoomStatusBadge, TaskStatusBadge } from '../../../components/shared/StatusBadge'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { formatDateTime, minutesBetween } from '../../../utils/formatDate'

export default function RoomDetails() {
  const { roomId } = useParams()
  const { roomById, tasks, inspections, maintenance, activities, staffName, toggleRoomActive } = useData()
  const toast = useToast()
  const loading = useSimulatedLoading(250)
  const [tab, setTab] = useState('activity')
  const [statusOpen, setStatusOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(false)
  const room = roomById[roomId]

  if (loading) return <PageSkeleton cards={0} rows={6} />
  if (!room) {
    return (
      <div className="card">
        <CommonEmptyState variant="error" title="Room not found" description="This room does not exist in the demo data." action={<CommonButton to="/admin/rooms">Back to rooms</CommonButton>} />
      </div>
    )
  }

  const roomTasks = tasks.filter((t) => t.roomId === roomId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const roomInspections = inspections.filter((i) => i.roomId === roomId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const roomRepairs = maintenance.filter((m) => m.roomId === roomId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const roomActivity = activities.filter((a) => a.roomId === roomId)
  const current = roomTasks.find((t) => ['pending', 'assigned', 'in_progress', 'inspection'].includes(t.status))

  const tabs = [
    { value: 'activity', label: 'Activity history', count: roomActivity.length },
    { value: 'cleaning', label: 'Cleaning history', count: roomTasks.length },
    { value: 'inspections', label: 'Inspections', count: roomInspections.length },
    { value: 'repairs', label: 'Repairs', count: roomRepairs.length },
  ]

  const row = (key, title, sub, badge) => (
    <li key={key} className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{sub}</p>
      </div>
      {badge}
    </li>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Room ${room.number}`}
        description={`${room.type} · Floor ${room.floor}`}
        actions={
          <>
            <CommonButton variant="secondary" icon={ArrowLeft} to="/admin/rooms">
              All rooms
            </CommonButton>
            <CommonButton variant="secondary" icon={RefreshCcw} onClick={() => setStatusOpen(true)}>
              Update status
            </CommonButton>
            <CommonButton icon={Pencil} onClick={() => setEditDrawerOpen(true)}>
              Edit room
            </CommonButton>
          </>
        }
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <RoomStatusBadge value={room.status} />
          <ActiveBadge active={room.active} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CommonCard title="Room details" className="lg:col-span-2">
          <DetailList
            items={[
              ['Room number', room.number],
              ['Room type', room.type],
              ['Floor', `Floor ${room.floor}`],
              ['Beds', room.beds],
              ['Max occupancy', `${room.maxOccupancy} guests`],
              ['Last cleaned', formatDateTime(room.lastCleanedAt)],
              ['Last inspected', formatDateTime(room.lastInspectedAt)],
              ['Last updated', formatDateTime(room.updatedAt)],
              room.notes && ['Notes', room.notes],
            ]}
          />
        </CommonCard>
        <CommonCard title="Current task">
          {current ? (
            <div className="space-y-3">
              <TaskStatusBadge value={current.status} />
              <DetailList cols={1} items={[['Assigned housekeeper', staffName(current.assigneeId)], ['Created', formatDateTime(current.createdAt)], current.notes && ['Notes', current.notes]]} />
              <CommonButton size="sm" variant="soft" to="/admin/housekeeping?tab=active">
                Open housekeeping
              </CommonButton>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-text-secondary">
              <p>No active cleaning task.</p>
              <div className="flex flex-wrap gap-2">
                <CommonButton size="sm" variant="soft" icon={Sparkles} to={`/admin/housekeeping?new=1&room=${room.id}`}>
                  Assign cleaning
                </CommonButton>
                <CommonButton size="sm" variant="secondary" icon={Wrench} to={`/admin/maintenance?new=1&room=${room.id}`}>
                  Report repair
                </CommonButton>
              </div>
            </div>
          )}
          <div className="mt-4 border-t border-border pt-4">
            <CommonButton size="sm" variant={room.active ? 'ghost' : 'soft'} icon={Power} onClick={() => setConfirmToggle(true)}>
              {room.active ? 'Deactivate room' : 'Activate room'}
            </CommonButton>
          </div>
        </CommonCard>
      </div>

      <CommonCard bodyClassName="p-0">
        <Tabs tabs={tabs} value={tab} onChange={setTab} className="px-4" />
        <div className="p-4 sm:p-5">
          {tab === 'activity' && <ActivityFeed items={roomActivity} staffName={staffName} />}
          {tab === 'cleaning' &&
            (roomTasks.length ? (
              <ul className="divide-y divide-border">
                {roomTasks.map((t) =>
                  row(
                    t.id,
                    `${staffName(t.assigneeId)}${t.attempts > 1 ? ` · attempt ${t.attempts}` : ''}`,
                    `${formatDateTime(t.createdAt)}${minutesBetween(t.startedAt, t.submittedAt) != null ? ` · ${minutesBetween(t.startedAt, t.submittedAt)} min` : ''}`,
                    <TaskStatusBadge value={t.status} />,
                  ),
                )}
              </ul>
            ) : (
              <CommonEmptyState compact title="No cleanings" />
            ))}
          {tab === 'inspections' &&
            (roomInspections.length ? (
              <ul className="divide-y divide-border">
                {roomInspections.map((i) =>
                  row(i.id, `Inspector: ${staffName(i.inspectorId)}`, `${formatDateTime(i.inspectedAt ?? i.createdAt)}${i.remarks ? ` · ${i.remarks}` : ''}`, <InspectionBadge value={i.status} />),
                )}
              </ul>
            ) : (
              <CommonEmptyState compact title="No inspections" />
            ))}
          {tab === 'repairs' &&
            (roomRepairs.length ? (
              <ul className="divide-y divide-border">
                {roomRepairs.map((m) => row(m.id, m.title, `${m.category} · ${formatDateTime(m.createdAt)}${m.resolution ? ` · ${m.resolution}` : ''}`, <MaintenanceBadge value={m.status} />))}
              </ul>
            ) : (
              <CommonEmptyState compact title="No repairs" />
            ))}
        </div>
      </CommonCard>

      {statusOpen && <RoomStatusModal room={room} onClose={() => setStatusOpen(false)} />}
      <RoomDrawer room={room} open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)} />
      <CommonConfirmDialog
        open={confirmToggle}
        title={room.active ? `Deactivate Room ${room.number}?` : `Activate Room ${room.number}?`}
        message={room.active ? 'Inactive rooms are hidden from dashboards and cannot be allocated.' : 'The room will appear on dashboards and the room board again.'}
        confirmLabel={room.active ? 'Deactivate' : 'Activate'}
        tone={room.active ? 'danger' : 'primary'}
        onCancel={() => setConfirmToggle(false)}
        onConfirm={() => {
          toggleRoomActive(room.id)
          setConfirmToggle(false)
          toast.success(room.active ? 'Room deactivated' : 'Room activated')
        }}
      />
    </div>
  )
}
