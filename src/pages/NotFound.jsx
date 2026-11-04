import { Compass } from 'lucide-react'
import CommonButton from '../components/common/CommonButton'
import CommonEmptyState from '../components/common/CommonEmptyState'

export default function NotFound({ embedded = false }) {
  const body = (
    <CommonEmptyState
      icon={Compass}
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      action={<CommonButton to="/">Go to my dashboard</CommonButton>}
    />
  )
  return embedded ? <div className="card">{body}</div> : <div className="flex min-h-screen items-center justify-center bg-background p-4">{body}</div>
}
