import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BedDouble,
  Search,
  CheckSquare,
  Shirt,
  Boxes,
  Users,
  Footprints,
  GraduationCap,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { getNavItems } from '../../routes/navigation'

const LIMIT = 4

export default function AppHeaderSearch({ className = '' }) {
  const { user, users } = useAuth()
  const { rooms, tasks, stockItems, laundryItems } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const match = (...fields) => fields.some((f) => f && String(f).toLowerCase().includes(q))

    // 1. Navigation Pages
    const navItems = getNavItems(user?.role)
    const pages = navItems
      .filter((n) => match(n.label))
      .slice(0, LIMIT)
      .map((n) => ({
        key: n.to,
        icon: n.icon,
        title: n.label,
        subtitle: 'Navigation Module',
        to: n.to,
      }))

    // 2. Rooms
    const roomHits = (rooms || [])
      .filter((r) => match(r.number, r.type, r.status))
      .slice(0, LIMIT)
      .map((r) => ({
        key: r.id,
        icon: BedDouble,
        title: `Room ${r.number}`,
        subtitle: `${r.type} · Status: ${r.status}`,
        to: '/app/rooms',
      }))

    // 3. Daily Tasks
    const taskHits = (tasks || [])
      .filter((t) => match(t.title, t.category, t.assignedToName))
      .slice(0, LIMIT)
      .map((t) => ({
        key: t.id,
        icon: CheckSquare,
        title: t.title,
        subtitle: `Task · Assigned to ${t.assignedToName}`,
        to: '/app/tasks',
      }))

    // 4. Central Stock Items
    const stockHits = (stockItems || [])
      .filter((s) => match(s.name, s.category, s.location))
      .slice(0, LIMIT)
      .map((s) => ({
        key: s.id,
        icon: Boxes,
        title: s.name,
        subtitle: `Stock · ${s.availableStock} ${s.unit} available`,
        to: '/app/stock',
      }))

    // 5. Laundry Items
    const laundryHits = (laundryItems || [])
      .filter((l) => match(l.name, l.category))
      .slice(0, LIMIT)
      .map((l) => ({
        key: l.id,
        icon: Shirt,
        title: l.name,
        subtitle: `Laundry · ${l.freshQty} fresh in stock`,
        to: '/app/laundry',
      }))

    // 6. Employees (Owner / Supervisor)
    const staffHits = (users || [])
      .filter((u) => match(u.name, u.employeeId, u.title, u.role))
      .slice(0, LIMIT)
      .map((u) => ({
        key: u.id,
        icon: Users,
        title: u.name,
        subtitle: `${u.employeeId} · ${u.title}`,
        to: '/app/users',
      }))

    return [
      { label: 'Modules & Pages', items: pages },
      { label: 'Hotel Rooms', items: roomHits },
      { label: 'Daily Tasks', items: taskHits },
      { label: 'Stock Items', items: stockHits },
      { label: 'Laundry Items', items: laundryHits },
      { label: 'Staff & Employees', items: staffHits },
    ].filter((g) => g.items.length)
  }, [query, rooms, tasks, stockItems, laundryItems, users, user?.role])

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
      <label
        onClick={() => inputRef.current?.focus()}
        className="flex h-9 w-full sm:w-64 md:w-80 lg:w-96 items-center gap-2 rounded-xl border border-border bg-surface-muted/60 px-3 text-text-secondary transition cursor-text focus-within:border-primary focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/20"
      >
        <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
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
          placeholder="Search rooms, tasks, stock, staff…"
          className="min-w-0 flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted border-none outline-none focus:outline-none focus:ring-0 focus:border-none shadow-none ring-0 focus-visible:outline-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
          role="combobox"
          aria-expanded={Boolean(showPanel)}
          aria-controls="header-search-results"
          aria-label="Common search"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-0.5 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[10px] font-medium text-text-muted md:inline-block">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        )}
      </label>

      {showPanel && (
        <div
          id="header-search-results"
          role="listbox"
          className="animate-pop-in absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-2xl z-50 ring-1 ring-black/5"
        >
          {groups.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-text-muted">
              No results found for “<strong>{query.trim()}</strong>”
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="py-1">
                <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {g.label}
                </p>
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
                      className={`flex w-full items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                        i === active ? 'bg-primary-soft text-primary' : 'hover:bg-surface-muted text-text-primary'
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-primary">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold">{item.title}</span>
                        <span className="block truncate text-[11px] text-text-muted">{item.subtitle}</span>
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
