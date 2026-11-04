import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../utils/constants'

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function GuestRoute() {
  const { user } = useAuth()
  return user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Outlet />
}

export function RoleRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />
}
