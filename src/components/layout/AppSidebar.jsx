import { NavLink } from 'react-router-dom'
import { Hotel, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getNavItems } from '../../routes/navigation'
import { ROLE_LABELS } from '../../utils/constants'

function ZohoCollapseIcon({ collapsed }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h7" />
      <path d="M4 12h5" />
      <path d="M4 18h7" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H10" />
    </svg>
  )
}

export default function AppSidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { user } = useAuth()
  const navItems = getNavItems(user?.role)

  // Group items by section when expanded; flatten or display directly when collapsed
  const sections = navItems.reduce((acc, item) => {
    const sec = item.section || 'General'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(item)
    return acc
  }, {})

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${open ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`flex h-16 items-center border-b border-border ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Hotel className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <span className="block font-bold text-sm tracking-wide text-text whitespace-nowrap">
                  THAI RESIDENCY
                </span>
                <span className="block text-[10px] font-medium text-text-muted uppercase whitespace-nowrap">
                  Task Management
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-hover lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current user role banner (expanded only) */}
        {!collapsed && (
          <div className="p-3 mx-3 mt-3 rounded-lg bg-surface-subtle border border-border transition-all">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Active Role
            </p>
            <p className="text-xs font-bold text-primary mt-0.5 truncate">
              {ROLE_LABELS[user?.role]}
            </p>
            <p className="text-[11px] text-text-muted truncate mt-0.5">
              {user?.name}
            </p>
          </div>
        )}

        {/* Navigation list */}
        <nav className={`flex-1 overflow-y-auto py-3 scrollbar-thin ${collapsed ? 'px-1 space-y-1' : 'px-2 space-y-4'}`}>
          {collapsed ? (
            /* Zoho Books Collapsed View: Large Icon on Top + Small Text Underneath */
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center py-2.5 px-1 rounded-md transition-all group relative ${
                        isActive
                          ? 'bg-primary text-white font-semibold shadow-sm'
                          : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`h-6 w-6 shrink-0 mb-1 transition-colors ${
                            isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-medium leading-tight text-center truncate max-w-[62px] ${
                            isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'
                          }`}
                        >
                          {item.label.split(' ')[0]}
                        </span>

                        {/* Zoho Books Triangle Corner Marker for Active Menu */}
                        <span className="absolute bottom-1 right-1 border-b-[5px] border-r-[5px] border-b-primary/60 border-r-primary/60 border-t-[5px] border-l-[5px] border-t-transparent border-l-transparent opacity-0 group-[.active]:opacity-100" />
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ) : (
            /* Expanded View: Icon + Label with Sections */
            Object.entries(sections).map(([sectionName, items]) => (
              <div key={sectionName}>
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary/70 truncate">
                  {sectionName}
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-md py-2 px-3 transition-all group ${
                            isActive
                              ? 'bg-primary text-white shadow-sm font-semibold'
                              : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={`h-5 w-5 shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'
                              }`}
                            />
                            <span
                              className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis ${
                                isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'
                              }`}
                            >
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Zoho Books Bottom Toggle Button (Exact Icon & Position from User Image) */}
        <div className="hidden lg:block border-t border-border bg-surface-muted/40 hover:bg-surface-muted transition-colors">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center justify-center py-3.5 text-text-secondary hover:text-text-primary transition-colors ${
              collapsed ? 'px-0' : 'px-4 justify-between'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {!collapsed && (
              <span className="text-xs font-semibold text-text-secondary">
                Collapse Menu
              </span>
            )}
            <ZohoCollapseIcon collapsed={collapsed} />
          </button>
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden border-t border-border p-3 text-center">
          <p className="text-[10px] text-text-muted">
            Thai Residency Hotel Management v2.0
          </p>
        </div>
      </aside>
    </>
  )
}
