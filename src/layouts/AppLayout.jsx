import { Suspense, useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import AppSidebar from '../components/layout/AppSidebar'
import { PageSkeleton } from '../components/common/CommonLoader'

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('tr.sidebar.collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('tr.sidebar.collapsed', String(collapsed))
  }, [collapsed])

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <AppHeader
          onMenu={() => setNavOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        {/* Full-width content without artificial max-w-7xl restriction to remove empty left/right margins on collapse */}
        <main className="flex-1 w-full px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
