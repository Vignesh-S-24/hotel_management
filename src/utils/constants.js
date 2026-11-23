// Thai Residency Central Task Management Constants

export const HOTEL_NAME = 'Thai Residency'

export const ROLES = {
  OWNER: 'owner',           // Super Admin
  SUPERVISOR: 'supervisor', // Admin
  FO: 'fo',                 // Front Office
  HK: 'hk',                 // Housekeeping
}

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner (Super Admin)',
  [ROLES.SUPERVISOR]: 'Supervisor (Admin)',
  [ROLES.FO]: 'Front Office (FO)',
  [ROLES.HK]: 'Housekeeping (HK)',
}

// Room Statuses according to specifications (Exact 9 statuses)
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  NOT_AVAILABLE: 'not_available',
  CLEANING_REQUIRED: 'cleaning_required',
  CLEANING_ASSIGNED: 'cleaning_assigned',
  CLEANING_IN_PROGRESS: 'cleaning_in_progress',
  CLEANING_COMPLETED: 'cleaning_completed',
  INSPECTION_PENDING: 'inspection_pending',
  RE_CLEANING_REQUIRED: 're_cleaning_required',
  READY: 'ready',
}

export const ROOM_STATUS_LABELS = {
  [ROOM_STATUS.AVAILABLE]: 'Available',
  [ROOM_STATUS.NOT_AVAILABLE]: 'Not Available (Occupied)',
  [ROOM_STATUS.CLEANING_REQUIRED]: 'Cleaning Required',
  [ROOM_STATUS.CLEANING_ASSIGNED]: 'Cleaning Assigned',
  [ROOM_STATUS.CLEANING_IN_PROGRESS]: 'Cleaning In Progress',
  [ROOM_STATUS.CLEANING_COMPLETED]: 'Cleaning Completed',
  [ROOM_STATUS.INSPECTION_PENDING]: 'Inspection Pending',
  [ROOM_STATUS.RE_CLEANING_REQUIRED]: 'Re-Cleaning Required',
  [ROOM_STATUS.READY]: 'Ready',
}

// Cleaning Types
export const CLEANING_TYPES = {
  CHECKOUT: 'checkout',
  FULL_CLEANING: 'full_cleaning',
  FLOOR_CLEANING: 'floor_cleaning',
  FULL_CHANGE: 'full_change',
}

export const CLEANING_TYPE_LABELS = {
  [CLEANING_TYPES.CHECKOUT]: 'Checkout Cleaning',
  [CLEANING_TYPES.FULL_CLEANING]: 'Full Cleaning',
  [CLEANING_TYPES.FLOOR_CLEANING]: 'Floor Cleaning',
  [CLEANING_TYPES.FULL_CHANGE]: 'Full Change',
}

// Task Statuses according to specifications
export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFICATION_PENDING: 'verification_pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  REWORK_REQUIRED: 'rework_required',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pending',
  [TASK_STATUS.ASSIGNED]: 'Assigned',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.VERIFICATION_PENDING]: 'Verification Pending',
  [TASK_STATUS.VERIFIED]: 'Verified',
  [TASK_STATUS.REJECTED]: 'Rejected',
  [TASK_STATUS.REWORK_REQUIRED]: 'Rework Required',
}

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

// Laundry Categories & Statuses
export const LAUNDRY_CATEGORIES = [
  'Linen',
  'Towels',
  'Pillow Covers',
  'Floor Mats',
  'Others',
]

export const LAUNDRY_STATUS = {
  DIRTY: 'dirty',
  SENT_FOR_LAUNDRY: 'sent_for_laundry',
  PARTIALLY_RETURNED: 'partially_returned',
  RETURNED: 'returned',
  FRESH: 'fresh',
  DAMAGED: 'damaged',
  MISSING: 'missing',
}

