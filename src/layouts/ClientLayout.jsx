import { Suspense, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import ClientHeader from '../components/layout/ClientHeader'
import ClientSidebar from '../components/layout/ClientSidebar'
import { PageSkeleton } from '../components/common/CommonLoader'
import NotificationDrawer from '../components/shared/NotificationDrawer'

export default function ClientLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const outletContext = useMemo(() => ({ openNotifications: () => setNotificationsOpen(true) }), [])
  return (
    <div className="min-h-screen bg-background">
      <ClientSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64">
        <ClientHeader onMenu={() => setNavOpen(true)} onNotifications={() => setNotificationsOpen(true)} />
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
