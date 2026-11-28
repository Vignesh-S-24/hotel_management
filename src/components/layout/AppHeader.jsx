import { useEffect, useRef, useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, UserCheck, User } from 'lucide-react'
import { BellIcon, MoonIcon, SunIcon } from '../icons/NavIcons'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import { ROLES, ROLE_LABELS } from '../../utils/constants'
import { useToast } from '../common/CommonToast'
import NotificationDrawer from '../shared/NotificationDrawer'
import AppHeaderSearch from './AppHeaderSearch'

export default function AppHeader({ onMenu }) {
  const { user, logout, switchRole } = useAuth()
  const { notifications } = useData()
  const { mode, toggle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const menuRef = useRef(null)

  // Unread count for current user
  const userNotifications = (notifications || []).filter((n) => {
    if (!n.audience || n.audience === 'all') return true
    if (Array.isArray(n.audience)) {
      return n.audience.includes(user?.role) || n.audience.includes(user?.staffId)
    }
    return n.audience === user?.role || n.audience === user?.staffId
  })
  const unreadCount = userNotifications.filter((n) => !n.readBy?.includes(user?.staffId)).length

  useEffect(() => {
    if (!menuOpen) return undefined
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [menuOpen])

  const handleSwitch = (targetRole) => {
    setMenuOpen(false)
    startTransition(() => {
      const next = switchRole(targetRole)
      if (!next) return
      toast.info(`Switched Role: ${ROLE_LABELS[next.role]}`, `Signed in as ${next.name}`)
      navigate('/app/dashboard')
    })
  }

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-6 shadow-sm gap-4 border-t-2 border-t-gold">
        {/* Left Side: Mobile Menu + Common Search Bar */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-muted hover:text-text-primary lg:hidden shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Common Global Search Bar (with shortcut ⌘K / Ctrl+K) */}
          <AppHeaderSearch className="w-full max-w-sm" />
        </div>

        {/* Right Side: Quick Role Switcher, Notifications, Dark/Light, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Role Switcher Pills */}
          <div className="hidden xl:flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border mr-1">
            {Object.entries(ROLES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSwitch(val)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  user?.role === val
                    ? 'bg-primary text-white shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Notifications Button with Live Badge */}
          <button
            type="button"
            onClick={() => setNotificationOpen(true)}
            className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
            title="View Notifications"
          >
            <BellIcon className="h-5 w-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white ring-1 ring-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dark/Light toggle */}
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? <SunIcon className="h-5 w-5 text-text-secondary" /> : <MoonIcon className="h-5 w-5 text-text-secondary" />}
          </button>

          {/* User profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-muted transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                {user?.name?.slice(0, 2).toUpperCase() || 'TR'}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold text-text-primary">{user?.name}</div>
                <div className="text-[10px] text-text-secondary capitalize">{ROLE_LABELS[user?.role] || user?.role}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl ring-1 ring-black/5 z-50">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-xs font-bold text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="rounded bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
                      {ROLE_LABELS[user?.role]}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        navigate('/app/profile')
                      }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <User className="h-3 w-3" />
                      View Profile
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Switch Active Role (Demo)
                  </p>
                  {Object.entries(ROLES).map(([roleKey, roleVal]) => (
                    <button
                      key={roleKey}
                      onClick={() => handleSwitch(roleVal)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium text-left ${
                        user?.role === roleVal
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                      }`}
                    >
                      <span>{ROLE_LABELS[roleVal]}</span>
                      {user?.role === roleVal && <UserCheck className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer open={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </>
  )
}
