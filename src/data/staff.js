import { daysAgo } from '../utils/formatDate'

// Mock staff. Names of receptionists and housekeepers match the APK's demo data.
export const staffSeed = [
  { id: 's-admin', employeeId: 'SO-001', name: 'Vikram Rao', role: 'super_admin', email: 'admin@stayops.in', phone: '+91 98400 11001', shift: 'Morning', availability: 'on_duty', active: true, joinedAt: daysAgo(900) },
  { id: 's-priya', employeeId: 'SO-101', name: 'Priya Sharma', role: 'receptionist', email: 'priya@stayops.in', phone: '+91 98400 22101', shift: 'Morning', availability: 'on_duty', active: true, joinedAt: daysAgo(540) },
  { id: 's-kavya', employeeId: 'SO-102', name: 'Kavya Nair', role: 'receptionist', email: 'kavya@stayops.in', phone: '+91 98400 22102', shift: 'Evening', availability: 'on_duty', active: true, joinedAt: daysAgo(310) },
  { id: 's-arun', employeeId: 'SO-201', name: 'Arun Prakash', role: 'housekeeper', email: 'arun@stayops.in', phone: '+91 98400 33201', shift: 'Morning', availability: 'on_duty', active: true, joinedAt: daysAgo(720) },
  { id: 's-ashok', employeeId: 'SO-202', name: 'Ashok Raj', role: 'housekeeper', email: 'ashok@stayops.in', phone: '+91 98400 33202', shift: 'Morning', availability: 'on_duty', active: true, joinedAt: daysAgo(400) },
  { id: 's-bala', employeeId: 'SO-203', name: 'Bala Murugan', role: 'housekeeper', email: 'bala@stayops.in', phone: '+91 98400 33203', shift: 'Evening', availability: 'on_duty', active: true, joinedAt: daysAgo(260) },
  { id: 's-kumar', employeeId: 'SO-204', name: 'Kumar Selvam', role: 'housekeeper', email: 'kumar@stayops.in', phone: '+91 98400 33204', shift: 'Morning', availability: 'on_leave', active: true, joinedAt: daysAgo(180) },
  { id: 's-murali', employeeId: 'SO-301', name: 'Murali Dharan', role: 'maintenance', email: 'murali@stayops.in', phone: '+91 98400 44301', shift: 'Morning', availability: 'on_duty', active: true, joinedAt: daysAgo(150) },
  { id: 's-deepa', employeeId: 'SO-205', name: 'Deepa Lakshmi', role: 'housekeeper', email: 'deepa@stayops.in', phone: '+91 98400 33205', shift: 'Evening', availability: 'on_duty', active: false, joinedAt: daysAgo(90) },
]
