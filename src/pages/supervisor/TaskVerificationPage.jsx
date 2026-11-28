import { useState } from 'react'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Plus,
  UserCheck,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonTable from '../../components/common/CommonTable'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import { useToast } from '../../components/common/CommonToast'

export default function TaskVerificationPage() {
  const { user, users } = useAuth()
  const { tasks, createTask, verifyTask, updateTaskStatus } = useData()
  const toast = useToast()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Task creation fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Room Cleaning')
  const [assignedToId, setAssignedToId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueTime, setDueTime] = useState('14:00')
  const [instructions, setInstructions] = useState('')

  // Tasks in VERIFICATION_PENDING (Section 4 & 19: Level 1 Task Verification by Supervisor)
  const pendingTasks = (tasks || []).filter(
    (t) => t.status === TASK_STATUS.VERIFICATION_PENDING
  )

  const otherTasks = (tasks || []).filter(
    (t) => t.status !== TASK_STATUS.VERIFICATION_PENDING
  )

  const handleApprove = (task) => {
    verifyTask(task.id, true, `Approved verified by Supervisor ${user?.name || 'Rajesh'}`)
    toast.success('Task Verified Approved', `Task "${task.title}" has been approved.`)
  }

  const handleOpenReject = (task) => {
    setSelectedTask(task)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = (e) => {
    e.preventDefault()
    if (!selectedTask || !rejectionReason.trim()) {
      toast.error('Rejection Reason Mandatory', 'Please provide clear rework notes for the staff.')
      return
    }

    verifyTask(selectedTask.id, false, rejectionReason)
    toast.warning('Rework Required', `Task "${selectedTask.title}" marked as REWORK_REQUIRED.`)
    setRejectModalOpen(false)
  }

  const handleCreateTask = (e) => {
    e.preventDefault()
    const assignee = (users || []).find((u) => u.staffId === assignedToId || u.id === assignedToId)

    createTask({
      title,
      category,
      assignedToId: assignee?.staffId || assignedToId,
      assignedToName: assignee?.name || 'Assigned Staff',
      assignedRole: assignee?.role || 'hk',
      priority,
      dueTime,
      instructions,
    })

    toast.success('Task Created', `Assigned "${title}" to ${assignee?.name || 'Staff'}.`)
    setCreateModalOpen(false)
    setTitle('')
    setInstructions('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Supervisor Task Assignment & Level-1 Verification
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Create daily hotel tasks, monitor employee progress, and audit completed work proofs.
          </p>
        </div>

        <CommonButton
          onClick={() => setCreateModalOpen(true)}
          icon={Plus}
          size="md"
        >
          Create Daily Task
        </CommonButton>
      </div>

      {/* Level-1 Verification Queue */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Tasks Awaiting Supervisor Verification ({pendingTasks.length})
          </h2>
          <CommonBadge tone={pendingTasks.length > 0 ? 'warning' : 'success'}>
            {pendingTasks.length > 0 ? 'Pending Verification' : 'Queue Clear'}
          </CommonBadge>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="bg-surface rounded-lg border border-dashed border-border p-6 text-center text-xs text-text-secondary">
            No employee tasks currently waiting for supervisor review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTasks.map((t) => (
              <div
                key={t.id}
                className="bg-surface rounded-xl border border-primary/25 shadow-sm p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary">Level 1 Verification</span>
                    <h3 className="text-base font-bold text-text-primary">{t.title}</h3>
                    <p className="text-xs text-text-secondary">
                      Assigned To: <strong className="text-text-primary">{t.assignedToName}</strong> ({t.assignedRole?.toUpperCase()})
                    </p>
                  </div>
                  <CommonBadge tone="violet" dot>Verification Pending</CommonBadge>
                </div>

                {t.completionRemarks && (
                  <p className="text-xs text-text-secondary bg-surface-muted p-2 rounded italic">
                    "{t.completionRemarks}"
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <CommonButton
                    onClick={() => handleApprove(t)}
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    className="flex-1"
                  >
                    Approve Task (VERIFIED)
                  </CommonButton>

                  <CommonButton
                    onClick={() => handleOpenReject(t)}
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    className="flex-1"
                  >
                    Reject (REWORK)
                  </CommonButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Tasks Table with CommonTable */}
      <div className="mt-6">
        <CommonTable
          columns={[
            {
              key: 'title',
              header: 'Task Title',
              primary: true,
              render: (t) => <span className="font-bold text-text-primary">{t.title}</span>,
            },
            { key: 'category', header: 'Category' },
            {
              key: 'assignedToName',
              header: 'Assigned To',
              render: (t) => `${t.assignedToName} (${t.assignedRole?.toUpperCase()})`,
            },
            {
              key: 'priority',
              header: 'Priority',
              render: (t) => (
                <CommonBadge tone={t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'neutral'}>
                  {t.priority}
                </CommonBadge>
              ),
            },
            { key: 'dueTime', header: 'Due Time' },
            {
              key: 'status',
              header: 'Status',
              render: (t) => (
                <CommonBadge
                  tone={
                    t.status === TASK_STATUS.VERIFIED
                      ? 'success'
                      : t.status === TASK_STATUS.REWORK_REQUIRED
                      ? 'error'
                      : t.status === TASK_STATUS.VERIFICATION_PENDING
                      ? 'violet'
                      : 'neutral'
                  }
                >
                  {t.status.toUpperCase()}
                </CommonBadge>
              ),
            },
          ]}
          rows={tasks || []}
        />
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <CommonModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Hotel Operation Task"
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="create-task-form"
                size="md"
              >
                Assign Task
              </CommonButton>
            </>
          }
        >
          <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-4">
            <CommonInput
              label="Task Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Clean 3rd Floor Linen Cupboard"
            />

            <div className="grid grid-cols-2 gap-3">
              <CommonSelect
                label="Category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Room Cleaning', label: 'Room Cleaning' },
                  { value: 'Floor Cleaning', label: 'Floor Cleaning' },
                  { value: 'Bathroom Cleaning', label: 'Bathroom Cleaning' },
                  { value: 'Laundry', label: 'Laundry' },
                  { value: 'Floor Inspection', label: 'Floor Inspection' },
                  { value: 'Daily Supplies', label: 'Daily Supplies' },
                  { value: 'Stock Management', label: 'Stock Management' },
                  { value: 'Maintenance Supplies', label: 'Maintenance Supplies' },
                  { value: 'General Hotel Operations', label: 'General Hotel Operations' },
                ]}
              />

              <CommonSelect
                label="Assign Employee"
                required
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                placeholder="Select Employee..."
                options={(users || [])
                  .filter((u) => u.role === 'hk' || u.role === 'fo')
                  .map((u) => ({
                    value: u.staffId || u.id,
                    label: `${u.name} (${u.role.toUpperCase()} - ${u.employeeId})`,
                  }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CommonSelect
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />

              <CommonInput
                label="Due Time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>

            <CommonInput
              label="Instructions"
              multiline
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specific instructions, chemical dilution, photo requirements..."
            />
          </form>
        </CommonModal>
      )}

      {/* Rework Modal */}
      {rejectModalOpen && selectedTask && (
        <CommonModal
          open={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Task Proof: ${selectedTask.title}`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="reject-task-form"
                variant="danger"
                size="md"
              >
                Confirm Rejection (REWORK_REQUIRED)
              </CommonButton>
            </>
          }
        >
          <form id="reject-task-form" onSubmit={handleConfirmReject} className="space-y-4">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
              <p className="font-bold">Supervisor Rework Policy (Section 4 & 19):</p>
              <p>Rejection reason is mandatory. Task will transition to <strong>REWORK_REQUIRED</strong> and the assignee will be notified immediately.</p>
            </div>

            <CommonInput
              label="Mandatory Rejection / Rework Instructions"
              required
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Corners not dusted properly, floor still damp..."
            />
          </form>
        </CommonModal>
      )}
    </div>
  )
}
