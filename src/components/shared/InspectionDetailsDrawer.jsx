import { CheckCircle2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatDateTime } from '../../utils/formatDate'
import CommonBadge from '../common/CommonBadge'
import CommonButton from '../common/CommonButton'
import CommonDrawer from '../common/CommonDrawer'
import { useToast } from '../common/CommonToast'
import DetailList from './DetailList'
import { InspectionBadge } from './StatusBadge'

export default function InspectionDetailsDrawer({ inspection, onClose, footer, canResolve = false }) {
  const { roomLabel, staffName, tasks, inspections, resolveCorrectiveAction } = useData()
  const toast = useToast()
  if (!inspection) return null
  const task = tasks.find((t) => t.id === inspection.taskId)
  const earlier = inspections.filter((i) => i.taskId === inspection.taskId && i.id !== inspection.id)

  return (
    <CommonDrawer open onClose={onClose} title={`Inspection · ${roomLabel(inspection.roomId)}`} description={`Record ID ${inspection.id}`} footer={footer}>
      <div className="space-y-6">
        <InspectionBadge value={inspection.status} />
        <DetailList
          items={[
            ['Inspector', staffName(inspection.inspectorId)],
            ['Cleaned by', staffName(task?.assigneeId)],
            ['Submitted at', formatDateTime(inspection.createdAt)],
            ['Inspected at', formatDateTime(inspection.inspectedAt)],
            ['Attempt', task?.attempts ?? 1],
          ]}
        />
        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Remarks</h3>
          <p className="text-sm text-text-secondary">{inspection.remarks || 'No remarks recorded.'}</p>
        </section>
        {inspection.defects.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Defects flagged</h3>
            <div className="flex flex-wrap gap-2">
              {inspection.defects.map((d) => (
                <CommonBadge key={d} tone="error">
                  {d}
                </CommonBadge>
              ))}
            </div>
          </section>
        )}
        {inspection.correctiveAction && (
          <section className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary">Corrective action</h3>
              <CommonBadge tone={inspection.correctiveStatus === 'done' ? 'success' : 'warning'} dot>
                {inspection.correctiveStatus === 'done' ? 'Done' : 'Open'}
              </CommonBadge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{inspection.correctiveAction}</p>
            {canResolve && inspection.correctiveStatus === 'open' && (
              <CommonButton
                size="sm"
                variant="soft"
                icon={CheckCircle2}
                className="mt-3"
                onClick={() => {
                  resolveCorrectiveAction(inspection.id)
                  toast.success('Corrective action marked done')
                }}
              >
                Mark corrective action done
              </CommonButton>
            )}
          </section>
        )}
        {earlier.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Earlier inspections</h3>
            <ul className="space-y-2">
              {earlier.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                  <span className="text-text-secondary">
                    {staffName(i.inspectorId)} · {formatDateTime(i.inspectedAt ?? i.createdAt)}
                  </span>
                  <InspectionBadge value={i.status} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </CommonDrawer>
  )
}
