import { INSPECTION_STATUS, MAINTENANCE_STATUS, MOVEMENT_TYPES, PRIORITIES, ROOM_STATUS, STAFF_ROLES, TASK_STATUS } from '../../../utils/constants'
import { formatDateTime, isWithinRange, minutesBetween } from '../../../utils/formatDate'

const avg = (nums) => (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0)
const countBy = (list, keyFn) => list.reduce((acc, x) => ({ ...acc, [keyFn(x)]: (acc[keyFn(x)] ?? 0) + 1 }), {})
const toBars = (obj, labelFn = (k) => k) =>
  Object.entries(obj)
    .map(([k, v]) => ({ key: k, label: labelFn(k), value: v }))
    .sort((a, b) => b.value - a.value)

function daysBetween(from, to) {
  const days = []
  const d = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  while (d <= end && days.length < 62) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

export const REPORT_TYPES = [
  { value: 'rooms', label: 'Room status', statusOptions: Object.entries(ROOM_STATUS).map(([value, s]) => ({ value, label: s.label })) },
  { value: 'housekeeping', label: 'Housekeeping', statusOptions: Object.entries(TASK_STATUS).map(([value, s]) => ({ value, label: s.label })) },
  { value: 'inspections', label: 'Inspections', statusOptions: Object.entries(INSPECTION_STATUS).map(([value, s]) => ({ value, label: s.label })) },
  { value: 'staff', label: 'Staff activity', statusOptions: STAFF_ROLES.filter((r) => r.value !== 'maintenance') },
  {
    value: 'inventory',
    label: 'Inventory',
    statusOptions: [
      { value: 'low', label: 'Low or out of stock' },
      { value: 'ok', label: 'In stock' },
    ],
  },
  { value: 'maintenance', label: 'Maintenance', statusOptions: Object.entries(MAINTENANCE_STATUS).map(([value, s]) => ({ value, label: s.label })) },
]

export function buildReport(type, data, { from, to, status }) {
  const { rooms, tasks, inspections, staff, inventory, movements, maintenance, staffName, roomLabel } = data
  const inRange = (d) => isWithinRange(d, from, to)
  const match = (v) => status === 'all' || v === status

  if (type === 'rooms') {
    const rows = rooms.filter((r) => r.active && match(r.status)).sort((a, b) => a.number.localeCompare(b.number))
    const active = rooms.filter((r) => r.active)
    return {
      note: 'Snapshot of current room status (date range does not apply).',
      stats: [
        { label: 'Active rooms', value: active.length, tone: 'primary' },
        { label: 'Ready to use', value: active.filter((r) => r.status === 'readyToUse').length, tone: 'success' },
        { label: 'Occupied', value: active.filter((r) => r.status === 'occupied').length, tone: 'violet' },
        { label: 'Out of order', value: active.filter((r) => ['repairRequired', 'underRepair'].includes(r.status)).length, tone: 'error' },
      ],
      chart: { title: 'Rooms by status', kind: 'bar', data: toBars(countBy(active, (r) => r.status), (k) => ROOM_STATUS[k].label) },
      rows,
      columns: [
        { key: 'number', header: 'Room' },
        { key: 'floor', header: 'Floor' },
        { key: 'type', header: 'Type' },
        { key: 'status', header: 'Status', value: (r) => ROOM_STATUS[r.status].label },
        { key: 'lastCleanedAt', header: 'Last cleaned', value: (r) => formatDateTime(r.lastCleanedAt) },
        { key: 'lastInspectedAt', header: 'Last inspected', value: (r) => formatDateTime(r.lastInspectedAt) },
      ],
    }
  }

  if (type === 'housekeeping') {
    const rows = tasks.filter((t) => inRange(t.createdAt) && match(t.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const done = rows.filter((t) => t.status === 'completed')
    return {
      stats: [
        { label: 'Tasks', value: rows.length, tone: 'primary' },
        { label: 'Completed', value: done.length, tone: 'success' },
        { label: 'Avg cleaning time', value: `${avg(done.map((t) => minutesBetween(t.startedAt, t.submittedAt)).filter((x) => x != null))} min`, tone: 'info' },
        { label: 'Re-cleans', value: rows.filter((t) => t.attempts > 1).length, tone: 'warning', hint: 'Sent back after inspection' },
      ],
      chart: {
        title: 'Rooms cleaned per day',
        kind: 'column',
        data: daysBetween(from, to).map((d) => ({
          key: d.toDateString(),
          label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          short: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          value: done.filter((t) => new Date(t.completedAt).toDateString() === d.toDateString()).length,
        })),
      },
      rows,
      columns: [
        { key: 'room', header: 'Room / Area', value: (t) => roomLabel(t.roomId, t.location) },
        { key: 'assignee', header: 'Housekeeper', value: (t) => staffName(t.assigneeId) },
        { key: 'priority', header: 'Priority', value: (t) => PRIORITIES[t.priority].label },
        { key: 'status', header: 'Status', value: (t) => TASK_STATUS[t.status].label },
        { key: 'createdAt', header: 'Created', value: (t) => formatDateTime(t.createdAt) },
        { key: 'minutes', header: 'Minutes', value: (t) => minutesBetween(t.startedAt, t.submittedAt) ?? '' },
        { key: 'attempts', header: 'Attempts' },
      ],
    }
  }

  if (type === 'inspections') {
    const rows = inspections.filter((i) => inRange(i.createdAt) && match(i.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const decided = rows.filter((i) => i.status !== 'pending')
    const passed = decided.filter((i) => i.status === 'passed').length
    return {
      stats: [
        { label: 'Inspections', value: rows.length, tone: 'primary' },
        { label: 'Approved', value: passed, tone: 'success' },
        { label: 'Rejected', value: decided.length - passed, tone: 'error' },
        { label: 'Pass rate', value: `${decided.length ? Math.round((passed / decided.length) * 100) : 0}%`, tone: 'info' },
      ],
      chart: { title: 'Inspections by inspector', kind: 'bar', data: toBars(countBy(rows, (i) => i.inspectorId), staffName) },
      rows,
      columns: [
        { key: 'room', header: 'Room', value: (i) => roomLabel(i.roomId) },
        { key: 'inspector', header: 'Inspector', value: (i) => staffName(i.inspectorId) },
        { key: 'status', header: 'Result', value: (i) => INSPECTION_STATUS[i.status].label },
        { key: 'defects', header: 'Defects', value: (i) => i.defects.join('; ') },
        { key: 'remarks', header: 'Remarks' },
        { key: 'inspectedAt', header: 'Inspected at', value: (i) => formatDateTime(i.inspectedAt) },
      ],
    }
  }

  if (type === 'staff') {
    const people = staff.filter((s) => s.role !== 'maintenance' && match(s.role))
    const rows = people.map((s) => {
      const cleaned = tasks.filter((t) => t.assigneeId === s.id && t.status === 'completed' && inRange(t.completedAt))
      const inspected = inspections.filter((i) => i.inspectorId === s.id && i.status !== 'pending' && inRange(i.inspectedAt))
      const sentBack = tasks.filter((t) => t.assigneeId === s.id && t.attempts > 1 && inRange(t.createdAt)).length
      return {
        id: s.id,
        name: s.name,
        role: STAFF_ROLES.find((r) => r.value === s.role)?.label,
        cleanings: cleaned.length,
        avgMinutes: avg(cleaned.map((t) => minutesBetween(t.startedAt, t.submittedAt)).filter((x) => x != null)),
        inspections: inspected.length,
        sentBack,
      }
    })
    return {
      stats: [
        { label: 'Staff who worked', value: rows.filter((r) => r.cleanings || r.inspections).length, tone: 'primary' },
        { label: 'Cleanings done', value: rows.reduce((a, r) => a + r.cleanings, 0), tone: 'success' },
        { label: 'Inspections signed off', value: rows.reduce((a, r) => a + r.inspections, 0), tone: 'violet' },
        { label: 'Re-cleans', value: rows.reduce((a, r) => a + r.sentBack, 0), tone: 'warning' },
      ],
      chart: { title: 'Cleanings by housekeeper', kind: 'bar', data: rows.filter((r) => r.role === 'Housekeeper').map((r) => ({ key: r.id, label: r.name, value: r.cleanings })).sort((a, b) => b.value - a.value) },
      rows,
      columns: [
        { key: 'name', header: 'Staff' },
        { key: 'role', header: 'Role' },
        { key: 'cleanings', header: 'Cleanings' },
        { key: 'avgMinutes', header: 'Avg minutes', value: (r) => (r.cleanings ? r.avgMinutes : '') },
        { key: 'inspections', header: 'Inspections' },
        { key: 'sentBack', header: 'Sent back' },
      ],
    }
  }

  if (type === 'inventory') {
    const periodMoves = movements.filter((m) => inRange(m.at))
    const rows = inventory
      .map((i) => {
        const mv = periodMoves.filter((m) => m.itemId === i.id)
        const sum = (types) => mv.filter((m) => types.includes(m.type)).reduce((a, m) => a + m.qty, 0)
        return { ...i, received: sum(['in']), issued: sum(['issue']), adjusted: sum(['adjust_up']) - sum(['adjust_down', 'damaged']), state: i.stock <= i.minStock ? 'low' : 'ok' }
      })
      .filter((i) => match(i.state))
    return {
      stats: [
        { label: 'Items', value: rows.length, tone: 'primary' },
        { label: 'Low / out now', value: rows.filter((r) => r.state === 'low').length, tone: 'error' },
        { label: 'Stock movements', value: periodMoves.length, tone: 'info' },
        { label: 'Units issued', value: rows.reduce((a, r) => a + r.issued, 0), tone: 'violet' },
      ],
      chart: { title: 'Top consumed items', subtitle: 'Units issued to housekeepers in this period', kind: 'bar', data: rows.filter((r) => r.issued).map((r) => ({ key: r.id, label: r.name, value: r.issued })).sort((a, b) => b.value - a.value) },
      rows,
      columns: [
        { key: 'name', header: 'Item' },
        { key: 'category', header: 'Category' },
        { key: 'stock', header: 'Central now' },
        { key: 'minStock', header: 'Minimum' },
        { key: 'received', header: 'Received' },
        { key: 'issued', header: 'Issued' },
        { key: 'adjusted', header: 'Adjusted' },
        { key: 'state', header: 'Status', value: (r) => (r.stock === 0 ? 'Out of Stock' : r.state === 'low' ? 'Low Stock' : 'In Stock') },
      ],
      movementTypes: MOVEMENT_TYPES,
    }
  }

  // maintenance
  const rows = maintenance.filter((m) => inRange(m.createdAt) && match(m.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const resolved = rows.filter((m) => m.resolvedAt)
  return {
    stats: [
      { label: 'Requests', value: rows.length, tone: 'primary' },
      { label: 'Still open', value: rows.filter((m) => m.status !== 'completed').length, tone: 'warning' },
      { label: 'Completed', value: resolved.length, tone: 'success' },
      { label: 'Avg resolution', value: `${avg(resolved.map((m) => minutesBetween(m.createdAt, m.resolvedAt) / 60))} h`, tone: 'info', hint: 'Reported → completed' },
    ],
    chart: { title: 'Requests by category', kind: 'bar', data: toBars(countBy(rows, (m) => m.category)) },
    rows,
    columns: [
      { key: 'title', header: 'Issue' },
      { key: 'location', header: 'Room / Area', value: (m) => roomLabel(m.roomId, m.location) },
      { key: 'category', header: 'Category' },
      { key: 'priority', header: 'Priority', value: (m) => PRIORITIES[m.priority].label },
      { key: 'status', header: 'Status', value: (m) => MAINTENANCE_STATUS[m.status].label },
      { key: 'assignee', header: 'Responsible', value: (m) => staffName(m.assigneeId) },
      { key: 'createdAt', header: 'Reported', value: (m) => formatDateTime(m.createdAt) },
      { key: 'resolution', header: 'Resolution' },
    ],
  }
}
