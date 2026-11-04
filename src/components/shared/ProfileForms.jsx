import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { passwordRules, phoneRules } from '../../utils/validation'
import CommonButton from '../common/CommonButton'
import CommonInput from '../common/CommonInput'
import { useToast } from '../common/CommonToast'

const profileSchema = yup.object({
  name: yup.string().trim().required('Name required').max(60),
  email: yup.string().trim().required('Email required').email('Enter a valid email'),
  phone: phoneRules,
})

export function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const { updateStaffContact } = useData()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: yupResolver(profileSchema), defaultValues: { name: user.name, email: user.email, phone: user.phone } })

  useEffect(() => reset({ name: user.name, email: user.email, phone: user.phone }), [user, reset])

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 300))
    updateProfile(v)
    updateStaffContact(user.staffId, v)
    toast.success('Profile updated')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CommonInput label="Full name" required error={errors.name?.message} {...register('name')} />
        <CommonInput label="Employee ID" value={user.employeeId} disabled readOnly hint="Assigned by the Super Admin" />
        <CommonInput label="Email" type="email" required error={errors.email?.message} {...register('email')} />
        <CommonInput label="Phone" type="tel" required error={errors.phone?.message} {...register('phone')} />
      </div>
      <div className="flex justify-end">
        <CommonButton type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save changes
        </CommonButton>
      </div>
    </form>
  )
}

const passwordSchema = yup.object({
  current: yup.string().required('Enter your current password'),
  password: passwordRules.notOneOf([yup.ref('current')], 'New password must be different'),
  confirm: yup
    .string()
    .required('Confirm new password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
})

export function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(passwordSchema) })

  const onSubmit = async ({ current, password }) => {
    const res = await changePassword(current, password)
    if (!res.ok) return setError('current', { message: res.error })
    reset({ current: '', password: '', confirm: '' })
    toast.success('Password updated', 'Use the new password next time you sign in.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CommonInput label="Current password" type="password" autoComplete="current-password" error={errors.current?.message} {...register('current')} />
        <CommonInput label="New password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <CommonInput label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
      </div>
      <div className="flex justify-end">
        <CommonButton type="submit" variant="secondary" loading={isSubmitting}>
          Update password
        </CommonButton>
      </div>
    </form>
  )
}

// Accessible on/off switch row used by settings and preferences.
export function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        {description && <span className="block text-xs text-text-secondary">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}
