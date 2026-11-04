import { daysAgo, hoursAgo } from '../utils/formatDate'
import { tasksSeed } from './housekeeping'

const inspectors = ['s-priya', 's-kavya', 's-admin']

const base = { remarks: '', defects: [], correctiveAction: '', correctiveStatus: null, inspectedAt: null }

const current = [
  { id: 'i-2001', taskId: 't-1006', roomId: 'r-208', inspectorId: 's-priya', status: 'pending', createdAt: hoursAgo(2.4) },
  { id: 'i-2002', taskId: 't-1007', roomId: 'r-305', inspectorId: 's-kavya', status: 'pending', createdAt: hoursAgo(3.4) },
  {
    id: 'i-2003',
    taskId: 't-1008',
    roomId: 'r-110',
    inspectorId: 's-priya',
    status: 'failed',
    createdAt: hoursAgo(6.5),
    inspectedAt: hoursAgo(6),
    defects: ['Bathroom not clean'],
    remarks: 'Bathroom mirror and floor need additional cleaning.',
    correctiveAction: 'Re-clean bathroom floor and mirror, then resubmit.',
    correctiveStatus: 'open',
  },
  { id: 'i-2004', taskId: 't-1011', roomId: 'r-101', inspectorId: 's-priya', status: 'passed', createdAt: daysAgo(1, 10, 25), inspectedAt: daysAgo(1, 10, 40), remarks: 'Room tidy, towels replaced.' },
]

// History: every generated completed task has a passing inspection. Tasks
// with two attempts also get an earlier failed one.
const history = tasksSeed
  .filter((t) => t.id.startsWith('t-h'))
  .flatMap((t, i) => {
    const records = []
    if (t.attempts > 1) {
      records.push({
        ...base,
        id: `i-f${t.id.slice(3)}`,
        taskId: t.id,
        roomId: t.roomId,
        inspectorId: inspectors[(i + 1) % 3],
        status: 'failed',
        createdAt: t.startedAt,
        inspectedAt: t.startedAt,
        defects: [i % 2 ? 'Dust remaining' : 'Amenities missing'],
        remarks: i % 2 ? 'Dust on the side table and TV unit.' : 'Water bottles and soap not placed.',
        correctiveAction: 'Fix flagged items and resubmit.',
        correctiveStatus: 'done',
      })
    }
    records.push({
      ...base,
      id: `i-p${t.id.slice(3)}`,
      taskId: t.id,
      roomId: t.roomId,
      inspectorId: inspectors[i % 3],
      status: 'passed',
      createdAt: t.submittedAt,
      inspectedAt: t.completedAt,
      remarks: 'All required checklist items verified.',
    })
    return records
  })

export const inspectionsSeed = [...current.map((x) => ({ ...base, ...x })), ...history]
