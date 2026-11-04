// Demo login accounts. All mock data — not real people or credentials.
// Sign in with the email or Employee ID (APK format "SO-001") and the demo password.

export const DEMO_PASSWORD = 'demo1234'

export const demoUsers = [
  {
    id: 'u-admin',
    staffId: 's-admin',
    employeeId: 'SO-001',
    email: 'admin@stayops.in',
    name: 'Vikram Rao',
    role: 'admin',
    title: 'Super Admin',
    phone: '+91 98400 11001',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-priya',
    staffId: 's-priya',
    employeeId: 'SO-101',
    email: 'priya@stayops.in',
    name: 'Priya Sharma',
    role: 'client',
    title: 'Receptionist',
    phone: '+91 98400 22101',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-kavya',
    staffId: 's-kavya',
    employeeId: 'SO-102',
    email: 'kavya@stayops.in',
    name: 'Kavya Nair',
    role: 'client',
    title: 'Receptionist',
    phone: '+91 98400 22102',
    password: DEMO_PASSWORD,
  },
]

export const publicUser = ({ password: _password, ...user }) => user
