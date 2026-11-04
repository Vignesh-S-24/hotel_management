import { useState } from 'react'
import { ClipboardCheck, Repeat } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import { PageSkeleton } from '../../../components/common/CommonLoader'
import AssignInspectorModal from '../../../components/shared/AssignInspectorModal'
import InspectionDetailsDrawer from '../../../components/shared/InspectionDetailsDrawer'
import InspectionFormModal from '../../../components/shared/InspectionFormModal'
import PageHeader from '../../../components/shared/PageHeader'
import { InspectionBadge } from '../../../components/shared/StatusBadge'
import Tabs from '../../../components/shared/Tabs'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { formatDateTime, timeAgo } from '../../../utils/formatDate'

// In the APK, receptionists act as inspectors ("Inspections approved by
// receptionist"). Only inspections assigned to the logged-in user are shown.
export default function MyInspections() {
  const { user } = useAuth()
  const { inspections, tasks, roomLabel, staffName } = useData()
  const loading = useSimulatedLoading()
  const [tab, setTab] = useState('pending')
  const [inspecting, setInspecting] = useState(null)
  const [handover, setHandover] = useState(null)
  const [detailId, setDetailId] = useState(null)

  const mine = inspections.filter((i) => i.inspectorId === user.staffId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const pending = mine.filter((i) => i.status === 'pending')
  const done = mine.filter((i) => i.status !== 'pending')
  const list = tab === 'pending' ? pending : done
  const detail = mine.find((i) => i.id === detailId)

  if (loading) return <PageSkeleton cards={0} rows={4} />

  return (
    <div className="space-y-6">
      <PageHeader title="Inspections" description="Rooms waiting for your inspection. Approve so reception can allocate, or reject with items to fix." />
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'pending', label: 'Waiting for you', count: pending.length },
            { value: 'done', label: 'Inspected', count: done.length },
          ]}
        />
        {list.length === 0 ? (
          <CommonEmptyState icon={ClipboardCheck} title={tab === 'pending' ? 'No rooms waiting for you' : 'No inspections yet'} description={tab === 'pending' ? 'You will be notified when a room is submitted to you.' : undefined} />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((i) => {
              const task = tasks.find((t) => t.id === i.taskId)
              return (
                <li key={i.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" className="min-w-0 text-left" onClick={() => setDetailId(i.id)}>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{roomLabel(i.roomId)}</p>
                      <InspectionBadge value={i.status} />
                    </div>
                    <p className="text-sm text-text-secondary">
                      Cleaned by {staffName(task?.assigneeId)}
                      {task?.attempts > 1 ? ` · attempt ${task.attempts}` : ''} · {i.status === 'pending' ? `submitted ${timeAgo(i.createdAt)}` : formatDateTime(i.inspectedAt)}
                    </p>
                  </button>
                  {i.status === 'pending' && (
                    <div className="flex gap-2">
                      <CommonButton size="sm" variant="ghost" icon={Repeat} onClick={() => setHandover(i)}>
                        Hand over
                      </CommonButton>
                      <CommonButton size="sm" icon={ClipboardCheck} onClick={() => setInspecting(i)}>
                        Inspect now
                      </CommonButton>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CommonCard>
      {inspecting && <InspectionFormModal inspection={inspecting} onClose={() => setInspecting(null)} />}
      {handover && <AssignInspectorModal inspection={handover} title="Hand over inspection" onClose={() => setHandover(null)} />}
      {detail && <InspectionDetailsDrawer inspection={detail} onClose={() => setDetailId(null)} />}
    </div>
  )
}
