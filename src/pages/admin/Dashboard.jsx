import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BedDouble,
  BedSingle,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  Sparkles,
  SprayCan,
  Wrench,
} from 'lucide-react'
import CommonBadge from '../../components/common/CommonBadge'
import CommonButton from '../../components/common/CommonButton'
import CommonCard, { StatCard } from '../../components/common/CommonCard'
import CommonEmptyState from '../../components/common/CommonEmptyState'
import { PageSkeleton } from '../../components/common/CommonLoader'
import ActivityFeed from '../../components/shared/ActivityFeed'
import BarList from '../../components/shared/BarList'
import ColumnChart from '../../components/shared/ColumnChart'
import DateRangeFilter from '../../components/shared/DateRangeFilter'
import PageHeader from '../../components/shared/PageHeader'
import { PriorityBadge } from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { buildAdminStats } from '../../data/dashboardData'
import { eachDay, useDateRange } from '../../hooks/useDateRange'
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading'
import { ROOM_STATUS } from '../../utils/constants'
import { isWithinRange, timeAgo, toInputDate } from '../../utils/formatDate'

const dayLabel = (d, opts) => d.toLocaleDateString('en-IN', opts)

// Completed cleanings per day across the range; long ranges are grouped by week.
function buildCleaningSeries(tasks, from, to) {
  const days = eachDay(from, to)
  const weekly = days.length > 45
  const buckets = []
  days.forEach((d, i) => {
    if (!weekly || i % 7 === 0) {
      buckets.push({ start: d, end: d })
    }
    buckets[buckets.length - 1].end = d
  })
  const done = tasks.filter((t) => t.status === 'completed' && t.completedAt)
  const data = buckets.map((b) => {
    const start = toInputDate(b.start)
    const end = toInputDate(b.end)
    const value = done.filter((t) => isWithinRange(t.completedAt, start, end)).length
    return weekly
      ? { key: start, label: `Week of ${dayLabel(b.start, { day: 'numeric', month: 'short' })}`, short: dayLabel(b.start, { day: 'numeric', month: 'short' }), value }
      : {
          key: start,
          label: dayLabel(b.start, { weekday: 'long', day: 'numeric', month: 'short' }),
          short: days.length <= 7 ? dayLabel(b.start, { weekday: 'short' }) : dayLabel(b.start, { day: 'numeric', month: 'short' }),
          value,
        }
  })
  return { weekly, data }
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const data = useData()
  const { rooms, tasks, inventory, activities, staffName, roomLabel } = data
  const loading = useSimulatedLoading()
  const [range, setRange] = useDateRange('last7')
  const stats = useMemo(() => buildAdminStats(data), [data])

  const statusBars = useMemo(
    () =>
      Object.entries(ROOM_STATUS)
        .map(([key, s]) => ({
          key,
          label: s.label,
          value: rooms.filter((r) => r.active && r.status === key).length,
          to: `/admin/rooms?status=${key}`,
        }))
        .filter((b) => b.value > 0)
        .sort((a, b) => b.value - a.value),
    [rooms],
  )

  const cleaning = useMemo(() => buildCleaningSeries(tasks, range.from, range.to), [tasks, range.from, range.to])
  const completedInRange = cleaning.data.reduce((sum, d) => sum + d.value, 0)
  const activitiesInRange = useMemo(() => activities.filter((a) => isWithinRange(a.at, range.from, range.to)), [activities, range.from, range.to])

  const waiting = tasks.filter((t) => t.status === 'pending')
  const lowStock = inventory.filter((i) => i.stock <= i.minStock).sort((a, b) => a.stock / a.minStock - b.stock / b.minStock)

  if (loading) return <PageSkeleton cards={8} />

  const cards = [
    { label: 'Total rooms', value: stats.totalRooms, icon: BedDouble, tone: 'primary', hint: 'Active rooms', to: '/admin/rooms' },
    { label: 'Available rooms', value: stats.availableRooms, icon: DoorOpen, tone: 'success', hint: 'Ready to allocate', to: '/admin/rooms?status=readyToUse' },
    { label: 'Occupied rooms', value: stats.occupiedRooms, icon: BedSingle, tone: 'violet', hint: 'Guests in house', to: '/admin/rooms?status=occupied' },
    { label: 'Rooms requiring cleaning', value: stats.roomsToClean, icon: SprayCan, tone: 'warning', hint: 'Incl. failed inspections', to: '/admin/rooms?status=cleaningRequired' },
    { label: 'Pending housekeeping', value: stats.pendingTasks, icon: Sparkles, tone: 'info', hint: 'Waiting, assigned or in progress', to: '/admin/housekeeping?tab=active' },
    { label: 'Cleanings completed', value: completedInRange, icon: CheckCircle2, tone: 'success', hint: `${range.label} · ${stats.completedTotal} all time`, to: '/admin/housekeeping?tab=completed' },
    { label: 'Pending inspections', value: stats.pendingInspections, icon: ClipboardCheck, tone: 'violet', hint: 'Awaiting inspector', to: '/admin/inspections?tab=pending' },
    { label: 'Open maintenance', value: stats.openMaintenance, icon: Wrench, tone: 'error', hint: 'Reported or under repair', to: '/admin/maintenance?tab=open' },
    { label: 'Inventory alerts', value: stats.inventoryAlerts, icon: Boxes, tone: 'error', hint: 'At or below minimum', to: '/admin/inventory?stock=low' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description={`${data.settings.hotelName} operations overview · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={
          <>
            <DateRangeFilter value={range} onChange={setRange} />
            <CommonButton to="/admin/housekeeping?new=1" icon={Sparkles}>
              New Cleaning Task
            </CommonButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CommonCard title="Room status overview" subtitle="Tap a status to see its rooms" className="lg:col-span-1">
          <BarList items={statusBars} />
        </CommonCard>

        <CommonCard
          title="Waiting for assignment"
          subtitle="Rooms that need a housekeeper"
          className="lg:col-span-1"
          actions={
            <Link to="/admin/housekeeping?tab=pending" className="text-xs font-medium text-primary hover:text-primary-hover">
              See all
            </Link>
          }
          bodyClassName="p-0"
        >
          {waiting.length === 0 ? (
            <CommonEmptyState compact icon={CheckCircle2} title="All requests handled" description="Every room has a housekeeper." />
          ) : (
            <ul className="divide-y divide-border">
              {waiting.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{roomLabel(t.roomId, t.location)}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {t.notes || 'Cleaning required'} · {timeAgo(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge value={t.priority} />
                    <CommonButton size="sm" variant="soft" to={`/admin/housekeeping?assign=${t.id}`}>
                      Assign
                    </CommonButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CommonCard>

        <CommonCard
          title="Inventory alerts"
          subtitle="Central stock at or below minimum"
          className="lg:col-span-1"
          actions={
            <Link to="/admin/inventory?stock=low" className="text-xs font-medium text-primary hover:text-primary-hover">
              View low stock
            </Link>
          }
          bodyClassName="p-0"
        >
          {lowStock.length === 0 ? (
            <CommonEmptyState compact icon={Boxes} title="All clear" description="No low-stock items." />
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{i.name}</p>
                    <p className="text-xs text-text-secondary">
                      {i.stock} {i.unit} left · min {i.minStock}
                    </p>
                  </div>
                  <CommonBadge tone={i.stock === 0 ? 'error' : 'warning'} dot>
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                    {i.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </CommonBadge>
                </li>
              ))}
            </ul>
          )}
        </CommonCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <CommonCard title={cleaning.weekly ? 'Rooms cleaned per week' : 'Rooms cleaned per day'} subtitle={`Completed cleanings · ${range.label}`} className="lg:col-span-2">
          <ColumnChart data={cleaning.data} label={`Rooms cleaned, ${range.label}`} />
        </CommonCard>
        <CommonCard
          title="Recent activities"
          subtitle={`Activity across the hotel · ${range.label}`}
          className="lg:col-span-3"
          actions={
            <Link to="/admin/activity" className="text-xs font-medium text-primary hover:text-primary-hover">
              View all
            </Link>
          }
        >
          <ActivityFeed items={activitiesInRange} staffName={staffName} limit={7} />
        </CommonCard>
      </div>
    </div>
  )
}
