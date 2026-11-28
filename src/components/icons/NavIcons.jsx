
const Outline = ({ children, viewBox = '0 0 24 24', className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon lpanel ${className}`}
    {...props}
  >
    {children}
  </svg>
)

export const DashboardIcon = (props) => (
  <Outline {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Outline>
)

export const TasksIcon = (props) => (
  <Outline {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M8.5 12.2l2.4 2.4 4.8-5.2" />
  </Outline>
)

export const FloorWalkIcon = (props) => (
  <Outline {...props}>
    <path d="M7.5 3.5c-1.9 0-3 2-3 4.6 0 2 .7 3.4 1 4.9h4c.3-1.5 1-2.9 1-4.9 0-2.6-1.1-4.6-3-4.6z" />
    <path d="M5.6 16h4v1.3a2 2 0 01-4 0V16z" />
    <path d="M16.5 7.5c1.9 0 3 2 3 4.6 0 2-.7 3.4-1 4.9h-4c-.3-1.5-1-2.9-1-4.9 0-2.6 1.1-4.6 3-4.6z" />
    <path d="M14.4 19h4v1.3a2 2 0 01-4 0V19z" />
  </Outline>
)

export const RoomIcon = (props) => (
  <Outline {...props}>
    <path d="M3 19.5V6.5" />
    <path d="M3 15.5h18v4" />
    <path d="M21 15.5v-2.5a3 3 0 00-3-3h-7.5v5.5" />
    <rect x="5.5" y="10.5" width="3.5" height="3" rx="1.5" />
  </Outline>
)

export const LaundryIcon = (props) => (
  <Outline {...props}>
    <path d="M9 3.5l-5.2 2.4a1.5 1.5 0 00-.8 1.8l1 3a1.5 1.5 0 001.9.9l1.1-.4v8.3a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5v-8.3l1.1.4a1.5 1.5 0 001.9-.9l1-3a1.5 1.5 0 00-.8-1.8L15 3.5" />
    <path d="M9 3.5a3 3 0 006 0" />
  </Outline>
)

export const SuppliesIcon = (props) => (
  <Outline {...props}>
    <path d="M3.5 8.5L12 4l8.5 4.5v8.2a1.5 1.5 0 01-.8 1.3L12 22l-7.7-4a1.5 1.5 0 01-.8-1.3V8.5z" />
    <path d="M3.5 8.5L12 13l8.5-4.5" />
    <path d="M12 13v9" />
    <path d="M7.8 6.2l8.4 4.6" />
  </Outline>
)

export const StockIcon = (props) => (
  <Outline {...props}>
    <rect x="3" y="12.5" width="8" height="8" rx="2" />
    <rect x="13" y="12.5" width="8" height="8" rx="2" />
    <rect x="8" y="3.5" width="8" height="8" rx="2" />
    <path d="M10.5 3.5v2.5h3V3.5" />
    <path d="M5.5 12.5V15h3v-2.5M15.5 12.5V15h3v-2.5" />
  </Outline>
)

export const TrainingIcon = (props) => (
  <Outline {...props}>
    <path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z" />
    <path d="M6.5 11v4.5c0 1.7 2.5 3.5 5.5 3.5s5.5-1.8 5.5-3.5V11" />
    <path d="M21.5 9v5.5" />
  </Outline>
)

export const MaintenanceIcon = (props) => (
  <Outline {...props}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </Outline>
)

export const BreakfastIcon = (props) => (
  <Outline {...props}>
    <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </Outline>
)

export const ReportsIcon = (props) => (
  <Outline {...props}>
    <path d="M14 3H8a3 3 0 00-3 3v12a3 3 0 003 3h8a3 3 0 003-3V8l-5-5z" />
    <path d="M14 3v3.5A1.5 1.5 0 0015.5 8H19" />
    <path d="M9 17v-3M12 17v-5M15 17v-2" />
  </Outline>
)

export const UsersIcon = (props) => (
  <Outline {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20v-.5A5.5 5.5 0 018 14h2a5.5 5.5 0 015.5 5.5v.5" />
    <path d="M15.5 4.6a3.5 3.5 0 010 6.8" />
    <path d="M18 14.2a5.5 5.5 0 013.5 5.1v.7" />
  </Outline>
)

export const BellIcon = (props) => (
  <Outline {...props}>
    <path d="M6 9.5a6 6 0 0112 0v3.6l1.6 2.7a1 1 0 01-.9 1.5H5.3a1 1 0 01-.9-1.5L6 13.1V9.5z" />
    <path d="M9.8 20a2.4 2.4 0 004.4 0" />
  </Outline>
)

export const SunIcon = (props) => (
  <Outline {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Outline>
)

export const MoonIcon = (props) => (
  <Outline {...props}>
    <path d="M20.5 14.2A8.5 8.5 0 019.8 3.5a8.5 8.5 0 1010.7 10.7z" />
  </Outline>
)
