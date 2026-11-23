import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CommonLoader from '../components/common/CommonLoader'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <CommonLoader fullPage />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

export function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <CommonLoader fullPage />
  if (user) return <Navigate to="/app/dashboard" replace />
  return <Outlet />
}

export function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <CommonLoader fullPage />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to="/app/dashboard" replace />
}
