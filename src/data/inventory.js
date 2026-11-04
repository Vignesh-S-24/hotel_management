import { daysAgo } from '../utils/formatDate'

// Item names and suppliers mirror the APK's demo inventory. Quantities are mock.
export const inventorySeed = [
  { id: 'inv-01', name: 'Medimix Soap', category: 'Amenities', unit: 'pcs', stock: 140, minStock: 60, supplier: 'Coastal Hotel Supplies' },
  { id: 'inv-02', name: 'Shampoo Medimix', category: 'Amenities', unit: 'pcs', stock: 48, minStock: 50, supplier: 'Coastal Hotel Supplies' },
  { id: 'inv-03', name: 'Shampoo Premium', category: 'Amenities', unit: 'pcs', stock: 22, minStock: 20, supplier: 'Coastal Hotel Supplies' },
  { id: 'inv-04', name: 'Water Bottle (500 ml)', category: 'Amenities', unit: 'pcs', stock: 210, minStock: 120, supplier: 'Coastal Hotel Supplies' },
  { id: 'inv-05', name: 'Toilet Seat Cover', category: 'Covers', unit: 'pcs', stock: 0, minStock: 40, supplier: 'Metro Cleaning Supplies' },
  { id: 'inv-06', name: 'Dustbin Cover', category: 'Covers', unit: 'pcs', stock: 95, minStock: 50, supplier: 'Metro Cleaning Supplies' },
  { id: 'inv-07', name: 'Floor Cleaner', category: 'Cleaners', unit: 'L', stock: 6, minStock: 10, supplier: 'Metro Cleaning Supplies' },
  { id: 'inv-08', name: 'Toilet Cleaner', category: 'Cleaners', unit: 'L', stock: 14, minStock: 8, supplier: 'Metro Cleaning Supplies' },
  { id: 'inv-09', name: 'Multipurpose Cleaner', category: 'Cleaners', unit: 'L', stock: 11, minStock: 6, supplier: 'Metro Cleaning Supplies' },
  { id: 'inv-10', name: 'Bedsheet (Queen)', category: 'Linen', unit: 'pcs', stock: 64, minStock: 40, supplier: 'Coastal Hotel Supplies' },
  { id: 'inv-11', name: 'Bath Towel', category: 'Linen', unit: 'pcs', stock: 38, minStock: 40, supplier: 'Coastal Hotel Supplies' },
]

const m = (id, itemId, type, qty, days, hour, extra = {}) => ({
  id,
  itemId,
  type,
  qty,
  reason: '',
  reference: '',
  staffId: null,
  byId: 's-admin',
  at: daysAgo(days, hour),
  ...extra,
})

export const movementsSeed = [
  m('mv-001', 'inv-01', 'in', 200, 12, 11, { reference: 'INV-4821', reason: 'Weekly order' }),
  m('mv-002', 'inv-04', 'in', 240, 12, 11, { reference: 'INV-4821', reason: 'Weekly order' }),
  m('mv-003', 'inv-07', 'in', 20, 10, 15, { reference: 'INV-4877', reason: 'Weekly order' }),
  m('mv-004', 'inv-07', 'issue', 4, 8, 9, { staffId: 's-arun' }),
  m('mv-005', 'inv-07', 'issue', 4, 6, 9, { staffId: 's-bala' }),
  m('mv-006', 'inv-01', 'issue', 30, 5, 8, { staffId: 's-ashok' }),
  m('mv-007', 'inv-05', 'damaged', 20, 4, 16, { reason: 'Damaged carton written off' }),
  m('mv-008', 'inv-05', 'issue', 25, 3, 9, { staffId: 's-arun' }),
  m('mv-009', 'inv-07', 'issue', 6, 2, 9, { staffId: 's-ashok' }),
  m('mv-010', 'inv-02', 'adjust_down', 2, 1, 18, { reason: 'Physical count correction' }),
  m('mv-011', 'inv-04', 'issue', 30, 1, 8, { staffId: 's-bala' }),
  m('mv-012', 'inv-01', 'issue', 30, 0, 8, { staffId: 's-arun' }),
]
