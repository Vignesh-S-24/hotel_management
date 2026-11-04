import { createContext, useCallback, useContext, useMemo } from 'react'
import { activitiesSeed } from '../data/dashboardData'
import { tasksSeed } from '../data/housekeeping'
import { inspectionsSeed } from '../data/inspections'
import { inventorySeed, movementsSeed } from '../data/inventory'
import { maintenanceSeed } from '../data/maintenance'
import { notificationsSeed } from '../data/notifications'
import { roomsSeed } from '../data/rooms'
import { staffSeed } from '../data/staff'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { HOTEL_NAME, MOVEMENT_TYPES, ROOM_STATUS, STORAGE_KEYS } from '../utils/constants'
import { useAuth } from './AuthContext'

// In-browser mock store shared by both panels. Every action mutates React
// state (persisted to localStorage) and mirrors the APK's room workflow:
// checkout → cleaning required → assigned → in progress → inspection →
// ready to use / failed, plus the repair path.

const DataContext = createContext(null)

const ALL_USERS = ['u-admin', 'u-priya', 'u-kavya']

const buildSeed = () => ({
  rooms: roomsSeed,
  tasks: tasksSeed,
  inspections: inspectionsSeed,
  staff: staffSeed,
  inventory: inventorySeed,
  movements: movementsSeed,
  maintenance: maintenanceSeed,
  notifications: notificationsSeed.map(({ read, ...n }) => ({ ...n, readBy: read ? ALL_USERS : [] })),
  activities: activitiesSeed,
  settings: {
    hotelName: HOTEL_NAME,
    address: '12 Beach Road, Chennai, Tamil Nadu (mock address)',
    phone: '+91 44 0000 0000',
    email: 'frontdesk@stayops.in',
    checkInTime: '12:00',
    checkOutTime: '11:00',
    autoCleaningAfterCheckout: true,
    requireInspection: true,
    lowStockAlerts: true,
    notifications: { email: true, push: true, repairs: true, inventory: true, inspections: true, dailyDigest: false },
  },
  preferences: {},
})

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
const now = () => new Date().toISOString()

