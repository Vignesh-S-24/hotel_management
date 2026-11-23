import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import CommonLoader from '../components/common/CommonLoader'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute, { GuestRoute, RoleRedirect } from './ProtectedRoute'

const Login = lazy(() => import('../pages/auth/Login'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Unauthorized = lazy(() => import('../pages/Unauthorized'))

// Shared Thai Residency Modules
const Dashboard = lazy(() => import('../pages/shared/DashboardPage'))
const RoomsPage = lazy(() => import('../pages/shared/RoomsPage'))
const FloorWalkPage = lazy(() => import('../pages/shared/FloorWalkPage'))
const LaundryPage = lazy(() => import('../pages/shared/LaundryPage'))
const SuppliesPage = lazy(() => import('../pages/shared/SuppliesPage'))
const StockPage = lazy(() => import('../pages/shared/StockPage'))
const ReportsPage = lazy(() => import('../pages/shared/ReportsPage'))
const UsersPage = lazy(() => import('../pages/shared/UsersPage'))

// Role-Specific Portals
const OwnerPortal = lazy(() => import('../pages/owner/OwnerPortal'))
const TaskVerificationPage = lazy(() => import('../pages/supervisor/TaskVerificationPage'))
const RoomVerificationPage = lazy(() => import('../pages/fo/RoomVerificationPage'))
const CleaningTimerChecklist = lazy(() => import('../pages/hk/CleaningTimerChecklist'))
const MyStockRequests = lazy(() => import('../pages/hk/MyStockRequests'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<CommonLoader fullPage />}>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />

        {/* Guest Authentication */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Route>

        {/* Authenticated Application */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TaskVerificationPage />} />
            <Route path="floor-walk" element={<FloorWalkPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="laundry" element={<LaundryPage />} />
            <Route path="supplies" element={<SuppliesPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />

            {/* Role-Specific Direct Routes */}
            <Route path="owner-control" element={<OwnerPortal />} />
            <Route path="room-verification" element={<RoomVerificationPage />} />
            <Route path="cleaning-timer" element={<CleaningTimerChecklist />} />
            <Route path="my-stock" element={<MyStockRequests />} />

            <Route path="*" element={<NotFound embedded />} />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
