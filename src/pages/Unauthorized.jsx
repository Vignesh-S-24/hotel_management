import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import CommonButton from '../components/common/CommonButton'
import CommonEmptyState from '../components/common/CommonEmptyState'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME, ROLE_LABELS } from '../utils/constants'

export default function Unauthorized() {
  const { user, logout } = useAuth()
  const { state } = useLocation()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="card w-full max-w-lg">
        <CommonEmptyState
          variant="error"
          icon={ShieldAlert}
          title="You don't have access to this page"
          description={`${state?.from ? `${state.from} is not available` : 'This area is not available'} for the ${ROLE_LABELS[user?.role] ?? 'current'} role. Front-end route checks are for demonstration only.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <CommonButton to={user ? ROLE_HOME[user.role] : '/login'}>Back to my dashboard</CommonButton>
              <CommonButton
                variant="secondary"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                Sign in as another user
              </CommonButton>
            </div>
          }
        />
      </div>
    </div>
  )
}
