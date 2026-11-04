import CommonDrawer from '../../../components/common/CommonDrawer'
import DetailList from '../../../components/shared/DetailList'
import { InspectionBadge, PriorityBadge, TaskStatusBadge } from '../../../components/shared/StatusBadge'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { REQUEST_TYPES } from '../../../utils/constants'
import { formatDateTime, minutesBetween } from '../../../utils/formatDate'

const typeLabel = (t) => (t === 'common' ? 'Common area cleaning' : REQUEST_TYPES.find((r) => r.value === t)?.label ?? t)

// Read-only task detail with a progress timeline; shared by both panels.
export default function TaskDetailsDrawer({ task, onClose, footer }) {
  const { roomLabel, staffName, inspections } = useData()
  const { users } = useAuth()
  if (!task) return null
  const taskInspections = inspections.filter((i) => i.taskId === task.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const requester = task.requestedBy ? users.find((u) => u.id === task.requestedBy)?.name : null

  const steps = [
    ['Requested', task.createdAt],
    ['Housekeeper assigned', task.assignedAt],
    ['Cleaning started', task.startedAt],
    ['Submitted for inspection', task.submittedAt],
    ['Completed', task.completedAt],
  ]

  return (
    <CommonDrawer open onClose={onClose} title={roomLabel(task.roomId, task.location)} description={typeLabel(task.type)} footer={footer}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <TaskStatusBadge value={task.status} />
          <PriorityBadge value={task.priority} />
        </div>
        <DetailList
          items={[
            ['Assigned housekeeper', staffName(task.assigneeId)],
            ['Requested by', requester ?? 'Super Admin'],
            ['Attempt', task.attempts],
            ['Cleaning time', minutesBetween(task.startedAt, task.submittedAt) != null ? `${minutesBetween(task.startedAt, task.submittedAt)} min` : '—'],
            task.notes && ['Notes', task.notes],
          ]}
        />
        <section>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Timeline</h3>
          <ol className="relative space-y-4 border-l border-border pl-5">
            {steps.map(([label, at]) => (
              <li key={label} className="relative">
                <span className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${at ? 'bg-primary' : 'bg-border'}`} />
                <p className={`text-sm ${at ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</p>
                <p className="text-xs text-text-secondary">{at ? formatDateTime(at) : task.status === 'cancelled' ? 'Cancelled' : 'Not done yet'}</p>
              </li>
            ))}
          </ol>
        </section>
        {taskInspections.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Inspections</h3>
            <ul className="space-y-2">
              {taskInspections.map((i) => (
                <li key={i.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary">{staffName(i.inspectorId)}</span>
                    <InspectionBadge value={i.status} />
                  </div>
                  {i.remarks && <p className="mt-1 text-xs text-text-secondary">{i.remarks}</p>}
                  {i.defects.length > 0 && <p className="mt-1 text-xs text-error">Flagged: {i.defects.join(', ')}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </CommonDrawer>
  )
}
