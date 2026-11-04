import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import CommonLoader from '../components/common/CommonLoader'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import ClientLayout from '../layouts/ClientLayout'
import ProtectedRoute, { GuestRoute, RoleRedirect } from './ProtectedRoute'

// Lazy pages are also preloaded once the browser is idle, so the first visit to a page doesn't wait on its chunk.
const preloaders = []
const page = (load) => {
  preloaders.push(load)
  return lazy(load)
}

const Login = page(() => import('../pages/auth/Login'))
const ForgotPassword = page(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = page(() => import('../pages/auth/ResetPassword'))
const NotFound = page(() => import('../pages/NotFound'))
const Unauthorized = page(() => import('../pages/Unauthorized'))

const AdminDashboard = page(() => import('../pages/admin/Dashboard'))
const RoomList = page(() => import('../pages/admin/rooms/RoomList'))
const RoomForm = page(() => import('../pages/admin/rooms/RoomForm'))
const RoomDetails = page(() => import('../pages/admin/rooms/RoomDetails'))
const HousekeepingList = page(() => import('../pages/admin/housekeeping/HousekeepingList'))
const InspectionList = page(() => import('../pages/admin/inspections/InspectionList'))
const StaffList = page(() => import('../pages/admin/staff/StaffList'))
const InventoryList = page(() => import('../pages/admin/inventory/InventoryList'))
const MaintenanceList = page(() => import('../pages/admin/maintenance/MaintenanceList'))
const Reports = page(() => import('../pages/admin/reports/Reports'))
const Settings = page(() => import('../pages/admin/settings/Settings'))
const ActivityLog = page(() => import('../pages/admin/activity/ActivityLog'))

const ClientDashboard = page(() => import('../pages/client/Dashboard'))
const RoomBoard = page(() => import('../pages/client/rooms/RoomBoard'))
const HousekeepingRequests = page(() => import('../pages/client/housekeeping/HousekeepingRequests'))
const MyInspections = page(() => import('../pages/client/inspections/MyInspections'))
const MaintenanceRequests = page(() => import('../pages/client/maintenance/MaintenanceRequests'))
const MyReports = page(() => import('../pages/client/reports/MyReports'))
const Profile = page(() => import('../pages/client/profile/Profile'))

export default function AppRoutes() {
  useEffect(() => {
    const preload = () => preloaders.forEach((load) => load().catch(() => {}))
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload)
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(preload, 1500)
    return () => clearTimeout(id)
  }, [])

  return (
    <Suspense fallback={<CommonLoader fullPage />}>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rooms" element={<RoomList />} />
            <Route path="rooms/new" element={<RoomForm />} />
            <Route path="rooms/:roomId" element={<RoomDetails />} />
            <Route path="rooms/:roomId/edit" element={<RoomForm />} />
            <Route path="housekeeping" element={<HousekeepingList />} />
            <Route path="inspections" element={<InspectionList />} />
            <Route path="staff" element={<StaffList />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="maintenance" element={<MaintenanceList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="*" element={<NotFound embedded />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['client']} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="rooms" element={<RoomBoard />} />
            <Route path="housekeeping" element={<HousekeepingRequests />} />
            <Route path="inspections" element={<MyInspections />} />
            <Route path="maintenance" element={<MaintenanceRequests />} />
            <Route path="reports" element={<MyReports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound embedded />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
