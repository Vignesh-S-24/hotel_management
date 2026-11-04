// Domain vocabulary. Labels marked "APK" were found verbatim in app-release.apk.

export const APP_NAME = 'StayOps'
export const HOTEL_NAME = 'Thai Residency'

export const ROLES = {
  ADMIN: 'admin', // APK: "Super Admin"
  CLIENT: 'client', // APK: "Reception" / front desk (see docs/APK_ANALYSIS.md)
}

export const ROLE_LABELS = {
  admin: 'Super Admin',
  client: 'Reception',
}

export const ROLE_HOME = {
  admin: '/admin/dashboard',
  client: '/client/dashboard',
}

// Staff roles (APK: Super Admin, Receptionist, Housekeeper).
export const STAFF_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'housekeeper', label: 'Housekeeper' },
  { value: 'maintenance', label: 'Maintenance Technician' }, // assumption
]

// Staff availability (APK: On duty, On Leave, Unavailable).
export const STAFF_AVAILABILITY = [
  { value: 'on_duty', label: 'On duty', tone: 'success' },
  { value: 'unavailable', label: 'Unavailable', tone: 'warning' },
  { value: 'on_leave', label: 'On Leave', tone: 'neutral' },
]

// Room statuses (APK enum: vacant, occupied, cleaningRequired, cleaningAssigned,
// cleaningInProgress, inspectionPending, inspectionFailed, readyToUse,
// repairRequired, underRepair).
export const ROOM_STATUS = {
  vacant: { label: 'Vacant', tone: 'neutral' },
  occupied: { label: 'Occupied', tone: 'violet' },
  cleaningRequired: { label: 'Cleaning Required', tone: 'warning' },
  cleaningAssigned: { label: 'Cleaning Assigned', tone: 'info' },
  cleaningInProgress: { label: 'Cleaning In Progress', tone: 'primary' },
  inspectionPending: { label: 'Inspection Pending', tone: 'info' },
  inspectionFailed: { label: 'Inspection Failed', tone: 'error' },
  readyToUse: { label: 'Ready to Use', tone: 'success' },
  repairRequired: { label: 'Repair Required', tone: 'error' },
  underRepair: { label: 'Under Repair', tone: 'warning' },
}

export const ROOM_STATUS_OPTIONS = Object.entries(ROOM_STATUS).map(([value, s]) => ({
  value,
  label: s.label,
}))

// Statuses that count as "needs cleaning" on dashboards.
export const NEEDS_CLEANING = ['cleaningRequired', 'inspectionFailed']
export const AVAILABLE_STATUSES = ['readyToUse']

export const ROOM_TYPES = ['Standard', 'Deluxe', 'Double', 'Family'] // APK

export const FLOORS = [1, 2, 3]

// Housekeeping task lifecycle (derived from APK flow).
export const TASK_STATUS = {
  pending: { label: 'Needs assignment', tone: 'warning' }, // APK wording
  assigned: { label: 'Assigned', tone: 'info' },
  in_progress: { label: 'In Progress', tone: 'primary' },
  inspection: { label: 'Awaiting inspection', tone: 'violet' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS).map(([value, s]) => ({
  value,
  label: s.label,
}))

export const PRIORITIES = {
  low: { label: 'Low', tone: 'neutral' },
  normal: { label: 'Normal', tone: 'info' },
  high: { label: 'High', tone: 'warning' },
  critical: { label: 'Critical', tone: 'error' },
}

export const PRIORITY_OPTIONS = Object.entries(PRIORITIES).map(([value, p]) => ({
  value,
  label: p.label,
}))

// Housekeeping request types available to Reception (assumption, based on the
// APK's checkout → "Cleaning Required" flow and "Complaint check").
export const REQUEST_TYPES = [
  { value: 'checkout', label: 'Checkout cleaning' },
  { value: 'daily', label: 'Daily cleaning (occupied room)' },
  { value: 'complaint', label: 'Complaint check' },
  { value: 'amenities', label: 'Amenities refill' },
]

export const INSPECTION_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  passed: { label: 'Approved', tone: 'success' },
  failed: { label: 'Rejected', tone: 'error' },
}

// Cleaning checklist (APK).
export const CHECKLIST_ITEMS = [
  'Bed cleaned',
  'Bedsheet changed',
  'Pillows arranged',
  'Towels replaced',
  'Bathroom floor cleaned',
  'Toilet cleaned',
  'Sink cleaned',
  'Mirror cleaned',
  'Shower checked',
  'Dustbin emptied',
  'Floor cleaned',
  'Furniture dusted',
  'Lights checked',
  'Door lock checked',
  'Soap placed',
  'Water bottles placed',
]

// Inspection rejection reasons (APK).
export const DEFECT_OPTIONS = [
  'Bathroom not clean',
  'Bed not properly arranged',
  'Dust remaining',
  'Floor not clean',
  'Amenities missing',
  'Room not organized',
]

// APK calls these "Repairs"; this app labels the module "Maintenance".
export const MAINTENANCE_STATUS = {
  reported: { label: 'Reported', tone: 'warning' },
  in_progress: { label: 'Under Repair', tone: 'primary' },
  completed: { label: 'Repair Completed', tone: 'success' },
}

export const MAINTENANCE_CATEGORIES = ['Plumbing', 'Electrical', 'AC / Cooling', 'Furniture', 'Door Lock', 'TV / Media', 'Other']

// Common areas cleaned on the APK's "Daily Check".
export const COMMON_AREAS = [
  'Reception Area',
  'Car Parking',
  'Staff Bathroom',
  'Kitchen',
  '2nd / 3rd Floor Corridor',
]

export const INVENTORY_CATEGORIES = ['Amenities', 'Cleaners', 'Covers', 'Linen']

export const MOVEMENT_TYPES = {
  in: { label: 'Stock received', tone: 'success', sign: 1 },
  issue: { label: 'Issued to housekeeper', tone: 'info', sign: -1 },
  adjust_up: { label: 'Adjustment (+)', tone: 'neutral', sign: 1 },
  adjust_down: { label: 'Adjustment (−)', tone: 'warning', sign: -1 },
  damaged: { label: 'Damaged / written off', tone: 'error', sign: -1 },
}

export const NOTIFICATION_TYPES = {
  room: { label: 'Room', tone: 'primary' },
  housekeeping: { label: 'Housekeeping', tone: 'info' },
  inspection: { label: 'Inspection', tone: 'violet' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
  inventory: { label: 'Inventory', tone: 'error' },
  system: { label: 'System', tone: 'neutral' },
}

// Activity log categories (DataContext.activities[].type).
export const ACTIVITY_TYPES = {
  room: { label: 'Room', tone: 'primary' },
  housekeeping: { label: 'Housekeeping', tone: 'info' },
  inspection: { label: 'Inspection', tone: 'violet' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
  inventory: { label: 'Inventory', tone: 'error' },
  staff: { label: 'Staff', tone: 'success' },
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

export const STORAGE_KEYS = {
  auth: 'hm.auth',
  data: 'hm.data.v1',
  theme: 'hm.theme',
  users: 'hm.users',
}
