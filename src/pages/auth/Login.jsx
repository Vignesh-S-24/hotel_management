import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ConciergeBell, IdCard, Lock, ShieldCheck } from 'lucide-react'
import CommonButton from '../../components/common/CommonButton'
import CommonInput from '../../components/common/CommonInput'
import { useToast } from '../../components/common/CommonToast'
import { useAuth } from '../../context/AuthContext'
import { DEMO_PASSWORD } from '../../data/users'
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants'

const schema = yup.object({
  identifier: yup.string().trim().required('Employee ID or email required'),
  password: yup.string().required('Password required'),
  remember: yup.boolean(),
})

export default function Login() {
  const { login, users } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { identifier: '', password: '', remember: true } })

  const onSubmit = async ({ identifier, password, remember }) => {
    setError('')
    const res = await login(identifier, password, remember)
    if (!res.ok) {
      setError(res.error)
      return
    }
    toast.success(`Welcome back, ${res.user.name.split(' ')[0]}`, `Signed in to the ${ROLE_LABELS[res.user.role]} panel.`)
    const from = location.state?.from
    const allowed = from && from.startsWith(`/${res.user.role}`)
    navigate(allowed ? from : ROLE_HOME[res.user.role], { replace: true })
  }

  const fill = (u) => {
    setValue('identifier', u.email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
    setError('')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Sign in</h1>
      <p className="mt-1 text-sm text-text-secondary">Use your Employee ID or email.</p>

      {error && (
        <div role="alert" className="mt-5 flex gap-2 rounded-lg border border-error/30 bg-error-soft p-3 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <CommonInput label="Employee ID / Email" icon={IdCard} placeholder="SO-001 or admin@stayops.in" autoComplete="username" error={errors.identifier?.message} {...register('identifier')} />
        <CommonInput label="Password" type="password" icon={Lock} placeholder="Enter password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" {...register('remember')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
            Forgot Password?
          </Link>
        </div>
        <CommonButton type="submit" fullWidth size="lg" loading={isSubmitting}>
          Sign In
        </CommonButton>
      </form>

      <section className="mt-8" aria-labelledby="demo-accounts">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <h2 id="demo-accounts" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Prototype demo accounts
          </h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <p className="mt-2 text-center text-xs text-text-secondary">
          Tap an account to fill the form, then Sign In. Password: <code className="rounded bg-surface-muted px-1">{DEMO_PASSWORD}</code>
        </p>
        <ul className="mt-3 grid gap-2">
          {users.map((u) => {
            const Icon = u.role === 'admin' ? ShieldCheck : ConciergeBell
            return (
              <li key={u.id}>
                <button type="button" onClick={() => fill(u)} className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-primary-soft/40">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary">{u.name}</span>
                    <span className="block truncate text-xs text-text-secondary">
                      {u.employeeId} · {u.email}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-text-secondary">{u.role === 'admin' ? 'Admin panel' : 'Client panel'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
