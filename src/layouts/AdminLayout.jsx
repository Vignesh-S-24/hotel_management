import { Suspense, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/layout/AdminHeader'
import AdminSidebar from '../components/layout/AdminSidebar'
import { PageSkeleton } from '../components/common/CommonLoader'
import NotificationDrawer from '../components/shared/NotificationDrawer'

export default function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  // Pages can open the header's notification drawer via useOutletContext().
  const outletContext = useMemo(() => ({ openNotifications: () => setNotificationsOpen(true) }), [])
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64">
        <AdminHeader onMenu={() => setNavOpen(true)} onNotifications={() => setNotificationsOpen(true)} />
        <main className="mx-auto max-w-7xl px-2 py-3.5 sm:px-3 lg:py-4">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet context={outletContext} />
          </Suspense>
        </main>
      </div>
      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  )
}
