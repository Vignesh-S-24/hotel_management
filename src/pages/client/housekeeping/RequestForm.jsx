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
import { PRIORITY_OPTIONS, REQUEST_TYPES, ROOM_STATUS } from '../../../utils/constants'

const schema = yup.object({
  roomId: yup.string().required('Choose a room'),
  type: yup.string().required('Choose a request type'),
  priority: yup.string().required(),
  notes: yup
    .string()
    .trim()
    .max(300, 'Keep details under 300 characters')
    .when('type', { is: 'complaint', then: (s) => s.required('Describe the complaint') }),
})

// Reception housekeeping request. "Checkout cleaning" mirrors the APK's
// Check Out action (occupied → Cleaning Required, Super Admin notified).
export default function RequestForm({ open, onClose, initialRoomId = '', initialType = '' }) {
  const { rooms, tasks, requestHousekeeping } = useData()
  const toast = useToast()
  const openTaskRooms = new Set(tasks.filter((t) => ['pending', 'assigned', 'in_progress', 'inspection'].includes(t.status)).map((t) => t.roomId))
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { roomId: '', type: 'checkout', priority: 'normal', notes: '' } })

  useEffect(() => {
    if (open) reset({ roomId: initialRoomId, type: initialType || 'checkout', priority: 'normal', notes: '' })
  }, [open, initialRoomId, initialType, reset])

  const roomId = watch('roomId')
  const type = watch('type')
  const room = rooms.find((r) => r.id === roomId)

  // Checkout only applies to occupied rooms; other request types also need an occupied room.
  useEffect(() => {
    if (room && room.status !== 'occupied' && type !== 'checkout') setValue('type', 'checkout')
  }, [room, type, setValue])

  const eligible = rooms
    .filter((r) => r.active && ['occupied', 'vacant'].includes(r.status))
    .sort((a, b) => a.number.localeCompare(b.number))
    .map((r) => ({ value: r.id, label: `Room ${r.number} · ${ROOM_STATUS[r.status].label}${openTaskRooms.has(r.id) ? ' · request open' : ''}`, disabled: openTaskRooms.has(r.id) }))

  const typeOptions = REQUEST_TYPES.map((t) => ({
    ...t,
    disabled: room ? (t.value === 'checkout' ? false : room.status !== 'occupied') : false,
  }))

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 300))
    requestHousekeeping(v)
    toast.success(v.type === 'checkout' ? 'Room checked out' : 'Request submitted', 'Super Admin has been notified to assign a housekeeper.')
    onClose()
  }

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title="Create housekeeping request"
      description="Only occupied or vacant rooms without an open request can be selected."
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="hk-request-form" loading={isSubmitting}>
            Submit request
          </CommonButton>
        </>
      }
    >
      <form id="hk-request-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CommonSelect label="Room" required placeholder="Choose room" options={eligible} error={errors.roomId?.message} {...register('roomId')} />
          <CommonSelect label="Request type" required options={typeOptions} error={errors.type?.message} {...register('type')} />
          <CommonSelect label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
        </div>
        {type === 'checkout' && room?.status === 'occupied' && (
          <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">Room {room.number} will move to Cleaning Required.</p>
        )}
        <CommonInput
          label="Request details"
          required={type === 'complaint'}
          multiline
          rows={3}
          placeholder="e.g. Next arrival at 2 PM, guest needs extra towels"
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </CommonModal>
  )
}
