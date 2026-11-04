import { useMemo, useState } from 'react'
import CommonCard from '../../../components/common/CommonCard'
import { PageSkeleton } from '../../../components/common/CommonLoader'
import PageHeader from '../../../components/shared/PageHeader'
import ReportView from '../../../components/shared/ReportView'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { INSPECTION_STATUS, MAINTENANCE_STATUS, ROOM_STATUS } from '../../../utils/constants'
import { formatDateTime, isWithinRange, toInputDate } from '../../../utils/formatDate'

const daysBack = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toInputDate(d)
}

// APK "Reception Report": rooms occupied / checked out by this receptionist
// plus their inspections and repair reports. Scoped to the logged-in user.
export default function MyReports() {
  const { user } = useAuth()
  const { rooms, activities, inspections, maintenance, roomLabel } = useData()
  const loading = useSimulatedLoading()
  const [from, setFrom] = useState(daysBack(6))
  const [to, setTo] = useState(toInputDate())

  const report = useMemo(() => {
    const inRange = (d) => isWithinRange(d, from, to)
    const mineActs = activities.filter((a) => a.actorId === user.staffId && inRange(a.at))
    const checkouts = mineActs.filter((a) => a.kind === 'checkout')
    const occupied = mineActs.filter((a) => a.kind === 'occupied')
    const inspected = inspections.filter((i) => i.inspectorId === user.staffId && i.status !== 'pending' && inRange(i.inspectedAt))
    const repairs = maintenance.filter((m) => m.reportedBy === user.staffId && inRange(m.createdAt))
    const rows = [
      ...checkouts.map((a) => ({ id: a.id, at: a.at, what: 'Checked out', room: roomLabel(a.roomId), detail: '' })),
      ...occupied.map((a) => ({ id: a.id, at: a.at, what: 'Marked occupied', room: roomLabel(a.roomId), detail: '' })),
      ...inspected.map((i) => ({ id: i.id, at: i.inspectedAt, what: 'Inspection', room: roomLabel(i.roomId), detail: INSPECTION_STATUS[i.status].label })),
      ...repairs.map((m) => ({ id: m.id, at: m.createdAt, what: 'Repair reported', room: roomLabel(m.roomId, m.location), detail: `${m.title} · ${MAINTENANCE_STATUS[m.status].label}` })),
    ].sort((a, b) => b.at.localeCompare(a.at))

    const active = rooms.filter((r) => r.active)
    return {
      stats: [
        { label: 'Rooms checked out', value: checkouts.length, tone: 'warning' },
        { label: 'Rooms occupied', value: occupied.length, tone: 'violet' },
        { label: 'Inspections done', value: inspected.length, tone: 'success' },
        { label: 'Repairs reported', value: repairs.length, tone: 'error' },
      ],
      chart: {
        title: 'Current room status',
        subtitle: 'Hotel-wide snapshot (read-only)',
        kind: 'bar',
        data: Object.entries(ROOM_STATUS)
          .map(([k, s]) => ({ key: k, label: s.label, value: active.filter((r) => r.status === k).length }))
          .filter((b) => b.value)
          .sort((a, b) => b.value - a.value),
      },
      rows,
      columns: [
        { key: 'at', header: 'Date', value: (r) => formatDateTime(r.at) },
        { key: 'what', header: 'Activity' },
        { key: 'room', header: 'Room / Area' },
        { key: 'detail', header: 'Details' },
      ],
    }
  }, [activities, inspections, maintenance, rooms, roomLabel, user.staffId, from, to])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <PageHeader title="My Reports" description="Your front desk activity. Hotel-wide staff and inventory reports are available to the Super Admin only." />
      <CommonCard>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="r-from" className="text-sm text-text-secondary">
            From
          </label>
          <input id="r-from" type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" />
          <label htmlFor="r-to" className="text-sm text-text-secondary">
            to
          </label>
          <input id="r-to" type="date" value={to} min={from} max={toInputDate()} onChange={(e) => e.target.value && setTo(e.target.value)} className="field-control min-w-0 flex-1 sm:w-auto sm:flex-none" />
        </div>
      </CommonCard>
      <ReportView report={report} filename={`reception-report_${user.employeeId}_${from}_to_${to}`} />
    </div>
  )
}
