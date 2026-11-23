import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { ArrowLeft, IdCard, MailCheck } from 'lucide-react'
import CommonButton from '../../components/common/CommonButton'
import CommonInput from '../../components/common/CommonInput'
import { useAuth } from '../../context/AuthContext'

const schema = yup.object({ identifier: yup.string().trim().required('Employee ID or email required') })

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [result, setResult] = useState(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async ({ identifier }) => {
    const res = await requestPasswordReset(identifier)
    if (!res.ok) setError('identifier', { message: res.error })
    else setResult(res)
  }

  if (result) {
    return (
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
          <MailCheck className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">Reset request sent</h1>
        <p className="mt-2 text-sm text-text-secondary">
          In the APK, the request goes to the Super Admin, who issues a temporary password. In this demo no message is sent — use the link below to
          set a new password for <strong className="text-text-primary">{result.email}</strong>.
        </p>
        <div className="mt-6 space-y-3">
          <CommonButton to={`/reset-password?token=${result.token}`} fullWidth>
            Open demo reset link
          </CommonButton>
          <CommonButton to="/login" variant="secondary" fullWidth icon={ArrowLeft}>
            Back to Sign In
          </CommonButton>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Forgot password?</h1>
      <p className="mt-1 text-sm text-text-secondary">Enter your Employee ID or email and we&apos;ll prepare a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <CommonInput label="Employee ID / Email" icon={IdCard} placeholder="TR-101 or priya@thairesidency.com" error={errors.identifier?.message} {...register('identifier')} />
        <CommonButton type="submit" fullWidth size="lg" loading={isSubmitting}>
          Send reset request
        </CommonButton>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
    </div>
  )
}
