import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DEMO_PASSWORD } from '../../data/users'
import { ROLE_LABELS } from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import thaiLogo from '../../assets/logo/ThaiLogo.svg'

export default function Login() {
  const { login, users } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(identifier, password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
    } else {
      toast.success('Signed in successfully', `Welcome back, ${res.user.name}`)
      navigate('/app/dashboard')
    }
  }

  const selectDemoAccount = (user) => {
    setIdentifier(user.email)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center mb-4">
          <div className="bg-white rounded-xl px-6 py-3.5 shadow-md border border-white/20 inline-flex items-center justify-center">
            <img
              src={thaiLogo}
              alt="Thai Residency Logo"
              className="h-14 w-32 object-contain"
            />
          </div>
        </div>
        <h1 className="text-2xl font-black text-text tracking-tight">
          THAI RESIDENCY
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Central Task Management & Hotel Operations
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xl mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Email or Employee ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. owner@thairesidency.com or TR-001"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-semibold text-sm shadow-md hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Operations'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Demo Accounts Panel */}
      <div className="bg-surface-subtle border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text">
            Quick Demo Login (Select Role)
          </h2>
        </div>
        <p className="text-xs text-text-muted mb-3">
          Tap any of the 4 operational roles below to auto-fill credentials:
        </p>

        <div className="grid grid-cols-1 gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => selectDemoAccount(u)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
            >
              <div>
                <div className="text-xs font-bold text-text">{u.name}</div>
                <div className="text-[11px] text-text-muted">{u.email} • ID: {u.employeeId}</div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {ROLE_LABELS[u.role] || u.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
