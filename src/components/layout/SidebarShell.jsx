import { NavLink } from 'react-router-dom'
import { Building2, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { APP_NAME } from '../../utils/constants'

// Shared sidebar chrome. Each panel passes its own nav config and accent label,
// so the two panels stay independent while sharing the design system.
export default function SidebarShell({ items, panelLabel, open, onClose, footer }) {
  const { settings } = useData()

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-text-primary">{APP_NAME}</p>
            <p className="truncate text-xs text-text-secondary">
              {settings.hotelName} · {panelLabel}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-muted lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3" aria-label={`${panelLabel} navigation`}>
        <ul className="space-y-0.5">
          {items.map(({ label, to, icon: Icon, section }, i) => (
            <li key={to}>
              {section && section !== items[i - 1]?.section && (
                <p className={`${i > 0 ? 'mt-4' : ''} px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/70`}>{section}</p>
              )}
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-soft text-primary' : 'text-text-primary/80 hover:bg-surface-muted hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary'}`} aria-hidden />
                    <span className="flex-1 truncate" title={label}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {footer && <div className="border-t border-border p-3">{footer}</div>}
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
