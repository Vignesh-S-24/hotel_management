import { hoursAgo, daysAgo } from '../utils/formatDate'
import { AVAILABLE_STATUSES, NEEDS_CLEANING } from '../utils/constants'

// Seed activity feed (also used as room activity history via roomId).
export const activitiesSeed = [
  { id: 'a-01', type: 'room', kind: 'checkout', message: 'Room 209 checked out by Kavya Nair', roomId: 'r-209', actorId: 's-kavya', at: hoursAgo(0.6) },
  { id: 'a-02', type: 'housekeeping', message: 'Ashok Raj started cleaning Room 105', roomId: 'r-105', actorId: 's-ashok', at: hoursAgo(0.4) },
  { id: 'a-03', type: 'room', kind: 'checkout', message: 'Room 102 checked out by Priya Sharma', roomId: 'r-102', actorId: 's-priya', at: hoursAgo(1.2) },
  { id: 'a-04', type: 'maintenance', message: 'Repair reported for Room 301: AC not cooling', roomId: 'r-301', actorId: 's-priya', at: hoursAgo(2) },
  { id: 'a-05', type: 'housekeeping', message: 'Room 203 assigned to Arun Prakash', roomId: 'r-203', actorId: 's-admin', at: hoursAgo(2.8) },
  { id: 'a-06', type: 'inspection', message: 'Room 208 submitted for inspection by Ashok Raj', roomId: 'r-208', actorId: 's-ashok', at: hoursAgo(2.4) },
  { id: 'a-07', type: 'maintenance', message: 'Repair started in Room 205: Wash basin leaking', roomId: 'r-205', actorId: 's-admin', at: hoursAgo(3) },
  { id: 'a-08', type: 'inspection', message: 'Room 305 submitted for inspection by Arun Prakash', roomId: 'r-305', actorId: 's-arun', at: hoursAgo(3.4) },
  { id: 'a-09', type: 'inspection', message: 'Room 110 failed inspection (bathroom floor and mirror)', roomId: 'r-110', actorId: 's-priya', at: hoursAgo(6) },
  { id: 'a-10', type: 'maintenance', message: 'Repair reported for Room 108: Shower drain blocked', roomId: 'r-108', actorId: 's-ashok', at: hoursAgo(5) },
  { id: 'a-11', type: 'room', kind: 'occupied', message: 'Room 101 marked occupied by Priya Sharma', roomId: 'r-101', actorId: 's-priya', at: daysAgo(1, 14, 0) },
  { id: 'a-12', type: 'inspection', message: 'Room 103 approved and ready to use', roomId: 'r-103', actorId: 's-kavya', at: daysAgo(1, 12, 0) },
  { id: 'a-13', type: 'inventory', message: 'Stock received: 20 L Floor Cleaner (INV-4877)', roomId: null, actorId: 's-admin', at: daysAgo(10, 15, 0) },
]

const count = (list, fn) => list.filter(fn).length

// Dashboard metrics derived from the live (mock) store.
export function buildAdminStats({ rooms, tasks, inspections, maintenance, inventory }) {
  const active = rooms.filter((r) => r.active)
  return {
    totalRooms: active.length,
    availableRooms: count(active, (r) => AVAILABLE_STATUSES.includes(r.status)),
    occupiedRooms: count(active, (r) => r.status === 'occupied'),
    roomsToClean: count(active, (r) => NEEDS_CLEANING.includes(r.status)),
    pendingTasks: count(tasks, (t) => ['pending', 'assigned', 'in_progress'].includes(t.status)),
    completedTotal: count(tasks, (t) => t.status === 'completed'),
    pendingInspections: count(inspections, (i) => i.status === 'pending'),
    openMaintenance: count(maintenance, (m) => m.status !== 'completed'),
    inventoryAlerts: count(inventory, (i) => i.stock <= i.minStock),
  }
}
