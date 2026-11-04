// Two-column definition list for detail panels.
export default function DetailList({ items, cols = 2 }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-3 text-sm ${cols === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.filter(Boolean).map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-text-secondary">{label}</dt>
          <dd className="mt-0.5 break-words text-text-primary">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
