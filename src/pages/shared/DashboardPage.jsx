import {
  Users,
  CheckSquare,
  Clock,
  BedDouble,
  Sparkles,
  Shirt,
  Boxes,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Footprints,
  Wrench,
  Coffee,
  UtensilsCrossed,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { ROLES, ROLE_LABELS, ROOM_STATUS, TASK_STATUS } from '../../utils/constants'

export default function DashboardPage() {
  const { user, users } = useAuth()
  const {
    tasks,
    rooms,
    laundryItems,
    stockItems,
    floorInspections,
    activityLogs,
    maintenanceRequests = [],
    mealRecords = [],
    breakfastRecords = [],
    teaCoffeeRecords = [],
    breakfastWastage = [],
  } = useData()

  // KPI Calculations according to Section 9 of specifications:
  // - Total Employees
  // - Total Tasks
  // - Pending Tasks
  // - In Progress Tasks
  // - Completed Tasks
  // - Verification Pending Tasks
  // - Total Rooms
  // - Rooms Ready
  // - Cleaning Pending Rooms
  // - Dirty Laundry
  // - Fresh Laundry
  // - Low Stock Items
  // - Rooms Under Maintenance & Active Maintenance
  // - Today's Meals (Breakfast, Lunch, Dinner) & Beverage counts

  const totalEmployees = users.length
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter((t) => t.status === TASK_STATUS.PENDING || t.status === TASK_STATUS.ASSIGNED).length
  const inProgressTasks = tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length
  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED || t.status === TASK_STATUS.VERIFIED).length
  const verificationPendingTasks = tasks.filter((t) => t.status === TASK_STATUS.VERIFICATION_PENDING).length

  const totalRooms = rooms.length
  const roomsReady = rooms.filter((r) => r.status === ROOM_STATUS.READY).length
  const cleaningPendingRooms = rooms.filter(
    (r) =>
      r.status === ROOM_STATUS.CLEANING_PENDING ||
      r.status === ROOM_STATUS.CHECKOUT_PENDING ||
      r.status === ROOM_STATUS.RECLEAN_REQUIRED
  ).length

  const dirtyLaundry = laundryItems.reduce((acc, i) => acc + Number(i.dirtyQty || 0), 0)
  const freshLaundry = laundryItems.reduce((acc, i) => acc + Number(i.freshQty || 0), 0)
  const lowStockItems = stockItems.filter((s) => s.availableStock <= s.minimumStock).length

  const todayStr = new Date().toISOString().split('T')[0]
  const activeMaintenance = maintenanceRequests.filter(
    (m) => m.status === 'PENDING' || m.status === 'IN_PROGRESS'
  ).length
  const roomsBlockedMaintenance = rooms.filter((r) => r.maintenanceBlocked).length

  const todayAllMeals = mealRecords && mealRecords.length > 0 ? mealRecords : (breakfastRecords || []).map((b) => ({ ...b, mealType: 'Breakfast' }))
  const todayMealsTotal = todayAllMeals
    .filter((m) => m.date === todayStr)
    .reduce((sum, m) => sum + Number(m.customersServed || 0), 0)
  const todayBreakfastCount = todayAllMeals
    .filter((m) => m.date === todayStr && m.mealType === 'Breakfast')
    .reduce((sum, m) => sum + Number(m.customersServed || 0), 0)
  const todayLunchCount = todayAllMeals
    .filter((m) => m.date === todayStr && m.mealType === 'Lunch')
    .reduce((sum, m) => sum + Number(m.customersServed || 0), 0)
  const todayDinnerCount = todayAllMeals
    .filter((m) => m.date === todayStr && m.mealType === 'Dinner')
    .reduce((sum, m) => sum + Number(m.customersServed || 0), 0)

  const todayTeaCoffeeCount = teaCoffeeRecords
    .filter((t) => t.date === todayStr)
    .reduce((sum, t) => sum + Number(t.teaCount || 0) + Number(t.coffeeCount || 0), 0)
  const todayWastageCount = breakfastWastage
    .filter((w) => w.date === todayStr)
    .reduce((sum, w) => sum + Number(w.quantity || 0), 0)

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl px-6 py-4 sm:px-8 sm:py-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            Centralized operations management for Thai Residency. Real-time visibility into daily floor walks, room turnaround, laundry logistics, supplies, and employee task verifications.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid (from Section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-text">{totalEmployees}</div>
            <div className="text-xs text-text-muted">Total Employees</div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-text">{totalTasks}</div>
            <div className="text-xs text-text-muted">Total Daily Tasks</div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{pendingTasks}</div>
            <div className="text-xs text-text-muted">Pending Tasks</div>
          </div>
        </div>

        {/* Verification Pending Tasks */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{verificationPendingTasks}</div>
            <div className="text-xs text-text-muted">Needs Verification</div>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <BedDouble className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-text">{totalRooms}</div>
            <div className="text-xs text-text-muted">Total Rooms</div>
          </div>
        </div>

        {/* Rooms Ready */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{roomsReady}</div>
            <div className="text-xs text-text-muted">Rooms Ready</div>
          </div>
        </div>

        {/* Cleaning Pending Rooms */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-orange-600">{cleaningPendingRooms}</div>
            <div className="text-xs text-text-muted">Cleaning Pending</div>
          </div>
        </div>

        {/* Dirty Laundry */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-yellow-600">{dirtyLaundry}</div>
            <div className="text-xs text-text-muted">Dirty Laundry (pcs)</div>
          </div>
        </div>

        {/* Fresh Laundry */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-teal-600">{freshLaundry}</div>
            <div className="text-xs text-text-muted">Fresh Laundry (pcs)</div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{lowStockItems}</div>
            <div className="text-xs text-text-muted">Low Stock Items</div>
          </div>
        </div>

        {/* Maintenance Active */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{activeMaintenance}</div>
            <div className="text-xs text-text-muted">
              Active Maintenance {roomsBlockedMaintenance > 0 && `(${roomsBlockedMaintenance} blocked)`}
            </div>
          </div>
        </div>

        {/* Meals Served Today (Breakfast, Lunch, Dinner) */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{todayMealsTotal}</div>
            <div className="text-xs text-text-muted">
              Today Meals (B: {todayBreakfastCount}, L: {todayLunchCount}, D: {todayDinnerCount})
            </div>
          </div>
        </div>

        {/* Tea / Coffee Served Today */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-600">{todayTeaCoffeeCount}</div>
            <div className="text-xs text-text-muted">Today Tea / Coffee</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Operations Summary & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Tasks & Verification Status */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-text flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              Daily Tasks Requiring Attention
            </h2>
            <Link to="/app/tasks" className="text-xs text-primary font-semibold hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-border bg-surface-subtle flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-text">{task.title}</div>
                  <div className="text-[11px] text-text-muted">
                    Assigned: {task.assignedToName} • Due: {task.dueTime}
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface border border-border">
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Central Audit Trail & Logs */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Live Operational Activity Feed
            </h2>
            <span className="text-xs text-text-muted">System Log</span>
          </div>

          <div className="space-y-3">
            {(activityLogs || []).slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-border/70 bg-surface-subtle text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-text mb-0.5">
                  <span className="text-primary">{log.action}</span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-text-muted text-[11px] mb-1">{log.details}</p>
                <div className="text-[10px] text-text-muted italic">By: {log.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
