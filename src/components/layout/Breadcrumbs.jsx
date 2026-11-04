import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { crumbLabels } from '../../routes/navigation'

export default function Breadcrumbs({ className = '' }) {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const crumbs = parts.map((part, i) => ({
    label: crumbLabels[part] ?? (/^r-/.test(part) ? `Room ${part.slice(2).split('-')[0]}` : part),
    to: i === 0 ? `/${part}/dashboard` : `/${parts.slice(0, i + 1).join('/')}`,
  }))

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 items-center gap-1 text-sm text-text-secondary">
        {crumbs.map((c, i) => (
          <li key={c.to} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            {i === crumbs.length - 1 ? (
              <span className="truncate font-medium text-text-primary" aria-current="page">
                {c.label}
              </span>
            ) : (
              <Link to={c.to} className="truncate hover:text-text-primary">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
