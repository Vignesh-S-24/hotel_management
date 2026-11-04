import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CommonButton from '../../../components/common/CommonButton'
import CommonDrawer from '../../../components/common/CommonDrawer'
import CommonInput from '../../../components/common/CommonInput'
import CommonSelect from '../../../components/common/CommonSelect'
import { useToast } from '../../../components/common/CommonToast'
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

const defaultValues = {
  number: '',
  floor: 1,
  type: 'Standard',
  status: 'vacant',
  beds: 'Queen',
  maxOccupancy: 2,
  notes: '',
}

export default function RoomDrawer({ open, room, onClose, onSaved }) {
  const { saveRoom } = useData()
  const toast = useToast()
  const editing = Boolean(room?.id)

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
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      if (room) {
        reset({
          number: room.number,
          floor: room.floor,
          type: room.type,
          status: room.status,
          beds: room.beds,
          maxOccupancy: room.maxOccupancy,
          notes: room.notes ?? '',
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, room, reset])

  // Suggest floor from the first digit of a new room number
  const number = watch('number')
  useEffect(() => {
    if (!editing && /^\d{3}$/.test(number) && FLOORS.includes(Number(number[0]))) {
      setValue('floor', Number(number[0]))
    }
  }, [number, editing, setValue])

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 250))
    const res = saveRoom(values, room?.id)
    if (!res.ok) {
      setError('number', { message: res.error })
      return
    }
    toast.success(editing ? 'Room updated' : 'Room created', `Room ${values.number} saved.`)
    onSaved?.(res.id)
    onClose()
  }

  return (
    <CommonDrawer
      open={open}
      onClose={onClose}
      title={editing ? `Edit Room ${room.number}` : 'Add New Room'}
      description={editing ? 'Update room configuration.' : 'Create a new room record.'}
      width="sm:max-w-lg"
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="room-drawer-form" loading={isSubmitting} disabled={editing && !isDirty}>
            {editing ? 'Save changes' : 'Create room'}
          </CommonButton>
        </>
      }
    >
      <form id="room-drawer-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CommonInput
            label="Room number"
            required
            inputMode="numeric"
            placeholder="e.g. 311"
            error={errors.number?.message}
            {...register('number')}
          />
          <CommonSelect
            label="Floor"
            required
            options={FLOORS.map((f) => ({ value: f, label: `Floor ${f}` }))}
            error={errors.floor?.message}
            {...register('floor')}
          />
          <CommonSelect
            label="Room type"
            required
            options={ROOM_TYPES.map((t) => ({ value: t, label: t }))}
            error={errors.type?.message}
            {...register('type')}
          />
          <CommonSelect
            label="Status"
            required
            options={ROOM_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />
          <CommonInput
            label="Beds"
            required
            placeholder="e.g. King"
            error={errors.beds?.message}
            {...register('beds')}
          />
          <CommonInput
            label="Max occupancy"
            required
            type="number"
            min={1}
            max={8}
            error={errors.maxOccupancy?.message}
            {...register('maxOccupancy')}
          />
        </div>
        <CommonInput
          label="Notes"
          multiline
          rows={3}
          placeholder="Optional notes or details"
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </CommonDrawer>
  )
}
