import {
  DashboardIcon,
  TasksIcon,
  FloorWalkIcon,
  RoomIcon,
  LaundryIcon,
  SuppliesIcon,
  StockIcon,
  ReportsIcon,
  UsersIcon,
  MaintenanceIcon,
  BreakfastIcon,
} from '../components/icons/NavIcons'
import { ROLES } from '../utils/constants'

export const getNavItems = (role) => {
  switch (role) {
    case ROLES.OWNER:
      return [
        { label: 'Overview', to: '/app/dashboard', icon: DashboardIcon, section: 'Management' },
        { label: 'Owner Controls', to: '/app/owner-control', icon: TasksIcon, section: 'Management' },
        { label: 'All Tasks & Verification', to: '/app/tasks', icon: TasksIcon, section: 'Operations' },
        { label: 'Floor Walks', to: '/app/floor-walk', icon: FloorWalkIcon, section: 'Operations' },
        { label: 'Room Operations', to: '/app/rooms', icon: RoomIcon, section: 'Operations' },
        { label: 'Repair & Maintenance', to: '/app/maintenance', icon: MaintenanceIcon, section: 'Operations' },
        { label: 'Meals & Dining (B/L/D)', to: '/app/breakfast-tea', icon: BreakfastIcon, section: 'Operations' },
        { label: 'Laundry Tracking', to: '/app/laundry', icon: LaundryIcon, section: 'Resources' },
        { label: 'Daily Supplies', to: '/app/supplies', icon: SuppliesIcon, section: 'Resources' },
        { label: 'Central Stock', to: '/app/stock', icon: StockIcon, section: 'Resources' },
        { label: 'Reports & Audits', to: '/app/reports', icon: ReportsIcon, section: 'Reports' },
      ]

    case ROLES.SUPERVISOR:
      return [
        { label: 'Dashboard', to: '/app/dashboard', icon: DashboardIcon, section: 'Overview' },
        { label: 'Daily Tasks & Assignment', to: '/app/tasks', icon: TasksIcon, section: 'Operations' },
        { label: 'Floor Walk Inspections', to: '/app/floor-walk', icon: FloorWalkIcon, section: 'Operations' },
        { label: 'Room Cleaning Management', to: '/app/rooms', icon: RoomIcon, section: 'Operations' },
        { label: 'Repair & Maintenance', to: '/app/maintenance', icon: MaintenanceIcon, section: 'Operations' },
        { label: 'Meals & Dining (B/L/D)', to: '/app/breakfast-tea', icon: BreakfastIcon, section: 'Operations' },
        { label: 'Laundry Operations', to: '/app/laundry', icon: LaundryIcon, section: 'Operations' },
        { label: 'Daily Supplies', to: '/app/supplies', icon: SuppliesIcon, section: 'Resources' },
        { label: 'Stock Management', to: '/app/stock', icon: StockIcon, section: 'Resources' },
        { label: 'Operational Reports', to: '/app/reports', icon: ReportsIcon, section: 'Reports' },
      ]

    case ROLES.FO:
      return [
        { label: 'Front Office Dashboard', to: '/app/dashboard', icon: DashboardIcon, section: 'Overview' },
        { label: 'Room Verification', to: '/app/room-verification', icon: RoomIcon, section: 'Rooms' },
        { label: 'All Rooms Board', to: '/app/rooms', icon: RoomIcon, section: 'Rooms' },
        { label: 'Repair & Maintenance', to: '/app/maintenance', icon: MaintenanceIcon, section: 'Operations' },
        { label: 'Meals & Dining (B/L/D)', to: '/app/breakfast-tea', icon: BreakfastIcon, section: 'Operations' },
        { label: 'My Assigned Tasks', to: '/app/tasks', icon: TasksIcon, section: 'Tasks' },
        { label: 'Floor Walk Logs', to: '/app/floor-walk', icon: FloorWalkIcon, section: 'Inspections' },
        { label: 'Daily Supplies', to: '/app/supplies', icon: SuppliesIcon, section: 'Supplies' },
        { label: 'Stock & Issuance', to: '/app/stock', icon: StockIcon, section: 'Stock' },
        { label: 'Reports', to: '/app/reports', icon: ReportsIcon, section: 'Reports' },
      ]

    case ROLES.HK:
      return [
        { label: 'HK Dashboard', to: '/app/dashboard', icon: DashboardIcon, section: 'Overview' },
        { label: 'Cleaning Timer & Checklist', to: '/app/cleaning-timer', icon: TasksIcon, section: 'Housekeeping' },
        { label: 'Report Maintenance', to: '/app/maintenance', icon: MaintenanceIcon, section: 'Housekeeping' },
        { label: 'My Assigned Tasks', to: '/app/tasks', icon: TasksIcon, section: 'Housekeeping' },
        { label: 'Room Cleaning Tasks', to: '/app/rooms', icon: RoomIcon, section: 'Housekeeping' },
        { label: 'My Stock & Requests', to: '/app/my-stock', icon: StockIcon, section: 'Inventory' },
        { label: 'Laundry Tasks', to: '/app/laundry', icon: LaundryIcon, section: 'Laundry' },
        { label: 'Daily Supplies', to: '/app/supplies', icon: SuppliesIcon, section: 'Supplies' },
      ]

    default:
      return []
  }
}
