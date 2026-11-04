import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { BedDouble, BellRing, ClipboardCheck, DoorOpen, LogOut, Sparkles } from 'lucide-react'
import CommonButton from '../../components/common/CommonButton'
import CommonCard, { StatCard } from '../../components/common/CommonCard'
import CommonConfirmDialog from '../../components/common/CommonConfirmDialog'
import CommonEmptyState from '../../components/common/CommonEmptyState'
import { PageSkeleton } from '../../components/common/CommonLoader'
import { useToast } from '../../components/common/CommonToast'
import ActivityFeed from '../../components/shared/ActivityFeed'
import DateRangeFilter from '../../components/shared/DateRangeFilter'
import PageHeader from '../../components/shared/PageHeader'
import { TaskStatusBadge } from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useDateRange } from '../../hooks/useDateRange'
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading'
import { isWithinRange, timeAgo } from '../../utils/formatDate'
import RequestForm from './housekeeping/RequestForm'

const OPEN = ['pending', 'assigned', 'in_progress', 'inspection']

export default function ClientDashboard() {
  const { user } = useAuth()
  const { rooms, tasks, inspections, maintenance, activities, myNotifications, unreadCount, staffName, roomLabel, markOccupied } = useData()
  const toast = useToast()
  const { openNotifications } = useOutletContext()
  const loading = useSimulatedLoading()
  const [range, setRange] = useDateRange('today')
  const [requestOpen, setRequestOpen] = useState(false)
  const [occupying, setOccupying] = useState(null)

  const active = rooms.filter((r) => r.active)
  const ready = active.filter((r) => r.status === 'readyToUse').sort((a, b) => a.number.localeCompare(b.number))
  const myRequests = tasks.filter((t) => t.requestedBy === user.id && OPEN.includes(t.status))
  const myInspections = inspections.filter((i) => i.inspectorId === user.staffId && i.status === 'pending')
  const myRepairs = maintenance.filter((m) => m.reportedBy === user.staffId && m.status !== 'completed')
  // Activity relevant to the front desk: room changes and inspections.
  const feed = useMemo(
    () => activities.filter((a) => (['room', 'inspection'].includes(a.type) || a.actorId === user.staffId) && isWithinRange(a.at, range.from, range.to)),
    [activities, user.staffId, range.from, range.to],
  )
  const notifications = useMemo(() => myNotifications.filter((n) => isWithinRange(n.createdAt, range.from, range.to)), [myNotifications, range.from, range.to])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        description="Reception at a glance."
        actions={
          <>
            <DateRangeFilter value={range} onChange={setRange} />
            <CommonButton icon={LogOut} onClick={() => setRequestOpen(true)}>
              Check out a room
            </CommonButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ready to allocate" value={ready.length} icon={DoorOpen} tone="success" hint="View rooms" to="/client/rooms?group=ready" />
        <StatCard label="Occupied now" value={active.filter((r) => r.status === 'occupied').length} icon={BedDouble} tone="violet" hint="Room board" to="/client/rooms?group=occupied" />
        <StatCard label="My open requests" value={myRequests.length + myRepairs.length} icon={Sparkles} tone="info" hint={`${myRequests.length} housekeeping · ${myRepairs.length} repair`} to="/client/housekeeping" />
        <StatCard label="Waiting for your inspection" value={myInspections.length} icon={ClipboardCheck} tone="warning" hint="Inspect now" to="/client/inspections" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CommonCard title="Ready now" subtitle="Approved rooms you can allocate" bodyClassName="p-0" className="lg:col-span-1">
          {ready.length === 0 ? (
            <CommonEmptyState compact icon={DoorOpen} title="No rooms ready yet" description="Rooms appear here once they pass inspection." />
          ) : (
            <ul className="divide-y divide-border">
              {ready.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Room {r.number}</p>
                    <p className="text-xs text-text-secondary">{r.type}</p>
                  </div>
                  <CommonButton size="sm" variant="soft" onClick={() => setOccupying(r)}>
                    Mark Occupied
                  </CommonButton>
                </li>
              ))}
            </ul>
          )}
        </CommonCard>

        <CommonCard
          title="My open requests"
          subtitle="Housekeeping requests you raised"
          bodyClassName="p-0"
          actions={
            <Link to="/client/housekeeping" className="text-xs font-medium text-primary hover:text-primary-hover">
              View all
            </Link>
          }
        >
          {myRequests.length === 0 ? (
            <CommonEmptyState compact title="Nothing pending" description="All your requests are complete." />
          ) : (
            <ul className="divide-y divide-border">
              {myRequests.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{roomLabel(t.roomId)}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {t.assigneeId ? staffName(t.assigneeId) : 'Waiting for assignment'} · {timeAgo(t.createdAt)}
                    </p>
                  </div>
                  <TaskStatusBadge value={t.status} />
                </li>
              ))}
            </ul>
          )}
        </CommonCard>

        <CommonCard
          title="Notifications"
          subtitle={unreadCount ? `${unreadCount} unread` : 'All caught up'}
          bodyClassName="p-0"
          actions={
            <button type="button" onClick={openNotifications} className="text-xs font-medium text-primary hover:text-primary-hover">
              See all
            </button>
          }
        >
          {notifications.length === 0 ? (
            <CommonEmptyState compact icon={BellRing} title="No notifications" description="Nothing in this period." />
          ) : (
            <ul className="divide-y divide-border">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="px-4 py-2.5">
                  <p className={`text-sm ${n.readBy.includes(user.id) ? 'text-text-primary' : 'font-semibold text-text-primary'}`}>{n.title}</p>
                  <p className="text-xs text-text-secondary">{timeAgo(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </CommonCard>
      </div>

      <CommonCard title="Recent room updates" subtitle={`Occupancy, checkouts and inspections · ${range.label}`}>
        <ActivityFeed items={feed} staffName={staffName} limit={6} />
      </CommonCard>

      <RequestForm open={requestOpen} onClose={() => setRequestOpen(false)} />
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
