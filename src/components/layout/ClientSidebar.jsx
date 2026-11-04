import { ConciergeBell } from 'lucide-react'
import { clientNav } from '../../routes/navigation'
import SidebarShell from './SidebarShell'

export default function ClientSidebar({ open, onClose }) {
  return (
    <SidebarShell
      items={clientNav}
      panelLabel="Reception"
      open={open}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-secondary">
          <ConciergeBell className="h-4 w-4 text-primary" aria-hidden />
          Front desk workspace
        </div>
      }
    />
  )
}
