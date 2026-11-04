import {
  BarChart3,
  BedDouble,
  Boxes,
  ClipboardCheck,
  FileBarChart,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react'


export const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, apk: true, section: 'Overview' },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3, apk: true, section: 'Overview' },
  { label: 'Activity Log', to: '/admin/activity', icon: History, apk: false, note: 'Web-only audit trail', section: 'Overview' },
  { label: 'Rooms', to: '/admin/rooms', icon: BedDouble, apk: true, section: 'Operations' },
  { label: 'Housekeeping', to: '/admin/housekeeping', icon: Sparkles, apk: true, section: 'Operations' },
  { label: 'Inspections', to: '/admin/inspections', icon: ClipboardCheck, apk: true, section: 'Operations' },
  { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench, apk: true, note: 'APK name: Repairs', section: 'Operations' },
  { label: 'Staff', to: '/admin/staff', icon: Users, apk: true, section: 'Resources' },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes, apk: true, section: 'Resources' },
  { label: 'Settings', to: '/admin/settings', icon: Settings, apk: true, section: 'Admin' },
]

export const clientNav = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard, apk: true, section: 'Overview' },
  { label: 'My Reports', to: '/client/reports', icon: FileBarChart, apk: true, note: 'APK: Reception Report', section: 'Overview' },
  { label: 'Rooms', to: '/client/rooms', icon: BedDouble, apk: true, note: 'APK: Room Board', section: 'Front desk' },
  { label: 'Housekeeping Requests', to: '/client/housekeeping', icon: Sparkles, apk: false, note: 'Assumption built on APK checkout flow', section: 'Front desk' },
  { label: 'Inspections', to: '/client/inspections', icon: ClipboardCheck, apk: true, note: 'Receptionists inspect rooms in the APK', section: 'Front desk' },
  { label: 'Maintenance Requests', to: '/client/maintenance', icon: Wrench, apk: true, note: 'APK: Repair reported', section: 'Front desk' },
  { label: 'My Profile', to: '/client/profile', icon: UserRound, apk: true, section: 'Account' },
]

export const crumbLabels = {
  admin: 'Admin',
  client: 'Reception',
  dashboard: 'Dashboard',
  rooms: 'Rooms',
  housekeeping: 'Housekeeping',
  inspections: 'Inspections',
  staff: 'Staff',
  inventory: 'Inventory',
  maintenance: 'Maintenance',
  reports: 'Reports',
  settings: 'Settings',
  activity: 'Activity Log',
  profile: 'My Profile',
  new: 'New',
  edit: 'Edit',
}
