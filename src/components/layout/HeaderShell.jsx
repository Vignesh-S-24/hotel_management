import { startTransition, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Repeat, UserRound } from 'lucide-react'
import { BellIcon, MoonIcon, SunIcon } from '../icons/NavIcons'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants'
import { useToast } from '../common/CommonToast'
import HeaderSearch from './HeaderSearch'

export function Avatar({ name, size = 'h-9 w-9' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary`} aria-hidden>
      {initials}
    </span>
  )
}

// Shared header chrome; each panel supplies its own links.
export default function HeaderShell({ onMenu, onNotifications, profilePath, profileLabel }) {
  const { user, logout, switchRole } = useAuth()
  const { unreadCount } = useData()
  const { mode, toggle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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

  const otherRole = user.role === 'admin' ? 'client' : 'admin'

  const handleSwitch = () => {
    setMenuOpen(false)
    // Same transition as the (transition-wrapped) navigation, so the new role
    // never renders on the old panel's URL and trips the route guard.
    startTransition(() => {
      const next = switchRole(otherRole)
      if (!next) return
      toast.info(`Switched to ${ROLE_LABELS[next.role]}`, `Signed in as ${next.name} (demo).`)
      navigate(ROLE_HOME[next.role])
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    toast.success('Logged out')
  }

  const iconBtn = 'relative rounded-lg p-2 text-text-secondary hover:bg-surface-muted hover:text-text-primary'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-3 backdrop-blur sm:px-4 lg:px-6">
      <button type="button" onClick={onMenu} className={`${iconBtn} -ml-2 lg:hidden`} aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </button>
      <HeaderSearch className="min-w-0 flex-1 sm:max-w-md" />
      <div className="hidden flex-1 sm:block" />
      <div className="flex items-center gap-1">
        <button type="button" onClick={toggle} className={iconBtn} aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
          {mode === 'dark' ? <SunIcon className="h-5 w-5" style={{ color: '#4c526c' }} /> : <MoonIcon className="h-5 w-5" style={{ color: '#4c526c' }} />}
        </button>
        <button type="button" onClick={onNotifications} className={iconBtn} aria-haspopup="dialog" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
          <BellIcon className="h-5 w-5" style={{ color: '#4c526c' }} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="relative ml-1" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-surface-muted"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Account menu for ${user.name}`}
          >
            <Avatar name={user.name} size="h-8 w-8" />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-medium text-text-primary">{user.name}</span>
              <span className="block text-xs text-text-secondary">{ROLE_LABELS[user.role]}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-text-secondary md:block" aria-hidden />
          </button>
          {menuOpen && (
            <div role="menu" className="animate-pop-in absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-overlay">
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
                <p className="truncate text-xs text-text-secondary">
                  {user.email} · {user.employeeId}
                </p>
              </div>
              <Link role="menuitem" to={profilePath} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-muted">
                <UserRound className="h-4 w-4 text-text-secondary" /> {profileLabel}
              </Link>
              <button role="menuitem" type="button" onClick={handleSwitch} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-muted">
                <Repeat className="h-4 w-4 text-text-secondary" /> Switch to {ROLE_LABELS[otherRole]} (demo)
              </button>
              <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-error hover:bg-error-soft">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
