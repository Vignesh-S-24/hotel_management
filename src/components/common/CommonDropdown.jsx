import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

const MENU_MAX = 256 

const SIZES = {
  sm: 'h-7 pl-2 pr-1.5 text-xs gap-1',
  md: 'h-9 pl-3 pr-2 text-sm gap-2',
}

export default function CommonDropdown({ value, onChange, options, label, size = 'md', className = '', buttonClassName = '' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const listId = useId()

  const selectedIndex = options.findIndex((o) => String(o.value) === String(value))
  const selected = options[selectedIndex]

  const place = useCallback(() => {
    const r = buttonRef.current?.getBoundingClientRect()
    if (!r) return
    const below = window.innerHeight - r.bottom
    const up = below < Math.min(MENU_MAX, options.length * 34 + 8) && r.top > below
    setPos({ left: r.left, width: r.width, ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) })
  }, [options.length])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!buttonRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  useEffect(() => {
    if (open) menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const show = () => {
    setActive(Math.max(0, selectedIndex))
    setOpen(true)
  }

  const choose = (opt) => {
    setOpen(false)
    buttonRef.current?.focus()
    if (String(opt.value) !== String(value)) onChange(opt.value)
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        show()
      }
      return
    }
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.stopPropagation()
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      setActive(e.key === 'Home' ? 0 : options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (options[active]) choose(options[active])
    }
  }

  return (
    // Stop clicks reaching clickable parents (e.g. table rows), including from the portal.
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between rounded-lg border bg-surface text-left text-text-primary transition-colors hover:border-text-secondary/40 ${
          open ? 'border-primary ring-2 ring-primary/20' : 'border-border'
        } ${SIZES[size]} ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.width }}
            className="animate-pop-in scrollbar-thin z-[70] max-h-64 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-overlay"
          >
            {options.map((o, i) => {
              const isSelected = i === selectedIndex
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  className={`flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap px-3 py-1.5 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${
                    i === active ? 'bg-surface-muted' : ''
                  } ${isSelected ? 'font-medium text-primary' : 'text-text-primary'}`}
                >
                  {o.label}
                  {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
