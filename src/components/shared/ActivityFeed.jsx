import { BedDouble, Boxes, ClipboardCheck, Sparkles, Users, Wrench } from 'lucide-react'
import { timeAgo } from '../../utils/formatDate'
import CommonEmptyState from '../common/CommonEmptyState'

const ICONS = {
  room: [BedDouble, 'bg-primary-soft text-primary'],
  housekeeping: [Sparkles, 'bg-info-soft text-info'],
  inspection: [ClipboardCheck, 'bg-violet-soft text-violet'],
  maintenance: [Wrench, 'bg-warning-soft text-warning'],
  inventory: [Boxes, 'bg-error-soft text-error'],
  staff: [Users, 'bg-success-soft text-success'],
}

export function ActivityIcon({ type }) {
  const [Icon, cls] = ICONS[type] ?? ICONS.room
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  )
}

export default function ActivityFeed({ items, staffName, limit }) {
  const list = [...items].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit ?? items.length)
  if (!list.length) return <CommonEmptyState compact title="No activity yet" description="Updates will appear here as work happens." />
  return (
    <ol className="space-y-4">
      {list.map((a) => {
        return (
          <li key={a.id} className="flex gap-3">
            <ActivityIcon type={a.type} />
            <div className="min-w-0">
              <p className="text-sm text-text-primary">{a.message}</p>
              <p className="text-xs text-text-secondary">
                {a.actorId ? `${staffName(a.actorId)} · ` : ''}
                <time dateTime={a.at}>{timeAgo(a.at)}</time>
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
