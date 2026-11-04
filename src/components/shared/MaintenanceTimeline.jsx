import { formatDateTime } from '../../utils/formatDate'

export default function MaintenanceTimeline({ request, staffName }) {
  const events = [
    { at: request.createdAt, text: `Reported by ${staffName(request.reportedBy)}` },
    request.startedAt && { at: request.startedAt, text: `Repair started${request.assigneeId ? ` · ${staffName(request.assigneeId)}` : ''}` },
    ...request.updates.map((u) => ({ at: u.at, text: u.text })),
    request.resolvedAt && { at: request.resolvedAt, text: 'Repair completed' },
  ]
    .filter(Boolean)
    .sort((a, b) => a.at.localeCompare(b.at))

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={`${e.at}-${i}`} className="relative">
          <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-surface" />
          <p className="text-sm text-text-primary">{e.text}</p>
          <p className="text-xs text-text-secondary">{formatDateTime(e.at)}</p>
        </li>
      ))}
    </ol>
  )
}
