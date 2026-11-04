import { hoursAgo, daysAgo } from '../utils/formatDate'

// `audience` is 'admin', 'client' (all receptionists) or a specific user id.
export const notificationsSeed = [
  { id: 'n-01', audience: 'admin', type: 'housekeeping', title: 'Room 209 requires cleaning', message: 'Kavya Nair checked out Room 209. Assign a housekeeper to prepare it.', link: '/admin/housekeeping', read: false, createdAt: hoursAgo(0.6) },
  { id: 'n-02', audience: 'admin', type: 'housekeeping', title: 'Room 102 requires cleaning', message: 'Priya Sharma checked out Room 102. Assign a housekeeper to prepare it.', link: '/admin/housekeeping', read: false, createdAt: hoursAgo(1.2) },
  { id: 'n-03', audience: 'admin', type: 'maintenance', title: 'Repair reported: Room 301', message: 'AC not cooling. Super Admin to review and start the repair.', link: '/admin/maintenance', read: false, createdAt: hoursAgo(2) },
  { id: 'n-04', audience: 'admin', type: 'inventory', title: 'Out of stock: Toilet Seat Cover', message: 'Central stock is 0. Minimum is 40 pcs.', link: '/admin/inventory', read: false, createdAt: hoursAgo(4) },
  { id: 'n-05', audience: 'admin', type: 'inspection', title: 'Inspection failed: Room 110', message: 'Priya Sharma rejected Room 110: bathroom floor and mirror. Sent back to Bala Murugan.', link: '/admin/inspections', read: true, createdAt: hoursAgo(6) },
  { id: 'n-06', audience: 'admin', type: 'system', title: 'Kumar Selvam is on leave', message: 'Kumar Selvam marked as On Leave today. Rebalance tasks if needed.', link: '/admin/staff', read: true, createdAt: daysAgo(0, 7, 0) },
  { id: 'n-07', audience: 'u-priya', type: 'inspection', title: 'Inspection assigned: Room 208', message: 'Ashok Raj submitted Room 208 for inspection. Visit the room and approve or reject it.', link: '/client/inspections', read: false, createdAt: hoursAgo(2.4) },
  { id: 'n-08', audience: 'u-kavya', type: 'inspection', title: 'Inspection assigned: Room 305', message: 'Arun Prakash submitted Room 305 for inspection.', link: '/client/inspections', read: false, createdAt: hoursAgo(3.4) },
  { id: 'n-09', audience: 'client', type: 'room', title: 'Room 103 is ready', message: 'Room 103 passed inspection and can be allocated.', link: '/client/rooms', read: false, createdAt: daysAgo(1, 12, 0) },
  { id: 'n-10', audience: 'u-priya', type: 'maintenance', title: 'Repair received: Room 301', message: 'Your report "AC not cooling" was sent to the Super Admin.', link: '/client/maintenance', read: true, createdAt: hoursAgo(2) },
  { id: 'n-11', audience: 'u-kavya', type: 'maintenance', title: 'Repair completed: Room 207', message: 'TV not powering on — power cable reseated and set-top box reset.', link: '/client/maintenance', read: true, createdAt: daysAgo(1, 10, 45) },
  { id: 'n-12', audience: 'u-priya', type: 'housekeeping', title: 'Daily cleaning done: Room 101', message: 'Ashok Raj completed your request for Room 101.', link: '/client/housekeeping', read: true, createdAt: daysAgo(1, 10, 40) },
]