export const LAUNDRY_STATUS_LABELS = {
  [LAUNDRY_STATUS.DIRTY]: 'Dirty',
  [LAUNDRY_STATUS.SENT_FOR_LAUNDRY]: 'Sent for Laundry',
  [LAUNDRY_STATUS.PARTIALLY_RETURNED]: 'Partially Returned',
  [LAUNDRY_STATUS.RETURNED]: 'Returned',
  [LAUNDRY_STATUS.FRESH]: 'Fresh',
  [LAUNDRY_STATUS.DAMAGED]: 'Damaged',
  [LAUNDRY_STATUS.MISSING]: 'Missing',
}

// Inventory Categories (Section 13)
export const INVENTORY_CATEGORIES = [
  'Guest Amenities',
  'Housekeeping Supplies',
  'Cleaning Consumables',
  'Laundry Items',
  'EB / Electrical Materials',
  'Plumbing Materials',
  'Other Supplies',
]

// Stock Categories (Legacy + Section 13)
export const STOCK_CATEGORIES = [
  'Guest Amenities',
  'Housekeeping Supplies',
  'Cleaning Consumables',
  'Laundry',
  'EB',
  'Plumbing',
  'Others',
]

// Wastage Reasons (Section 17)
export const WASTAGE_REASONS = [
  'Spillage',
  'Damaged Bottle',
  'Wrong Dilution',
  'Expired',
  'Other',
]

// Standard Room Cleaning Checklist Sections (Section 9)
export const DIGITAL_CHECKLIST_SECTIONS = {
  bedroom: [
    { id: 'b1', label: 'Bed cleaned', mandatory: true },
    { id: 'b2', label: 'Bedsheet changed', mandatory: true },
    { id: 'b3', label: 'Pillow arranged', mandatory: true },
    { id: 'b4', label: 'Furniture dusted', mandatory: false },
    { id: 'b5', label: 'Floor cleaned', mandatory: true },
  ],
  bathroom: [
    { id: 'bt1', label: 'Toilet cleaned', mandatory: true },
    { id: 'bt2', label: 'Bathroom floor cleaned', mandatory: true },
    { id: 'bt3', label: 'Sink cleaned', mandatory: true },
    { id: 'bt4', label: 'Mirror cleaned', mandatory: false },
    { id: 'bt5', label: 'Shower checked', mandatory: true },
  ],
  amenities: [
    { id: 'a1', label: 'Water Bottle', mandatory: true },
    { id: 'a2', label: 'Soap', mandatory: true },
    { id: 'a3', label: 'Medimix Soap', mandatory: false },
    { id: 'a4', label: 'Premium Shampoo', mandatory: false },
    { id: 'a5', label: 'Medimix Shampoo', mandatory: false },
    { id: 'a6', label: 'Toilet Seat Cover', mandatory: true },
    { id: 'a7', label: 'Towels', mandatory: true },
  ],
  general: [
    { id: 'g1', label: 'Dustbin emptied', mandatory: true },
    { id: 'g2', label: 'Lights checked', mandatory: true },
    { id: 'g3', label: 'AC checked', mandatory: true },
    { id: 'g4', label: 'TV checked', mandatory: true },
    { id: 'g5', label: 'Door lock checked', mandatory: true },
  ],
}

// Floor Walk Shift
export const FLOOR_WALK_SHIFTS = {
  MORNING: 'morning',
  EVENING: 'evening',
}

// Training Categories
export const TRAINING_CATEGORIES = [
  'Bedding',
  'Bathroom Cleaning',
  'Chemical Usage Levels',
  'Color-Coded Towels',
  'Cleaning Tutorial Videos',
]

export const STORAGE_KEYS = {
  auth: 'tr.auth.session',
  users: 'tr.auth.users',
  data: 'tr.store.v2',
  theme: 'tr.theme.mode',
}

export const NOTIFICATION_TYPES = {
  room: { label: 'Room', tone: 'primary' },
  housekeeping: { label: 'Housekeeping', tone: 'info' },
  inspection: { label: 'Inspection', tone: 'violet' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
  inventory: { label: 'Inventory', tone: 'error' },
  system: { label: 'System', tone: 'neutral' },
}
