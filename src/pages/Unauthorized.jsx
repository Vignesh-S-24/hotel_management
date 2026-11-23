import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../utils/constants'

export default function Unauthorized() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-surface p-8 rounded-2xl border border-border shadow-xl">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-text mb-2">Access Restricted</h1>
        <p className="text-xs text-text-muted mb-6">
          Your current role (<strong className="text-text">{ROLE_LABELS[user?.role] || user?.role}</strong>) does not have authorization to view this section.
        </p>

        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
