import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CommonButton from '../../../components/common/CommonButton'
import CommonInput from '../../../components/common/CommonInput'
import CommonModal from '../../../components/common/CommonModal'
import CommonSelect from '../../../components/common/CommonSelect'
import { useToast } from '../../../components/common/CommonToast'
import { useData } from '../../../context/DataContext'
import { useStaffOptions } from '../../../hooks/useStaffOptions'
import { COMMON_AREAS, PRIORITY_OPTIONS, REQUEST_TYPES, ROOM_STATUS } from '../../../utils/constants'

const schema = yup.object({
  target: yup.string().oneOf(['room', 'area']),
  roomId: yup.string().when('target', { is: 'room', then: (s) => s.required('Choose a room') }),
  location: yup.string().when('target', { is: 'area', then: (s) => s.required('Choose an area') }),
  type: yup.string().required(),
  priority: yup.string().required(),
  assigneeId: yup.string(),
  notes: yup.string().max(300, 'Keep notes under 300 characters'),
})

// APK: "Assign Cleaning Task" / "Create a cleaning task" (rooms and common areas).
export default function TaskForm({ open, onClose, initialRoomId = '' }) {
  const { rooms, tasks, createTask } = useData()
  const { housekeepers } = useStaffOptions()
  const toast = useToast()
  const busy = new Set(tasks.filter((t) => ['pending', 'assigned', 'in_progress', 'inspection'].includes(t.status)).map((t) => t.roomId))

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { target: 'room', roomId: '', location: '', type: 'checkout', priority: 'normal', assigneeId: '', notes: '' },
  })

  useEffect(() => {
    if (open) reset({ target: 'room', roomId: initialRoomId, location: '', type: 'checkout', priority: 'normal', assigneeId: '', notes: '' })
  }, [open, initialRoomId, reset])

  const target = watch('target')

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 250))
    createTask({ ...v, type: v.target === 'area' ? 'common' : v.type, roomId: v.target === 'room' ? v.roomId : null })
    toast.success('Cleaning task created', v.assigneeId ? 'The housekeeper has been assigned.' : 'Task is waiting for assignment.')
    onClose()
  }

  const roomOptions = rooms
    .filter((r) => r.active)
    .sort((a, b) => a.number.localeCompare(b.number))
    .map((r) => ({ value: r.id, label: `Room ${r.number} · ${ROOM_STATUS[r.status].label}`, disabled: busy.has(r.id) }))

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title="New Cleaning Task"
      description="Rooms with an open task are disabled."
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="task-form" loading={isSubmitting}>
            Create task
          </CommonButton>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <fieldset className="flex gap-4 text-sm">
          <legend className="mb-1.5 text-sm font-medium text-text-primary">Clean a</legend>
          <label className="flex items-center gap-2">
            <input type="radio" value="room" className="text-primary focus:ring-primary" {...register('target')} /> Room
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="area" className="text-primary focus:ring-primary" {...register('target')} /> Common area
          </label>
        </fieldset>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {target === 'room' ? (
            <>
              <CommonSelect label="Room" required placeholder="Select room" options={roomOptions} error={errors.roomId?.message} {...register('roomId')} />
              <CommonSelect label="Cleaning type" options={REQUEST_TYPES} {...register('type')} />
            </>
          ) : (
            <CommonSelect label="Area" required placeholder="Select area" className="sm:col-span-2" options={COMMON_AREAS.map((a) => ({ value: a, label: a }))} error={errors.location?.message} {...register('location')} />
          )}
          <CommonSelect label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          <CommonSelect label="Assign housekeeper" placeholder="Assign later" options={housekeepers} {...register('assigneeId')} />
        </div>
        <CommonInput label="Instructions" multiline rows={3} placeholder="Optional" error={errors.notes?.message} {...register('notes')} />
      </form>
    </CommonModal>
  )
}
