import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonEmptyState from '../../../components/common/CommonEmptyState'
import CommonInput from '../../../components/common/CommonInput'
import CommonSelect from '../../../components/common/CommonSelect'
import { useToast } from '../../../components/common/CommonToast'
import PageHeader from '../../../components/shared/PageHeader'
import { useData } from '../../../context/DataContext'
import { FLOORS, ROOM_STATUS_OPTIONS, ROOM_TYPES } from '../../../utils/constants'
import { numberField } from '../../../utils/validation'

const schema = yup.object({
  number: yup.string().trim().required('Room number required').matches(/^\d{3,4}$/, 'Use a 3–4 digit room number'),
  floor: numberField('Floor').required('Floor required').oneOf(FLOORS, 'Choose a valid floor'),
  type: yup.string().required('Room type required').oneOf(ROOM_TYPES),
  status: yup.string().required('Status required'),
  beds: yup.string().trim().required('Bed configuration required').max(40),
  maxOccupancy: numberField('Max occupancy').required('Max occupancy required').integer().min(1, 'At least 1').max(8, 'At most 8'),
  notes: yup.string().max(300, 'Keep notes under 300 characters'),
})

export default function RoomForm() {
  const { roomId } = useParams()
  const { roomById, saveRoom } = useData()
  const navigate = useNavigate()
  const toast = useToast()
  const room = roomId ? roomById[roomId] : null
  const editing = Boolean(roomId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { number: '', floor: 1, type: 'Standard', status: 'vacant', beds: 'Queen', maxOccupancy: 2, notes: '' },
  })

  useEffect(() => {
    if (room) reset({ number: room.number, floor: room.floor, type: room.type, status: room.status, beds: room.beds, maxOccupancy: room.maxOccupancy, notes: room.notes ?? '' })
  }, [room, reset])

  // Suggest floor from the first digit of a new room number.
  const number = watch('number')
  useEffect(() => {
    if (!editing && /^\d{3}$/.test(number) && FLOORS.includes(Number(number[0]))) setValue('floor', Number(number[0]))
  }, [number, editing, setValue])

  if (editing && !room) {
    return (
      <div className="card">
        <CommonEmptyState variant="error" title="Room not found" description="It may have been removed from the demo data." action={<CommonButton to="/admin/rooms">Back to rooms</CommonButton>} />
      </div>
    )
  }

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 300))
    const res = saveRoom(values, roomId)
    if (!res.ok) {
      setError('number', { message: res.error })
      return
    }
    toast.success(editing ? 'Room edited' : 'Room created', `Room ${values.number} saved.`)
    navigate(`/admin/rooms/${res.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editing ? `Edit Room ${room.number}` : 'Add Room'}
        description={editing ? 'Update room configuration.' : 'Create a new room record (mock data).'}
        actions={
          <CommonButton variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </CommonButton>
        }
      />
      <CommonCard title="Room Configuration">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CommonInput label="Room number" required inputMode="numeric" placeholder="e.g. 311" error={errors.number?.message} {...register('number')} />
            <CommonSelect label="Floor" required options={FLOORS.map((f) => ({ value: f, label: `Floor ${f}` }))} error={errors.floor?.message} {...register('floor')} />
            <CommonSelect label="Room type" required options={ROOM_TYPES.map((t) => ({ value: t, label: t }))} error={errors.type?.message} {...register('type')} />
            <CommonSelect label="Status" required options={ROOM_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
            <CommonInput label="Beds" required placeholder="e.g. King" error={errors.beds?.message} {...register('beds')} />
            <CommonInput label="Max occupancy" required type="number" min={1} max={8} error={errors.maxOccupancy?.message} {...register('maxOccupancy')} />
          </div>
          <CommonInput label="Notes" multiline rows={3} placeholder="Optional" error={errors.notes?.message} {...register('notes')} />
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <CommonButton variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </CommonButton>
            <CommonButton type="submit" loading={isSubmitting} disabled={editing && !isDirty}>
              {editing ? 'Save changes' : 'Create room'}
            </CommonButton>
          </div>
        </form>
      </CommonCard>
    </div>
  )
}
