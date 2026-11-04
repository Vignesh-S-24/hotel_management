import HeaderShell from './HeaderShell'

export default function AdminHeader({ onMenu, onNotifications }) {
  return <HeaderShell onMenu={onMenu} onNotifications={onNotifications} profilePath="/admin/settings" profileLabel="Profile & settings" />
}
