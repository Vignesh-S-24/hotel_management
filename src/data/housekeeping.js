import { CHECKLIST_ITEMS } from '../utils/constants'
import { daysAgo, hoursAgo } from '../utils/formatDate'

const base = {
  location: '',
  notes: '',
  requestedBy: null,
  assignedAt: null,
  startedAt: null,
  submittedAt: null,
  completedAt: null,
  attempts: 1,
  checklist: [],
}

// Current, open work (consistent with room statuses in rooms.js).
const activeTasks = [
  { id: 't-1001', roomId: 'r-102', type: 'checkout', priority: 'high', status: 'pending', assigneeId: null, requestedBy: 'u-priya', notes: 'Guest checked out early. Next arrival at 2 PM.', createdAt: hoursAgo(1.2) },
  { id: 't-1002', roomId: 'r-209', type: 'checkout', priority: 'normal', status: 'pending', assigneeId: null, requestedBy: 'u-kavya', notes: 'Checked out after late breakfast.', createdAt: hoursAgo(0.6) },
  { id: 't-1003', roomId: 'r-203', type: 'checkout', priority: 'normal', status: 'assigned', assigneeId: 's-arun', createdAt: hoursAgo(3), assignedAt: hoursAgo(2.8) },
  { id: 't-1004', roomId: 'r-304', type: 'checkout', priority: 'low', status: 'assigned', assigneeId: 's-bala', createdAt: hoursAgo(2.5), assignedAt: hoursAgo(2.2) },
  { id: 't-1005', roomId: 'r-105', type: 'checkout', priority: 'high', status: 'in_progress', assigneeId: 's-ashok', createdAt: hoursAgo(2), assignedAt: hoursAgo(1.9), startedAt: hoursAgo(0.4), checklist: CHECKLIST_ITEMS.slice(0, 7) },
  { id: 't-1006', roomId: 'r-208', type: 'checkout', priority: 'normal', status: 'inspection', assigneeId: 's-ashok', createdAt: hoursAgo(4), assignedAt: hoursAgo(3.8), startedAt: hoursAgo(3), submittedAt: hoursAgo(2.4), checklist: CHECKLIST_ITEMS },
  { id: 't-1007', roomId: 'r-305', type: 'checkout', priority: 'normal', status: 'inspection', assigneeId: 's-arun', createdAt: hoursAgo(5), assignedAt: hoursAgo(4.8), startedAt: hoursAgo(4), submittedAt: hoursAgo(3.4), checklist: CHECKLIST_ITEMS },
  { id: 't-1008', roomId: 'r-110', type: 'checkout', priority: 'high', status: 'assigned', assigneeId: 's-bala', createdAt: hoursAgo(6), assignedAt: hoursAgo(5.8), startedAt: null, attempts: 2, notes: 'Re-clean after failed inspection: bathroom floor and mirror.' },
  { id: 't-1009', roomId: null, location: 'Reception Area', type: 'common', priority: 'normal', status: 'completed', assigneeId: 's-arun', createdAt: daysAgo(0, 7, 0), assignedAt: daysAgo(0, 7, 5), startedAt: daysAgo(0, 7, 15), submittedAt: daysAgo(0, 7, 40), completedAt: daysAgo(0, 7, 45), checklist: [] },
  { id: 't-1010', roomId: null, location: 'Staff Bathroom', type: 'common', priority: 'low', status: 'assigned', assigneeId: 's-arun', createdAt: hoursAgo(1), assignedAt: hoursAgo(1) },
  { id: 't-1011', roomId: 'r-101', type: 'daily', priority: 'normal', status: 'completed', assigneeId: 's-ashok', requestedBy: 'u-priya', notes: 'Guest asked for fresh towels and room tidy.', createdAt: daysAgo(1, 9, 30), assignedAt: daysAgo(1, 9, 40), startedAt: daysAgo(1, 10, 0), submittedAt: daysAgo(1, 10, 25), completedAt: daysAgo(1, 10, 40), checklist: CHECKLIST_ITEMS },
  { id: 't-1012', roomId: 'r-204', type: 'complaint', priority: 'high', status: 'cancelled', assigneeId: null, requestedBy: 'u-kavya', notes: 'Guest reported a smell in the bathroom. Resolved by guest relations, request withdrawn.', createdAt: daysAgo(2, 18, 0) },
]

// Deterministic history for reports: 13 past days × 3 completed cleanings.
const historyRooms = ['r-103', 'r-106', 'r-202', 'r-206', 'r-302', 'r-308', 'r-107', 'r-201', 'r-303', 'r-306', 'r-104', 'r-210']
const housekeepers = ['s-arun', 's-ashok', 's-bala', 's-kumar']

const historyTasks = []
for (let day = 1; day <= 13; day += 1) {
  for (let slot = 0; slot < 3; slot += 1) {
    const n = day * 3 + slot
    const startHour = 9 + slot * 2
    const minutes = 25 + ((n * 7) % 21)
    const start = daysAgo(day, startHour, 10)
    const submit = new Date(new Date(start).getTime() + minutes * 60000).toISOString()
    const done = new Date(new Date(submit).getTime() + 15 * 60000).toISOString()
    historyTasks.push({
      ...base,
      id: `t-h${String(n).padStart(3, '0')}`,
      roomId: historyRooms[n % historyRooms.length],
      type: 'checkout',
      priority: n % 5 === 0 ? 'high' : 'normal',
      status: 'completed',
      assigneeId: housekeepers[n % (day > 6 ? 4 : 3)],
      createdAt: daysAgo(day, startHour - 1, 30),
      assignedAt: daysAgo(day, startHour - 1, 40),
      startedAt: start,
      submittedAt: submit,
      completedAt: done,
      attempts: n % 8 === 0 ? 2 : 1,
      checklist: CHECKLIST_ITEMS,
    })
  }
}

export const tasksSeed = [...activeTasks.map((t) => ({ ...base, ...t })), ...historyTasks]
