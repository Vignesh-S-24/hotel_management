export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`scrollbar-thin flex gap-1 overflow-x-auto border-b border-border ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            value === t.value ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`rounded-full px-1.5 text-xs tabular-nums ${value === t.value ? 'bg-primary-soft text-primary' : 'bg-surface-muted text-text-secondary'}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
