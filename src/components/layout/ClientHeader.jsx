import HeaderShell from './HeaderShell'

export default function ClientHeader({ onMenu, onNotifications }) {
  return <HeaderShell onMenu={onMenu} onNotifications={onNotifications} profilePath="/client/profile" profileLabel="My profile" />
}