export function DataProvider({ children }) {
  const { user, users } = useAuth()
  const [data, setData] = useLocalStorage(STORAGE_KEYS.data, buildSeed)
  const actorId = user?.staffId ?? null

  const staffById = useMemo(() => Object.fromEntries(data.staff.map((s) => [s.id, s])), [data.staff])
  const roomById = useMemo(() => Object.fromEntries(data.rooms.map((r) => [r.id, r])), [data.rooms])

  const staffName = useCallback((id) => staffById[id]?.name ?? 'Unassigned', [staffById])
  const roomLabel = useCallback(
    (roomId, location) => (roomId ? `Room ${roomById[roomId]?.number ?? '?'}` : location || '—'),
    [roomById],
  )
  const userIdForStaff = useCallback((staffId) => users.find((u) => u.staffId === staffId)?.id, [users])

  // ---- internal helpers (operate on a draft copy) ----
  const mutate = useCallback(
    (recipe) =>
      setData((prev) => {
        const next = { ...prev }
        recipe(next)
        return next
      }),
    [setData],
  )

  const log = (d, entry) => {
    d.activities = [{ id: uid('a'), at: now(), actorId, roomId: null, ...entry }, ...d.activities].slice(0, 400)
  }
  const notify = (d, entry) => {
    if (!entry.audience) return
    d.notifications = [{ id: uid('n'), createdAt: now(), readBy: [], link: '', ...entry }, ...d.notifications]
  }
  const setRoom = (d, roomId, patch, { unlessOccupied = false } = {}) => {
    d.rooms = d.rooms.map((r) => {
      if (r.id !== roomId) return r
      if (unlessOccupied && r.status === 'occupied' && patch.status) {
        const { status: _status, ...rest } = patch
        return { ...r, ...rest, updatedAt: now() }
      }
      return { ...r, ...patch, updatedAt: now() }
    })
  }
  const roomNo = (d, roomId) => d.rooms.find((r) => r.id === roomId)?.number
  const nameOf = (d, staffId) => d.staff.find((s) => s.id === staffId)?.name ?? 'Unassigned'
  const where = (d, roomId, location) => (roomId ? `Room ${roomNo(d, roomId)}` : location)

  // ---- rooms ----
  const saveRoom = useCallback(
    (values, id) => {
      const duplicate = data.rooms.some((r) => r.number === values.number && r.id !== id)
      if (duplicate) return { ok: false, error: `Room ${values.number} already exists.` }
      const roomId = id ?? `r-${values.number}-${Math.random().toString(36).slice(2, 5)}`
      mutate((d) => {
        if (id) {
          setRoom(d, id, values)
          log(d, { type: 'room', roomId: id, message: `Room ${values.number} edited` })
        } else {
          d.rooms = [
            ...d.rooms,
            { id: roomId, active: true, lastCleanedAt: null, lastInspectedAt: null, updatedAt: now(), notes: '', ...values },
          ]
          log(d, { type: 'room', roomId, message: `Room ${values.number} created` })
        }
      })
      return { ok: true, id: roomId }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.rooms, mutate, actorId],
  )

  const setRoomStatus = useCallback(
    (roomId, status, note = '') =>
      mutate((d) => {
        setRoom(d, roomId, { status })
        log(d, {
          type: 'room',
          roomId,
          message: `Room ${roomNo(d, roomId)} set to ${ROOM_STATUS[status].label}${note ? ` — ${note}` : ''}`,
        })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const toggleRoomActive = useCallback(
    (roomId) =>
      mutate((d) => {
        const room = d.rooms.find((r) => r.id === roomId)
        setRoom(d, roomId, { active: !room.active })
        log(d, { type: 'room', roomId, message: `Room ${room.number} ${room.active ? 'deactivated' : 'activated'}` })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  // Reception: guest left → room needs cleaning, Super Admin is notified (APK).
  const requestHousekeeping = useCallback(
    ({ roomId, type, priority, notes }) => {
      const id = uid('t')
      mutate((d) => {
        d.tasks = [
          {
            id,
            roomId,
            location: '',
            type,
            priority,
            notes,
            status: 'pending',
            assigneeId: null,
            requestedBy: user?.id,
            createdAt: now(),
            assignedAt: null,
            startedAt: null,
            submittedAt: null,
            completedAt: null,
            attempts: 1,
            checklist: [],
          },
          ...d.tasks,
        ]
        const label = `Room ${roomNo(d, roomId)}`
        if (type === 'checkout') {
          setRoom(d, roomId, { status: 'cleaningRequired' })
          log(d, { type: 'room', kind: 'checkout', roomId, message: `${label} checked out by ${user?.name}` })
        } else {
          log(d, { type: 'housekeeping', roomId, message: `Housekeeping requested for ${label} by ${user?.name}` })
        }
        notify(d, {
          audience: 'admin',
          type: 'housekeeping',
          title: `${label} requires cleaning`,
          message: `${user?.name} requested housekeeping for ${label}. Assign a housekeeper.`,
          link: '/admin/housekeeping',
        })
      })
      return id
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, user, actorId],
  )

  const markOccupied = useCallback(
    (roomId) =>
      mutate((d) => {
        setRoom(d, roomId, { status: 'occupied' })
        log(d, { type: 'room', kind: 'occupied', roomId, message: `Room ${roomNo(d, roomId)} marked occupied by ${user?.name}` })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, user, actorId],
  )

  // ---- housekeeping ----
  const createTask = useCallback(
    ({ roomId, location, type, priority, assigneeId, notes }) =>
      mutate((d) => {
        const id = uid('t')
        const assigned = Boolean(assigneeId)
        d.tasks = [
          {
            id,
            roomId: roomId || null,
            location: roomId ? '' : location,
            type,
            priority,
            notes,
            status: assigned ? 'assigned' : 'pending',
            assigneeId: assigneeId || null,
            requestedBy: null,
            createdAt: now(),
            assignedAt: assigned ? now() : null,
            startedAt: null,
            submittedAt: null,
            completedAt: null,
            attempts: 1,
            checklist: [],
          },
          ...d.tasks,
        ]
        if (roomId) setRoom(d, roomId, { status: assigned ? 'cleaningAssigned' : 'cleaningRequired' }, { unlessOccupied: true })
        log(d, {
          type: 'housekeeping',
          roomId: roomId || null,
          message: `Cleaning task created for ${where(d, roomId, location)}${assigned ? ` and assigned to ${nameOf(d, assigneeId)}` : ''}`,
        })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const assignTask = useCallback(
    (taskId, staffId, reason = '') =>
      mutate((d) => {
        const task = d.tasks.find((t) => t.id === taskId)
        const reassign = Boolean(task.assigneeId) && task.assigneeId !== staffId
        d.tasks = d.tasks.map((t) =>
          t.id === taskId
            ? { ...t, assigneeId: staffId, status: t.status === 'pending' ? 'assigned' : t.status, assignedAt: now() }
            : t,
        )
        if (task.roomId && task.status === 'pending') setRoom(d, task.roomId, { status: 'cleaningAssigned' }, { unlessOccupied: true })
        log(d, {
          type: 'housekeeping',
          roomId: task.roomId,
          message: `${where(d, task.roomId, task.location)} ${reassign ? 'reassigned' : 'assigned'} to ${nameOf(d, staffId)}${reason ? ` (${reason})` : ''}`,
        })
        if (task.requestedBy) {
          notify(d, {
            audience: task.requestedBy,
            type: 'housekeeping',
            title: `Housekeeper assigned: ${where(d, task.roomId, task.location)}`,
            message: `${nameOf(d, staffId)} will handle your request.`,
            link: '/client/housekeeping',
          })
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const setTaskPriority = useCallback(
    (taskId, priority) =>
      mutate((d) => {
        d.tasks = d.tasks.map((t) => (t.id === taskId ? { ...t, priority } : t))
      }),
    [mutate],
  )

  // Simulates the housekeeper's mobile actions (APK housekeeper role).
  const startTask = useCallback(
    (taskId) =>
      mutate((d) => {
        const task = d.tasks.find((t) => t.id === taskId)
        d.tasks = d.tasks.map((t) => (t.id === taskId ? { ...t, status: 'in_progress', startedAt: now() } : t))
        if (task.roomId) setRoom(d, task.roomId, { status: 'cleaningInProgress' }, { unlessOccupied: true })
        log(d, { type: 'housekeeping', roomId: task.roomId, message: `${nameOf(d, task.assigneeId)} started cleaning ${where(d, task.roomId, task.location)}` })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const submitTask = useCallback(
    (taskId, inspectorId, checklist = []) =>
      mutate((d) => {
        const task = d.tasks.find((t) => t.id === taskId)
        const label = where(d, task.roomId, task.location)
        if (!task.roomId || !d.settings.requireInspection) {
          d.tasks = d.tasks.map((t) => (t.id === taskId ? { ...t, status: 'completed', submittedAt: now(), completedAt: now(), checklist } : t))
          if (task.roomId) setRoom(d, task.roomId, { status: 'readyToUse', lastCleanedAt: now() }, { unlessOccupied: true })
          log(d, { type: 'housekeeping', roomId: task.roomId, message: `${label} cleaned by ${nameOf(d, task.assigneeId)}` })
          return
        }
        d.tasks = d.tasks.map((t) => (t.id === taskId ? { ...t, status: 'inspection', submittedAt: now(), checklist } : t))
        setRoom(d, task.roomId, { status: 'inspectionPending', lastCleanedAt: now() }, { unlessOccupied: true })
        d.inspections = [
          {
            id: uid('i'),
            taskId,
            roomId: task.roomId,
            inspectorId,
            status: 'pending',
            remarks: '',
            defects: [],
            correctiveAction: '',
            correctiveStatus: null,
            createdAt: now(),
            inspectedAt: null,
          },
          ...d.inspections,
        ]
        log(d, { type: 'inspection', roomId: task.roomId, message: `${label} submitted for inspection by ${nameOf(d, task.assigneeId)}` })
        const inspectorUser = userIdForStaff(inspectorId)
        notify(d, {
          audience: inspectorUser === 'u-admin' ? 'admin' : inspectorUser,
          type: 'inspection',
          title: `Inspection assigned: ${label}`,
          message: `${nameOf(d, task.assigneeId)} submitted ${label} for inspection.`,
          link: inspectorUser === 'u-admin' ? '/admin/inspections' : '/client/inspections',
        })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, userIdForStaff, actorId],
  )

  const cancelTask = useCallback(
    (taskId) =>
      mutate((d) => {
        const task = d.tasks.find((t) => t.id === taskId)
        d.tasks = d.tasks.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
        log(d, { type: 'housekeeping', roomId: task.roomId, message: `Task for ${where(d, task.roomId, task.location)} cancelled` })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  // ---- inspections ----
  const assignInspector = useCallback(
    (inspectionId, staffId) =>
      mutate((d) => {
        const insp = d.inspections.find((i) => i.id === inspectionId)
        d.inspections = d.inspections.map((i) => (i.id === inspectionId ? { ...i, inspectorId: staffId } : i))
        log(d, { type: 'inspection', roomId: insp.roomId, message: `Inspection of Room ${roomNo(d, insp.roomId)} handed to ${nameOf(d, staffId)}` })
        const target = userIdForStaff(staffId)
        if (target) {
          notify(d, {
            audience: target === 'u-admin' ? 'admin' : target,
            type: 'inspection',
            title: `Inspection assigned: Room ${roomNo(d, insp.roomId)}`,
            message: 'Visit the room and approve or reject it.',
            link: target === 'u-admin' ? '/admin/inspections' : '/client/inspections',
          })
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, userIdForStaff, actorId],
  )

  const recordInspection = useCallback(
    (inspectionId, { result, remarks, defects = [], correctiveAction = '' }) =>
      mutate((d) => {
        const insp = d.inspections.find((i) => i.id === inspectionId)
        const task = d.tasks.find((t) => t.id === insp.taskId)
        const label = `Room ${roomNo(d, insp.roomId)}`
        const passed = result === 'passed'
        d.inspections = d.inspections.map((i) =>
          i.id === inspectionId
            ? {
                ...i,
                status: result,
                remarks,
                defects: passed ? [] : defects,
                correctiveAction: passed ? '' : correctiveAction,
                correctiveStatus: passed ? null : 'open',
                inspectorId: i.inspectorId ?? actorId,
                inspectedAt: now(),
              }
            : i,
        )
        if (passed) {
          d.tasks = d.tasks.map((t) => (t.id === insp.taskId ? { ...t, status: 'completed', completedAt: now() } : t))
          setRoom(d, insp.roomId, { status: 'readyToUse', lastInspectedAt: now() }, { unlessOccupied: true })
          log(d, { type: 'inspection', roomId: insp.roomId, message: `${label} approved and ready to use` })
          notify(d, { audience: 'client', type: 'room', title: `${label} is ready`, message: `${label} passed inspection and can be allocated.`, link: '/client/rooms' })
          if (task?.requestedBy) {
            notify(d, { audience: task.requestedBy, type: 'housekeeping', title: `Request completed: ${label}`, message: `${nameOf(d, task.assigneeId)} completed your request.`, link: '/client/housekeeping' })
          }
        } else {
          d.tasks = d.tasks.map((t) =>
            t.id === insp.taskId ? { ...t, status: 'assigned', startedAt: null, submittedAt: null, attempts: (t.attempts ?? 1) + 1 } : t,
          )
          setRoom(d, insp.roomId, { status: 'inspectionFailed', lastInspectedAt: now() }, { unlessOccupied: true })
          log(d, { type: 'inspection', roomId: insp.roomId, message: `${label} failed inspection (${defects.join(', ') || 'see remarks'})` })
          notify(d, {
            audience: 'admin',
            type: 'inspection',
            title: `Inspection failed: ${label}`,
            message: `Sent back to ${nameOf(d, task?.assigneeId)}. ${remarks}`,
            link: '/admin/inspections',
          })
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const resolveCorrectiveAction = useCallback(
    (inspectionId) =>
      mutate((d) => {
        d.inspections = d.inspections.map((i) => (i.id === inspectionId ? { ...i, correctiveStatus: 'done' } : i))
      }),
    [mutate],
  )

  // ---- staff ----
  const saveStaff = useCallback(
    (values, id) => {
      const duplicate = data.staff.some((s) => s.employeeId.toLowerCase() === values.employeeId.toLowerCase() && s.id !== id)
      if (duplicate) return { ok: false, error: `Employee ID ${values.employeeId} is already used.` }
      mutate((d) => {
        if (id) {
          d.staff = d.staff.map((s) => (s.id === id ? { ...s, ...values } : s))
          log(d, { type: 'staff', message: `Staff record updated: ${values.name}` })
        } else {
          d.staff = [...d.staff, { id: uid('s'), active: true, joinedAt: now(), ...values }]
          log(d, { type: 'staff', message: `Staff member added: ${values.name}` })
        }
      })
      return { ok: true }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.staff, mutate, actorId],
  )

  const toggleStaffActive = useCallback(
    (staffId) =>
      mutate((d) => {
        const s = d.staff.find((x) => x.id === staffId)
        d.staff = d.staff.map((x) => (x.id === staffId ? { ...x, active: !x.active } : x))
        log(d, { type: 'staff', message: `${s.name} ${s.active ? 'deactivated' : 'activated'}` })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  // ---- inventory ----
  const saveItem = useCallback(
    (values, id) =>
      mutate((d) => {
        if (id) {
          const { stock: _ignored, ...rest } = values
          d.inventory = d.inventory.map((i) => (i.id === id ? { ...i, ...rest } : i))
          log(d, { type: 'inventory', message: `Inventory item updated: ${values.name}` })
          return
        }
        const itemId = uid('inv')
        d.inventory = [...d.inventory, { id: itemId, ...values }]
        if (values.stock > 0) {
          d.movements = [
            { id: uid('mv'), itemId, type: 'in', qty: values.stock, reason: 'Opening stock recorded', reference: '', staffId: null, byId: actorId, at: now() },
            ...d.movements,
          ]
        }
        log(d, { type: 'inventory', message: `Inventory added: ${values.name}` })
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const recordMovement = useCallback(
    ({ itemId, type, qty, reason = '', reference = '', staffId = null }) => {
      const item = data.inventory.find((i) => i.id === itemId)
      const delta = MOVEMENT_TYPES[type].sign * qty
      if (item.stock + delta < 0) return { ok: false, error: `Only ${item.stock} ${item.unit} available. Stock cannot be negative.` }
      mutate((d) => {
        const updated = item.stock + delta
        d.inventory = d.inventory.map((i) => (i.id === itemId ? { ...i, stock: updated } : i))
        d.movements = [{ id: uid('mv'), itemId, type, qty, reason, reference, staffId, byId: actorId, at: now() }, ...d.movements]
        log(d, {
          type: 'inventory',
          message: `${MOVEMENT_TYPES[type].label}: ${qty} ${item.unit} ${item.name}${staffId ? ` → ${nameOf(d, staffId)}` : ''}`,
        })
        if (delta < 0 && updated <= item.minStock && d.settings.lowStockAlerts) {
          notify(d, {
            audience: 'admin',
            type: 'inventory',
            title: updated === 0 ? `Out of stock: ${item.name}` : `Low stock: ${item.name}`,
            message: `Central stock is ${updated} ${item.unit}. Minimum is ${item.minStock} ${item.unit}.`,
            link: '/admin/inventory',
          })
        }
      })
      return { ok: true }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.inventory, mutate, actorId],
  )

  // ---- maintenance (APK: "Repairs") ----
  const createMaintenance = useCallback(
    ({ roomId, location, title, category, priority, description, assigneeId }) => {
      const id = uid('m')
      mutate((d) => {
        d.maintenance = [
          {
            id,
            roomId: roomId || null,
            location: roomId ? '' : location,
            title,
            category,
            priority,
            description,
            status: 'reported',
            reportedBy: actorId,
            assigneeId: assigneeId || null,
            createdAt: now(),
            startedAt: null,
            resolvedAt: null,
            resolution: '',
            updates: [],
          },
          ...d.maintenance,
        ]
        const label = where(d, roomId, location)
        // Occupied rooms keep their status ("Repaired while occupied" in the APK).
        if (roomId) setRoom(d, roomId, { status: 'repairRequired' }, { unlessOccupied: true })
        log(d, { type: 'maintenance', roomId: roomId || null, message: `Repair reported for ${label}: ${title}` })
        if (user?.role === 'client') {
          notify(d, { audience: 'admin', type: 'maintenance', title: `Repair reported: ${label}`, message: `${title}. Reported by ${user.name}.`, link: '/admin/maintenance' })
        }
      })
      return id
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, user, actorId],
  )

  const updateMaintenance = useCallback(
    (id, patch) =>
      mutate((d) => {
        const req = d.maintenance.find((m) => m.id === id)
        d.maintenance = d.maintenance.map((m) => (m.id === id ? { ...m, ...patch } : m))
        if (patch.assigneeId && patch.assigneeId !== req.assigneeId) {
          log(d, { type: 'maintenance', roomId: req.roomId, message: `Repair "${req.title}" assigned to ${nameOf(d, patch.assigneeId)}` })
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, actorId],
  )

  const addMaintenanceNote = useCallback(
    (id, text) =>
      mutate((d) => {
        d.maintenance = d.maintenance.map((m) => (m.id === id ? { ...m, updates: [...m.updates, { at: now(), text }] } : m))
      }),
    [mutate],
  )

  const setMaintenanceStatus = useCallback(
    (id, status, resolution = '') =>
      mutate((d) => {
        const req = d.maintenance.find((m) => m.id === id)
        const label = where(d, req.roomId, req.location)
        const patch = { status }
        if (status === 'in_progress') patch.startedAt = req.startedAt ?? now()
        if (status === 'completed') Object.assign(patch, { resolvedAt: now(), resolution })
        if (status === 'reported') Object.assign(patch, { startedAt: null, resolvedAt: null })
        d.maintenance = d.maintenance.map((m) => (m.id === id ? { ...m, ...patch } : m))

        const room = req.roomId && d.rooms.find((r) => r.id === req.roomId)
        if (room && status === 'in_progress' && room.status === 'repairRequired') setRoom(d, room.id, { status: 'underRepair' })
        // APK: after repair the room moves to Cleaning Required.
        if (room && status === 'completed' && ['repairRequired', 'underRepair'].includes(room.status)) {
          setRoom(d, room.id, { status: 'cleaningRequired' })
        }
        const verb = { in_progress: 'started', completed: 'completed', reported: 'reopened' }[status]
        log(d, { type: 'maintenance', roomId: req.roomId, message: `Repair ${verb} for ${label}: ${req.title}` })
        const reporter = userIdForStaff(req.reportedBy)
        if (reporter && reporter !== user?.id) {
          notify(d, {
            audience: reporter === 'u-admin' ? 'admin' : reporter,
            type: 'maintenance',
            title: `Repair ${verb}: ${label}`,
            message: status === 'completed' ? `${req.title} — ${resolution}` : req.title,
            link: reporter === 'u-admin' ? '/admin/maintenance' : '/client/maintenance',
          })
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, userIdForStaff, user, actorId],
  )

  // ---- notifications ----
  const isForUser = useCallback(
    (n, u = user) => u && (n.audience === u.id || n.audience === u.role),
    [user],
  )

  // Per-user preferences (client profile) can mute notification types.
  const myNotifications = useMemo(() => {
    if (!user) return []
    const prefs = data.preferences[user.id] ?? {}
    const muted = { room: prefs.roomReady === false, housekeeping: prefs.requestUpdates === false, maintenance: prefs.repairUpdates === false }
    return data.notifications.filter((n) => isForUser(n) && !muted[n.type]).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [data.notifications, data.preferences, user, isForUser])

  const setNotificationRead = useCallback(
    (id, read = true) =>
      mutate((d) => {
        d.notifications = d.notifications.map((n) => {
          if (n.id !== id) return n
          const readBy = read ? [...new Set([...n.readBy, user.id])] : n.readBy.filter((x) => x !== user.id)
          return { ...n, readBy }
        })
      }),
    [mutate, user],
  )

  const markAllNotificationsRead = useCallback(
    () =>
      mutate((d) => {
        d.notifications = d.notifications.map((n) => (isForUser(n) ? { ...n, readBy: [...new Set([...n.readBy, user.id])] } : n))
      }),
    [mutate, isForUser, user],
  )

  // ---- settings / preferences ----
  const updateSettings = useCallback(
    (patch) =>
      mutate((d) => {
        d.settings = { ...d.settings, ...patch }
      }),
    [mutate],
  )

  const updatePreferences = useCallback(
    (patch) =>
      mutate((d) => {
        d.preferences = { ...d.preferences, [user.id]: { ...(d.preferences[user.id] ?? {}), ...patch } }
      }),
    [mutate, user],
  )

  const updateStaffContact = useCallback(
    (staffId, patch) =>
      mutate((d) => {
        d.staff = d.staff.map((s) => (s.id === staffId ? { ...s, ...patch } : s))
      }),
    [mutate],
  )

  const resetDemoData = useCallback(() => setData(buildSeed()), [setData])

  const value = {
    ...data,
    staffById,
    roomById,
    staffName,
    roomLabel,
    myNotifications,
    unreadCount: myNotifications.filter((n) => !n.readBy.includes(user?.id)).length,
    myPreferences: (user && data.preferences[user.id]) || {},
    saveRoom,
    setRoomStatus,
    toggleRoomActive,
    requestHousekeeping,
    markOccupied,
    createTask,
    assignTask,
    setTaskPriority,
    startTask,
    submitTask,
    cancelTask,
    assignInspector,
    recordInspection,
    resolveCorrectiveAction,
    saveStaff,
    toggleStaffActive,
    saveItem,
    recordMovement,
    createMaintenance,
    updateMaintenance,
    addMaintenanceNote,
    setMaintenanceStatus,
    setNotificationRead,
    markAllNotificationsRead,
    updateSettings,
    updatePreferences,
    updateStaffContact,
    resetDemoData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
