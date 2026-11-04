import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, Search, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { adminNav, clientNav } from '../../routes/navigation'
import { ROOM_STATUS } from '../../utils/constants'

const LIMIT = 5

// Global search over pages, rooms and (admin only) staff. Opens with Ctrl/⌘ + K.
export default function HeaderSearch({ className = '' }) {
  const { user } = useAuth()
  const { rooms, staff } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const isAdmin = user.role === 'admin'
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const match = (...fields) => fields.some((f) => f && String(f).toLowerCase().includes(q))

    const pages = (isAdmin ? adminNav : clientNav)
      .filter((n) => match(n.label))
      .slice(0, LIMIT)
      .map((n) => ({ key: n.to, icon: n.icon, title: n.label, subtitle: 'Page', to: n.to }))

    const roomHits = rooms
      .filter((r) => match(r.number, r.type, ROOM_STATUS[r.status]?.label))
      .slice(0, LIMIT)
      .map((r) => ({
        key: r.id,
        icon: BedDouble,
        title: `Room ${r.number}`,
        subtitle: `${r.type} · ${ROOM_STATUS[r.status]?.label ?? r.status}`,
        to: isAdmin ? `/admin/rooms/${r.id}` : '/client/rooms',
      }))

    const staffHits = isAdmin
      ? staff
          .filter((s) => match(s.name, s.employeeId, s.email))
          .slice(0, LIMIT)
          .map((s) => ({ key: s.id, icon: UserRound, title: s.name, subtitle: `${s.employeeId} · ${s.email}`, to: '/admin/staff' }))
      : []

    return [
      { label: 'Pages', items: pages },
      { label: 'Rooms', items: roomHits },
      { label: 'Staff', items: staffHits },
    ].filter((g) => g.items.length)
  }, [query, rooms, staff, isAdmin])

  const flat = groups.flatMap((g) => g.items)

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [])

  const go = (item) => {
    navigate(item.to)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onInputKey = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown' && flat.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % flat.length)
    } else if (e.key === 'ArrowUp' && flat.length) {
      e.preventDefault()
      setActive((i) => (i - 1 + flat.length) % flat.length)
    } else if (e.key === 'Enter' && flat[active]) {
      e.preventDefault()
      go(flat[active])
    }
  }

  const showPanel = open && query.trim()
  let index = -1

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface-muted px-4 text-text-secondary transition focus-within:border-primary focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
          placeholder={isAdmin ? 'Search rooms, staff, pages…' : 'Search rooms, pages…'}
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
          role="combobox"
          aria-expanded={Boolean(showPanel)}
          aria-controls="header-search-results"
          aria-label="Search"
        />
        <kbd className="hidden shrink-0 rounded-md border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-medium text-text-secondary md:inline-block">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </label>

      {showPanel && (
        <div
          id="header-search-results"
          role="listbox"
          className="animate-pop-in absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-overlay"
        >
          {groups.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-secondary">No results for “{query.trim()}”</p>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="py-1">
                <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{g.label}</p>
                {g.items.map((item) => {
                  index += 1
                  const i = index
                  const Icon = item.icon
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left ${i === active ? 'bg-surface-muted' : ''}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-text-primary">{item.title}</span>
                        <span className="block truncate text-xs text-text-secondary">{item.subtitle}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
