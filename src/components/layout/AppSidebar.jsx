import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import thaiLogo from '../../assets/logo/ThaiLogo.svg'
import { useAuth } from '../../context/AuthContext'
import { getNavItems } from '../../routes/navigation'
import { ROLE_LABELS } from '../../utils/constants'

function ZohoCollapseIcon({ collapsed }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
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

  // Group items by section matching screenshot taxonomy:
  // OVERVIEW, ROOMS & HOUSEKEEPING, SUPPLIES & STOCK, MANAGEMENT, etc.
  const sections = navItems.reduce((acc, item) => {
    let sec = (item.section || 'General').toUpperCase()
    if (sec === 'OPERATIONS') sec = 'ROOMS & HOUSEKEEPING'
    if (sec === 'RESOURCES') sec = 'SUPPLIES & STOCK'
    if (sec === 'REPORTS') sec = 'REPORTS & AUDIT'
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#152344] bg-[#0E1A38] text-slate-200 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } ${open ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`flex h-16 items-center border-b border-[#1A2B55] ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={thaiLogo}
              alt="Thai Residency Logo"
              className="h-10 w-10 shrink-0 object-contain rounded-md"
            />
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <span className="block font-bold text-sm tracking-wide text-white whitespace-nowrap">
                  THAI RESIDENCY
                </span>
                <span className="block text-[10px] font-medium text-[#E0AE55] uppercase whitespace-nowrap">
                  Task Management
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-slate-300 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current user role banner (expanded only, clean dark badge) */}
        {!collapsed && (
          <div className="px-4 py-2 bg-[#122045]/60 border-b border-[#1A2B55]/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Logged as:</span>
            <span className="text-[#E0AE55] font-semibold truncate max-w-[140px]">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className={`flex-1 overflow-y-auto py-3 scrollbar-thin ${collapsed ? 'px-1 space-y-1' : 'px-3 space-y-4'}`}>
          {collapsed ? (
            /* Collapsed View */
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
                          ? 'bg-[#1D3060] text-white font-semibold border-l-4 border-[#C2903C]'
                          : 'text-slate-300 hover:bg-[#16274E] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`h-5 w-5 shrink-0 mb-1 transition-colors ${
                            isActive ? 'text-[#E0AE55]' : 'text-slate-300 group-hover:text-white'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-medium leading-tight text-center truncate max-w-[62px] ${
                            isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                          }`}
                        >
                          {item.label.split(' ')[0]}
                        </span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ) : (
            /* Expanded View: Section headers in gold-tinted smallcaps (#8A9CBF) and active item with pill #1D3060 */
            Object.entries(sections).map(([sectionName, items]) => (
              <div key={sectionName}>
                <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E0AE55]">
                  {sectionName}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg py-2 px-3 text-[13px] transition-all relative ${
                            isActive
                              ? 'bg-[#1E3366] text-white font-semibold shadow-sm border-l-4 border-[#C2903C]'
                              : 'text-slate-300 hover:bg-[#15254A] hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive ? 'text-[#E0AE55]' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">
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

        {/* Bottom Collapse Toggle Button */}
        <div className="hidden lg:block border-t border-[#1A2B55] bg-[#0A142E]">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center justify-center py-3 text-slate-400 hover:text-white hover:bg-[#122045] transition-colors ${
              collapsed ? 'px-0' : 'px-4 justify-between'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {!collapsed && (
              <span className="text-xs font-medium text-slate-400">
                Collapse Sidebar
              </span>
            )}
            <ZohoCollapseIcon collapsed={collapsed} />
          </button>
        </div>

      </aside>
    </>
  )
}
