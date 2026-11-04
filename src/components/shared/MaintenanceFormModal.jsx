import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useData } from '../../context/DataContext'
import { useStaffOptions } from '../../hooks/useStaffOptions'
import { COMMON_AREAS, MAINTENANCE_CATEGORIES, PRIORITY_OPTIONS } from '../../utils/constants'
import CommonButton from '../common/CommonButton'
import CommonInput from '../common/CommonInput'
import CommonModal from '../common/CommonModal'
import CommonSelect from '../common/CommonSelect'
import { useToast } from '../common/CommonToast'

const schema = yup.object({
  target: yup.string().oneOf(['room', 'area']),
  roomId: yup.string().when('target', { is: 'room', then: (s) => s.required('Choose a room') }),
  location: yup.string().when('target', { is: 'area', then: (s) => s.required('Choose a location') }),
  title: yup.string().trim().required('Describe the issue briefly').max(80),
  category: yup.string().required(),
  priority: yup.string().required(),
  description: yup.string().trim().required('Add issue details').min(10, 'Add a little more detail (10+ characters)').max(500),
  assigneeId: yup.string(),
})

// Report a repair (APK: "Repair reported"). `allowAssign` is Super Admin only.
export default function MaintenanceFormModal({ open, onClose, initialRoomId = '', allowAssign = false }) {
  const { rooms, createMaintenance } = useData()
  const { technicians } = useStaffOptions()
  const toast = useToast()
  const defaults = { target: 'room', roomId: initialRoomId, location: '', title: '', category: 'Plumbing', priority: 'normal', description: '', assigneeId: '' }
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRoomId])

  const target = watch('target')
  const roomId = watch('roomId')
  const occupied = rooms.find((r) => r.id === roomId)?.status === 'occupied'

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 300))
    createMaintenance({ ...v, roomId: v.target === 'room' ? v.roomId : null, location: v.target === 'area' ? v.location : '' })
    toast.success('Repair reported', allowAssign ? v.title : 'Super Admin has been notified.')
    onClose()
  }

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      size="lg"
      title="Create maintenance request"
      description="Rooms that are not occupied are blocked from allocation until fixed."
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="maintenance-form" loading={isSubmitting}>
            Submit request
          </CommonButton>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <fieldset className="flex gap-4 text-sm">
          <legend className="mb-1.5 text-sm font-medium text-text-primary">Location type</legend>
          <label className="flex items-center gap-2">
            <input type="radio" value="room" className="text-primary focus:ring-primary" {...register('target')} /> Room
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="area" className="text-primary focus:ring-primary" {...register('target')} /> Common area
          </label>
        </fieldset>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {target === 'room' ? (
            <CommonSelect
              label="Room"
              required
              placeholder="Select room"
              options={rooms
                .filter((r) => r.active)
                .sort((a, b) => a.number.localeCompare(b.number))
                .map((r) => ({ value: r.id, label: `Room ${r.number}` }))}
              hint={occupied ? 'Occupied: the room keeps its status (repaired while occupied).' : undefined}
              error={errors.roomId?.message}
              {...register('roomId')}
            />
          ) : (
            <CommonSelect label="Location" required placeholder="Select location" options={COMMON_AREAS.map((a) => ({ value: a, label: a }))} error={errors.location?.message} {...register('location')} />
          )}
          <CommonSelect label="Category" options={MAINTENANCE_CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} />
          <CommonInput label="Issue" required placeholder="e.g. Flush tank leaking" className="sm:col-span-2" error={errors.title?.message} {...register('title')} />
          <CommonSelect label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          {allowAssign && <CommonSelect label="Responsible staff" placeholder="Assign later" options={technicians} {...register('assigneeId')} />}
        </div>
        <CommonInput label="Details" required multiline rows={4} placeholder="What is wrong, where exactly, any guest impact" error={errors.description?.message} {...register('description')} />
      </form>
    </CommonModal>
  )
}
