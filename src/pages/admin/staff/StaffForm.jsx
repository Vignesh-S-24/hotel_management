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
import { STAFF_AVAILABILITY, STAFF_ROLES } from '../../../utils/constants'
import { phoneRules } from '../../../utils/validation'

const schema = yup.object({
  name: yup.string().trim().required('Name required').max(60),
  employeeId: yup.string().trim().required('Employee ID required').matches(/^SO-\d{3}$/i, 'Format: SO-123'),
  email: yup.string().trim().required('Email required').email('Enter a valid email'),
  phone: phoneRules,
  role: yup.string().required('Role required'),
  shift: yup.string().required(),
  availability: yup.string().required(),
})

const empty = { name: '', employeeId: '', email: '', phone: '', role: 'housekeeper', shift: 'Morning', availability: 'on_duty' }

export default function StaffForm({ open, staff, onClose }) {
  const { saveStaff } = useData()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: empty })

  useEffect(() => {
    if (open) reset(staff ? { ...empty, ...staff } : empty)
  }, [open, staff, reset])

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 250))
    const payload = { ...values, employeeId: values.employeeId.toUpperCase() }
    const res = saveStaff(payload, staff?.id)
    if (!res.ok) return setError('employeeId', { message: res.error })
    toast.success(staff ? 'Staff updated' : 'Staff member added', values.name)
    onClose()
  }

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      size="lg"
      title={staff ? `Edit ${staff.name}` : 'Add staff member'}
      description="Demo record only — no login account is created."
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="staff-form" loading={isSubmitting}>
            {staff ? 'Save changes' : 'Add staff'}
          </CommonButton>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CommonInput label="Full name" required error={errors.name?.message} {...register('name')} />
        <CommonInput label="Employee ID" required placeholder="SO-206" error={errors.employeeId?.message} {...register('employeeId')} />
        <CommonInput label="Email" type="email" required error={errors.email?.message} {...register('email')} />
        <CommonInput label="Phone" type="tel" required placeholder="+91 98400 00000" error={errors.phone?.message} {...register('phone')} />
        <CommonSelect label="Role" required options={STAFF_ROLES} error={errors.role?.message} {...register('role')} />
        <CommonSelect label="Shift" options={['Morning', 'Evening', 'Night'].map((s) => ({ value: s, label: s }))} {...register('shift')} />
        <CommonSelect label="Availability" options={STAFF_AVAILABILITY} {...register('availability')} />
      </form>
    </CommonModal>
  )
}
