import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Mail, MailOpen, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useDialogBehavior } from '../../hooks/useDialogBehavior'
import { NOTIFICATION_TYPES, ROLES } from '../../utils/constants'
import { formatDateTime, timeAgo } from '../../utils/formatDate'
import CommonBadge from '../common/CommonBadge'
import { useToast } from '../common/CommonToast'

const canNotify = typeof window !== 'undefined' && 'Notification' in window

function DesktopAlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <rect x="2.5" y="3.5" width="19" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20.5h8M12 16.5v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 6.2l-3.6 4.2h2.6l-1 3.4 3.8-4.4h-2.6z" fill="currentColor" />
    </svg>
  )
}

// Theme tokens via fill/stroke utilities, so it follows light and dark mode.
function MailboxIllustration() {
  return (
    <svg width="140" height="171" viewBox="0 0 270 330" fill="none" aria-hidden>
      <path d="M118 22c6-4 14-4 18 2-2 8-10 12-18 8-3-3-3-7 0-10z" className="fill-warning" />
      <path d="M124 14c5-3 10-1 12 4-4 1-9 0-12-4z" className="fill-text-primary" />
      <path d="M110 36c-25 8-45 12-44 22 2 10 40 4 50 14" strokeWidth="1.5" strokeLinecap="round" className="stroke-text-primary" />
      <path d="M100 72l18 4M124 76l10 3" strokeWidth="1.5" strokeLinecap="round" className="stroke-text-primary" />
      <path d="M40 152c4-8 14-12 24-14l4 10-24 8z" className="fill-text-primary" />
      <path d="M118 108c-22 0-38 14-38 34v40h76v-74h-38z" className="fill-text-primary" />
      <path d="M118 128c-12 0-22 8-22 20v34h44v-54h-22z" className="fill-text-secondary" />
      <path d="M156 108h72c14 0 24 10 24 24v50h-96v-74z" className="fill-error" />
      <path d="M232 128v52h-24" strokeWidth="1.2" className="stroke-text-primary" />
      <path d="M186 182h44" strokeWidth="1.5" className="stroke-text-primary" />
      <path d="M82 184h72c0 26-16 44-40 44-22 0-36-14-32-44z" className="fill-text-primary" />
      <path d="M82 184h74" strokeWidth="1.5" className="stroke-surface" />
      <path d="M178 182h28l-4 96h-20z" className="fill-text-secondary" />
      <path d="M186 292c0-24 10-36 16-40-2 14 4 24 0 40z" className="fill-success" />
      <path d="M178 292c-2-12 0-22-6-28 10 4 14 16 14 28z" className="fill-text-primary" />
      <path d="M204 292c0-14 4-22 8-28 6 6 6 18 4 28z" className="fill-text-secondary" />
      <path d="M226 292c-2-8 0-14 4-18 2 6 2 12 0 18z" className="fill-success" />
      <path d="M70 296c50-16 130-16 190 6" strokeWidth="1.2" className="stroke-text-primary" />
    </svg>
  )
}


