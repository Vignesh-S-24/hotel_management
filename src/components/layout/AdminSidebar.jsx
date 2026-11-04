import { ShieldCheck } from 'lucide-react'
import { adminNav } from '../../routes/navigation'
import SidebarShell from './SidebarShell'

export default function AdminSidebar({ open, onClose }) {
  return (
    <SidebarShell
      items={adminNav}
      panelLabel="Admin"
      open={open}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-secondary">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          Super Admin workspace
        </div>
      }
    />
  )
}
