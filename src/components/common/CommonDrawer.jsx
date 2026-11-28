import { useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useDialogBehavior } from '../../hooks/useDialogBehavior'

export default function CommonDrawer({ open, onClose, title, description, children, footer, side = 'right', width = 'sm:max-w-md' }) {
  const panelRef = useDialogBehavior(open, onClose)
  const titleId = useId()
  if (!open) return null
  const left = side === 'left'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute inset-y-0 flex w-full flex-col bg-surface shadow-overlay ${width} ${left ? 'animate-slide-in-left left-0' : 'animate-slide-in right-0'}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-text-primary">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="-mr-1 rounded-lg p-1.5 text-text-secondary hover:bg-surface-muted hover:text-text-primary" aria-label="Close panel">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  )
}