export default function NotificationDrawer({ open, onClose }) {
  const { user } = useAuth()
  const { myNotifications, unreadCount, setNotificationRead, markAllNotificationsRead } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const panelRef = useDialogBehavior(open, onClose)
  const titleId = useId()
  const [tab, setTab] = useState('all')
  const [type, setType] = useState('all')
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)
  const [permission, setPermission] = useState(canNotify ? Notification.permission : 'unsupported')
  const typeMenuRef = useRef(null)
  const seenRef = useRef(null)

  const roleAvailableTypes = useMemo(() => {
    switch (user?.role) {
      case ROLES.HK:
        return ['housekeeping', 'room', 'inventory']
      case ROLES.FO:
        return ['room', 'housekeeping', 'inspection']
      case ROLES.SUPERVISOR:
        return ['room', 'housekeeping', 'inspection', 'maintenance', 'inventory']
      case ROLES.OWNER:
      default:
        return Object.keys(NOTIFICATION_TYPES)
    }
  }, [user?.role])

  const filteredTypeEntries = useMemo(() => {
    return Object.entries(NOTIFICATION_TYPES).filter(([key]) => roleAvailableTypes.includes(key))
  }, [roleAvailableTypes])

  const list = useMemo(
    () =>
      myNotifications.filter((n) => {
        const isRead = n.readBy?.includes(user?.id) || n.readBy?.includes(user?.staffId)
        if (tab === 'unread' && isRead) return false
        return type === 'all' || n.type === type
      }),
    [myNotifications, tab, type, user?.id, user?.staffId],
  )

  // Show a desktop notification for anything new once permission is granted.
  useEffect(() => {
    const ids = new Set(myNotifications.map((n) => n.id))
    if (seenRef.current && permission === 'granted') {
      myNotifications
        .filter((n) => !seenRef.current.has(n.id) && !n.readBy.includes(user?.id))
        .forEach((n) => new Notification(n.title, { body: n.message, tag: n.id }))
    }
    seenRef.current = ids
  }, [myNotifications, permission, user?.id])

  useEffect(() => {
    if (!typeMenuOpen) return undefined
    const close = (e) => {
      if (!typeMenuRef.current?.contains(e.target)) setTypeMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [typeMenuOpen])

  if (!open) return null

  const enableDesktop = async () => {
    if (!canNotify) return toast.error('Not supported', 'This browser does not support desktop notifications.')
    if (permission === 'granted') return toast.info('Desktop notifications are on')
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') toast.success('Desktop notifications enabled')
    else toast.error('Permission blocked', 'Allow notifications for this site in your browser settings.')
  }

  const openItem = (n) => {
    setNotificationRead(n.id, true)
    if (n.link) {
      navigate(n.link)
      onClose()
    }
  }

  const tabClass = (active) =>
    `relative h-8 px-1 text-sm ${active ? 'font-bold text-text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:bg-primary' : 'text-text-secondary hover:text-text-primary'}`

  const desktopLabel = permission === 'granted' ? 'Desktop notifications are on' : 'Enable Desktop Notifications'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-slide-in absolute inset-y-0 right-0 flex w-[400px] max-w-full flex-col bg-surface shadow-overlay"
      >
        <header className="border-b border-border bg-background px-4 pt-3">
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="text-[17px] font-medium text-text-primary">
              Notifications
            </h2>
            <div className="flex items-center">
              <div className="group relative">
                <button
                  type="button"
                  onClick={enableDesktop}
                  className={`rounded-md p-1 hover:bg-surface-muted ${permission === 'granted' ? 'text-primary' : 'text-text-secondary'}`}
                  aria-label={desktopLabel}
                >
                  <DesktopAlertIcon className="h-[18px] w-[18px]" />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity delay-100 group-hover:opacity-100"
                >
                  {desktopLabel}
                  <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
                </span>
              </div>
              <span className="mx-3 h-4 w-px bg-border" aria-hidden />
              <button type="button" onClick={onClose} className="rounded-md p-1 text-error hover:bg-error-soft" aria-label="Close notifications">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="flex items-end gap-4" role="tablist">
              <div className="flex h-8 items-center">
                <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')} className={tabClass(tab === 'all')}>
                  {type === 'all' ? 'All' : NOTIFICATION_TYPES[type].label}
                </button>
                <span className="mx-3 h-3 w-px bg-border" aria-hidden />
                <div className="relative" ref={typeMenuRef}>
                  <button
                    type="button"
                    onClick={() => setTypeMenuOpen((o) => !o)}
                    className="flex rounded p-0.5 text-text-primary hover:bg-surface-muted"
                    aria-haspopup="menu"
                    aria-expanded={typeMenuOpen}
                    aria-label="Filter by type"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {typeMenuOpen && (
                    <ul role="menu" className="animate-pop-in absolute left-0 z-10 mt-2 w-44 rounded-lg border border-border bg-surface py-1 shadow-overlay">
                      {[['all', 'All types'], ...filteredTypeEntries.map(([v, t]) => [v, t.label])].map(([value, label]) => (
                        <li key={value}>
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={type === value}
                            onClick={() => {
                              setType(value)
                              setTab('all')
                              setTypeMenuOpen(false)
                            }}
                            className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-surface-muted ${type === value ? 'font-medium text-primary' : 'text-text-primary'}`}
                          >
                            {label}
                            {type === value && <Check className="h-4 w-4" aria-hidden />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button type="button" role="tab" aria-selected={tab === 'unread'} onClick={() => setTab('unread')} className={tabClass(tab === 'unread')}>
                Unread{unreadCount > 0 && ` (${unreadCount})`}
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllNotificationsRead()
                  toast.success('All notifications marked as read')
                }}
                className="mb-2 text-xs font-medium text-primary hover:text-primary-hover"
              >
                Mark all read
              </button>
            )}
          </div>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-20 text-center">
              <MailboxIllustration />
              <p className="mt-4 text-sm leading-snug text-text-primary">Uhh... There are no notifications at the moment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((n) => {
                const read = n.readBy.includes(user.id)
                const meta = NOTIFICATION_TYPES[n.type] ?? NOTIFICATION_TYPES.system
                return (
                  <li key={n.id} className={`flex gap-3 px-4 py-3.5 ${read ? '' : 'bg-primary-soft/40'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? 'bg-transparent' : 'bg-primary'}`} aria-hidden />
                    <button type="button" onClick={() => openItem(n)} className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm text-text-primary ${read ? '' : 'font-semibold'}`}>{n.title}</p>
                        <CommonBadge tone={meta.tone}>{meta.label}</CommonBadge>
                      </div>
                      <p className="mt-0.5 text-sm text-text-secondary">{n.message}</p>
                      <time className="mt-1 block text-xs text-text-secondary" dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>
                        {timeAgo(n.createdAt)}
                      </time>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationRead(n.id, !read)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      aria-label={read ? `Mark "${n.title}" as unread` : `Mark "${n.title}" as read`}
                      title={read ? 'Mark unread' : 'Mark read'}
                    >
                      {read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
