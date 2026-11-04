import { useEffect, useState } from 'react'
import CommonButton from '../../../components/common/CommonButton'
import CommonInput from '../../../components/common/CommonInput'
import CommonModal from '../../../components/common/CommonModal'
import CommonSelect from '../../../components/common/CommonSelect'
import { useToast } from '../../../components/common/CommonToast'
import { useData } from '../../../context/DataContext'
import { useStaffOptions } from '../../../hooks/useStaffOptions'

// Assign or reassign (APK: "Reassign Task" requires a reason).
export default function AssignTaskModal({ task, onClose }) {
  const { assignTask, roomLabel, staffName } = useData()
  const { housekeepers } = useStaffOptions()
  const toast = useToast()
  const [staffId, setStaffId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setStaffId('')
    setReason('')
    setError('')
  }, [task])

  if (!task) return null
  const reassign = Boolean(task.assigneeId)

  const save = () => {
    if (!staffId) return setError('Select a housekeeper')
    if (reassign && staffId === task.assigneeId) return setError('Choose a different housekeeper')
    if (reassign && !reason.trim()) return setError('Reason required for reassignment')
    assignTask(task.id, staffId, reason.trim())
    toast.success(reassign ? 'Housekeeper reassigned' : 'Housekeeper assigned', `${roomLabel(task.roomId, task.location)} → ${staffName(staffId)}`)
    onClose()
  }

  return (
    <CommonModal
      open
      onClose={onClose}
      size="sm"
      title={`${reassign ? 'Reassign' : 'Assign Housekeeper'} · ${roomLabel(task.roomId, task.location)}`}
      description={reassign ? `Currently assigned to ${staffName(task.assigneeId)}. The previous assignment stays in the room history.` : 'Choose a housekeeper to clean the room.'}
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton onClick={save}>{reassign ? 'Confirm Reassignment' : 'Assign'}</CommonButton>
        </>
      }
    >
      <div className="space-y-4">
        <CommonSelect
          label="Housekeeper"
          placeholder="Select a housekeeper"
          options={housekeepers}
          value={staffId}
          onChange={(e) => {
            setStaffId(e.target.value)
            setError('')
          }}
          error={!reassign ? error : undefined}
          data-autofocus
        />
        {reassign && (
          <CommonInput
            label="Reason for reassignment"
            required
            multiline
            rows={2}
            placeholder="e.g. Housekeeper unavailable"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError('')
            }}
            error={error}
          />
        )}
      </div>
    </CommonModal>
  )
}
