// Thai Residency Demo Users covering the 4 required user roles:
// 1. Owner - Super Admin
// 2. Supervisor - Admin
// 3. FO - Front Office
// 4. HK - Housekeeping

export const DEMO_PASSWORD = 'demo1234'

export const demoUsers = [
  {
    id: 'u-owner',
    staffId: 's-owner',
    employeeId: 'TR-001',
    email: 'owner@thairesidency.com',
    name: 'Somchai Prasert',
    role: 'owner',
    title: 'Hotel Owner / Super Admin',
    department: 'Management',
    phone: '+91 98400 11000',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-supervisor',
    staffId: 's-supervisor',
    employeeId: 'TR-101',
    email: 'supervisor@thairesidency.com',
    name: 'Rajesh Kumar',
    role: 'supervisor',
    title: 'Operations Supervisor / Admin',
    department: 'Operations',
    phone: '+91 98400 11101',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-fo',
    staffId: 's-fo',
    employeeId: 'TR-201',
    email: 'fo@thairesidency.com',
    name: 'Ananya Sharma',
    role: 'fo',
    title: 'Front Office Executive',
    department: 'Front Office',
    phone: '+91 98400 22201',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-hk1',
    staffId: 's-hk1',
    employeeId: 'TR-301',
    email: 'hk1@thairesidency.com',
    name: 'Murugan Velu',
    role: 'hk',
    title: 'Housekeeping Lead Staff',
    department: 'Housekeeping',
    phone: '+91 98400 33301',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-hk2',
    staffId: 's-hk2',
    employeeId: 'TR-302',
    email: 'hk2@thairesidency.com',
    name: 'Selvi Mani',
    role: 'hk',
    title: 'Housekeeping Staff',
    department: 'Housekeeping',
    phone: '+91 98400 33302',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    password: DEMO_PASSWORD,
  },
]

export const publicUser = ({ password: _password, ...user }) => user
