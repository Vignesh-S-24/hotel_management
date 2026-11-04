import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import CommonButton from '../../components/common/CommonButton'
import CommonEmptyState from '../../components/common/CommonEmptyState'
import CommonInput from '../../components/common/CommonInput'
import { useToast } from '../../components/common/CommonToast'
import { useAuth } from '../../context/AuthContext'
import { passwordRules } from '../../utils/validation'

const schema = yup.object({
  password: passwordRules,
  confirm: yup
    .string()
    .required('Confirm new password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
})

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { resetPassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) })

  if (!token) {
    return (
      <CommonEmptyState
        variant="error"
        title="Reset link missing"
        description="Open this page from the link generated on the Forgot Password screen."
        action={<CommonButton to="/forgot-password">Request a reset link</CommonButton>}
      />
    )
  }

  const onSubmit = async ({ password }) => {
    const res = await resetPassword(token, password)
    if (!res.ok) {
      setError('root', { message: res.error })
      return
    }
    toast.success('Password updated', 'Sign in with your new password.')
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Set a new password</h1>
      <p className="mt-1 text-sm text-text-secondary">Choose a password with at least 8 characters, including a letter and a number.</p>
      {errors.root && (
        <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error-soft p-3 text-sm text-error">
          {errors.root.message}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <CommonInput label="New password" type="password" icon={Lock} autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <CommonInput label="Confirm new password" type="password" icon={Lock} autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
        <CommonButton type="submit" fullWidth size="lg" loading={isSubmitting}>
          Update password
        </CommonButton>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
    </div>
  )
}
