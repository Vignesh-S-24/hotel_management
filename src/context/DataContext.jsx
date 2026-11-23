import { createContext, useCallback, useContext, useMemo } from 'react'
import {
  floorsSeed,
  roomsSeed,
  floorInspectionsSeed,
  dailyTasksSeed,
  laundryItemsSeed,
  laundryTransactionsSeed,
  dailySuppliesSeed,
  centralStockSeed,
  trainingModulesSeed,
  housekeeperStockSeed,
  stockRequestsSeed,
  wastageRecordsSeed,
  standardConsumptionSeed,
} from '../data/thaiResidencyData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, ROOM_STATUS, TASK_STATUS, ROLES } from '../utils/constants'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

const buildSeed = () => ({
  floors: floorsSeed,
  rooms: roomsSeed,
  floorInspections: floorInspectionsSeed,
  tasks: dailyTasksSeed,
  laundryItems: laundryItemsSeed,
  laundryTransactions: laundryTransactionsSeed,
  supplies: dailySuppliesSeed,
  stockItems: centralStockSeed,
  trainingModules: trainingModulesSeed,
  housekeeperStock: housekeeperStockSeed,
  stockRequests: stockRequestsSeed,
  wastageRecords: wastageRecordsSeed,
  standardConsumptions: standardConsumptionSeed,
  notifications: [
    {
      id: 'notif-1',
      title: 'Room 202 Needs FO Verification',
      message: 'Housekeeping Murugan Velu submitted cleaning proof photos for Room 202.',
      type: 'room',
      audience: [ROLES.FO, ROLES.SUPERVISOR, ROLES.OWNER],
      link: '/app/rooms',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      readBy: [],
    },
    {
      id: 'notif-2',
      title: 'Task Assigned: Deep Sanitization',
      message: 'Supervisor Rajesh assigned 1st Floor Elevator Sanitization to HK staff.',
      type: 'housekeeping',
      audience: ['s-hk1', ROLES.SUPERVISOR, ROLES.OWNER],
      link: '/app/tasks',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      readBy: ['s-hk1'],
    },
    {
      id: 'notif-3',
      title: 'Low Stock Alert: Disinfectant Chemical',
      message: 'Disinfectant Multi-Surface Chemical has reached 7 cans (minimum threshold: 8 cans).',
      type: 'inventory',
      audience: [ROLES.SUPERVISOR, ROLES.OWNER],
      link: '/app/stock',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      readBy: [],
    },
  ],
  activityLogs: [
    {
      id: 'log-1',
      action: 'Room Cleaned & Submitted',
      details: 'Room 202 Full Change cleaning submitted by Murugan Velu for FO verification',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      user: 'Murugan Velu (HK)',
    },
    {
      id: 'log-2',
      action: 'Floor Walk Completed',
      details: 'Morning floor walk completed for 1st Floor - Executive Suites',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      user: 'Rajesh Kumar (Supervisor)',
    },
    {
      id: 'log-3',
      action: 'Laundry Returned',
      details: '40 Bath Towels returned from Royal Cleaners (2 damaged, 1 missing)',
      timestamp: new Date(Date.now() - 28800000).toISOString(),
      user: 'Selvi Mani (HK)',
    },
  ],
})

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useLocalStorage(STORAGE_KEYS.data, buildSeed)

  // Fast lookups
  const roomByNumber = useMemo(() => Object.fromEntries(data.rooms.map((r) => [r.number, r])), [data.rooms])

  // Compatible with old NotificationDrawer: myNotifications and unreadCount
  const myNotifications = useMemo(() => {
    return (data.notifications || []).filter((n) => {
      if (!n.audience || n.audience === 'all') return true
      if (Array.isArray(n.audience)) {
        return (
          n.audience.includes(user?.role) ||
          n.audience.includes(user?.staffId) ||
          n.audience.includes(user?.id)
        )
      }
      return n.audience === user?.role || n.audience === user?.staffId || n.audience === user?.id
    })
  }, [data.notifications, user])

  const unreadCount = useMemo(() => {
    if (!user) return 0
    return myNotifications.filter((n) => !n.readBy?.includes(user.id) && !n.readBy?.includes(user.staffId)).length
  }, [myNotifications, user])

  // --- Helpers ---
  const mutate = useCallback(
    (updater) => {
      setData((prev) => {
        const next = { ...prev }
        updater(next)
        return next
      })
    },
    [setData]
  )

  const addNotification = useCallback(
    ({ title, message, type = 'system', audience = 'all', link = '' }) => {
      mutate((d) => {
        const newNotif = {
          id: uid('notif'),
          title,
          message,
          type,
          audience,
          link,
          createdAt: new Date().toISOString(),
          readBy: [],
        }
        d.notifications = [newNotif, ...(d.notifications || [])].slice(0, 50)
      })
    },
    [mutate]
  )

  const setNotificationRead = useCallback(
    (notifId, read = true) => {
      if (!user) return
      mutate((d) => {
        d.notifications = (d.notifications || []).map((n) => {
          if (n.id !== notifId) return n
          const currentRead = n.readBy || []
          const uids = [user.id, user.staffId].filter(Boolean)
          let nextRead = currentRead
          if (read) {
            nextRead = Array.from(new Set([...currentRead, ...uids]))
          } else {
            nextRead = currentRead.filter((id) => !uids.includes(id))
          }
          return { ...n, readBy: nextRead }
        })
      })
    },
    [user, mutate]
  )

  const markAllNotificationsRead = useCallback(() => {
    if (!user) return
    mutate((d) => {
      const uids = [user.id, user.staffId].filter(Boolean)
      d.notifications = (d.notifications || []).map((n) => ({
        ...n,
        readBy: Array.from(new Set([...(n.readBy || []), ...uids])),
      }))
    })
  }, [user, mutate])

  const addLog = useCallback(
    (action, details) => {
      mutate((d) => {
        const newLog = {
          id: uid('log'),
          action,
          details,
          timestamp: new Date().toISOString(),
          user: user ? `${user.name} (${user.role.toUpperCase()})` : 'System',
        }
        d.activityLogs = [newLog, ...(d.activityLogs || [])].slice(0, 300)
      })
    },
    [mutate, user]
  )

  // --- Task Management Functions ---
  const createTask = useCallback(
    (taskData) => {
      mutate((d) => {
        const newTask = {
          id: uid('task'),
          ...taskData,
          status: TASK_STATUS.ASSIGNED,
          completionPhotos: [],
          completionRemarks: '',
          verificationRemarks: '',
          verifiedBy: null,
          createdBy: user?.name || 'Supervisor',
          createdAt: new Date().toISOString(),
        }
        d.tasks = [newTask, ...d.tasks]
      })
      addLog('Task Created', `Created task "${taskData.title}" for ${taskData.assignedToName}`)
      addNotification({
        title: `New Task Assigned: ${taskData.title}`,
        message: `Supervisor assigned you a ${taskData.priority.toUpperCase()} priority task due at ${taskData.dueTime}.`,
        type: 'housekeeping',
        audience: [taskData.assignedToId, ROLES.SUPERVISOR, ROLES.OWNER],
        link: '/app/tasks',
      })
    },
    [mutate, user, addLog, addNotification]
  )

  const updateTaskStatus = useCallback(
    (taskId, status, extra = {}) => {
      mutate((d) => {
        d.tasks = d.tasks.map((t) => {
          if (t.id !== taskId) return t
          return {
            ...t,
            status,
            ...extra,
            updatedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Task Status Changed', `Task status updated to ${status}`)
    },
    [mutate, addLog]
  )

  const submitTaskCompletion = useCallback(
    (taskId, { photos = [], remarks = '' }) => {
      let targetTask = null
      mutate((d) => {
        d.tasks = d.tasks.map((t) => {
          if (t.id !== taskId) return t
          targetTask = t
          return {
            ...t,
            status: TASK_STATUS.VERIFICATION_PENDING,
            completionPhotos: photos,
            completionRemarks: remarks,
            submittedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Task Submitted for Verification', `Task submitted with ${photos.length} photos`)
      addNotification({
        title: 'Task Verification Required',
        message: `${user?.name || 'Staff'} submitted proof photos for "${targetTask?.title || 'task'}" for supervisor approval.`,
        type: 'inspection',
        audience: [ROLES.SUPERVISOR, ROLES.OWNER],
        link: '/app/tasks',
      })
    },
    [mutate, addLog, addNotification, user]
  )

  const verifyTask = useCallback(
    (taskId, isApproved, verificationRemarks) => {
      let taskTarget = null
      mutate((d) => {
        d.tasks = d.tasks.map((t) => {
          if (t.id !== taskId) return t
          taskTarget = t
          return {
            ...t,
            status: isApproved ? TASK_STATUS.VERIFIED : TASK_STATUS.REWORK_REQUIRED,
            verificationRemarks,
            verifiedBy: user?.name || 'Supervisor',
            verifiedAt: new Date().toISOString(),
          }
        })
      })
      addLog(
        isApproved ? 'Task Approved & Verified' : 'Task Rejected / Rework Required',
        `Task verification remarks: "${verificationRemarks}"`
      )
      addNotification({
        title: isApproved ? 'Task Approved & Verified' : 'Task Rework Required',
        message: `Supervisor ${isApproved ? 'approved' : 'rejected with rework required'} "${taskTarget?.title || 'task'}": ${verificationRemarks}`,
        type: 'inspection',
        audience: taskTarget?.assignedToId ? [taskTarget.assignedToId, ROLES.SUPERVISOR, ROLES.OWNER] : 'all',
        link: '/app/tasks',
      })
    },
    [mutate, user, addLog, addNotification]
  )

  // --- Floor Walk Functions ---
  const addFloorInspection = useCallback(
    (inspection) => {
      mutate((d) => {
        const newInsp = {
          id: uid('fi'),
          ...inspection,
          inspectedBy: user ? `${user.name} (${user.title})` : 'Supervisor',
          inspectorId: user?.staffId || 's-supervisor',
          createdAt: new Date().toISOString(),
        }
        d.floorInspections = [newInsp, ...d.floorInspections]
      })
      addLog('Floor Walk Inspection Logged', `${inspection.shift.toUpperCase()} inspection on Floor ${inspection.floorNumber}`)
      addNotification({
        title: `${inspection.shift.toUpperCase()} Floor Walk Completed`,
        message: `Supervisor completed ${inspection.shift} inspection on Floor ${inspection.floorNumber} (${inspection.areaName}).`,
        type: 'inspection',
        audience: [ROLES.OWNER, ROLES.SUPERVISOR],
        link: '/app/floor-walk',
      })
    },
    [mutate, user, addLog, addNotification]
  )

  // --- Room Management Functions ---
  const assignRoomCleaning = useCallback(
    (roomId, assignedHkId, cleaningType) => {
      let roomNumber = ''
      mutate((d) => {
        d.rooms = d.rooms.map((r) => {
          if (r.id !== roomId) return r
          roomNumber = r.number
          return {
            ...r,
            status: ROOM_STATUS.CLEANING_PENDING,
            assignedHkId,
            cleaningType: cleaningType || r.cleaningType || 'full_cleaning',
            updatedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Room Cleaning Assigned', `Room ${roomNumber} assigned to HK staff for ${cleaningType}`)
      addNotification({
        title: `Room ${roomNumber} Cleaning Assigned`,
        message: `You have been assigned to perform ${cleaningType.replace('_', ' ')} for Room ${roomNumber}.`,
        type: 'room',
        audience: [assignedHkId, ROLES.SUPERVISOR, ROLES.OWNER],
        link: '/app/rooms',
      })
    },
    [mutate, addLog, addNotification]
  )

  const updateRoomCleaningStatus = useCallback(
    (roomId, status, extra = {}) => {
      mutate((d) => {
        d.rooms = d.rooms.map((r) => {
          if (r.id !== roomId) return r
          return {
            ...r,
            status,
            ...extra,
            updatedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Room Status Updated', `Room status set to ${status}`)
    },
    [mutate, addLog]
  )

  const submitRoomCleaning = useCallback(
    (roomId, { photos = [], remarks = '' }) => {
      let roomNum = ''
      mutate((d) => {
        d.rooms = d.rooms.map((r) => {
          if (r.id !== roomId) return r
          roomNum = r.number
          return {
            ...r,
            status: ROOM_STATUS.VERIFICATION_PENDING,
            cleaningPhotos: photos,
            cleaningRemarks: remarks,
            cleanedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Room Cleaning Submitted', `Room ${roomNum} cleaning submitted with ${photos.length} photos for FO verification`)
      addNotification({
        title: `Room ${roomNum} Ready for FO Verification`,
        message: `Housekeeping finished cleaning Room ${roomNum} with photo proof. Front Office verification needed.`,
        type: 'room',
        audience: [ROLES.FO, ROLES.SUPERVISOR, ROLES.OWNER],
        link: '/app/rooms',
      })
    },
    [mutate, addLog, addNotification]
  )

  const verifyRoomCleaning = useCallback(
    (roomId, isApproved, verificationRemarks) => {
      let roomNum = ''
      let targetHk = null
      mutate((d) => {
        d.rooms = d.rooms.map((r) => {
          if (r.id !== roomId) return r
          roomNum = r.number
          targetHk = r.assignedHkId
          return {
            ...r,
            status: isApproved ? ROOM_STATUS.READY : ROOM_STATUS.RECLEAN_REQUIRED,
            verificationRemarks,
            verifiedBy: user?.name || 'Front Office',
            verifiedAt: new Date().toISOString(),
          }
        })
      })
      addLog(
        isApproved ? 'Room Verified Ready' : 'Room Reclean Requested',
        `Room ${roomNum} verification note: "${verificationRemarks}"`
      )
      addNotification({
        title: isApproved ? `Room ${roomNum} Approved READY` : `Room ${roomNum} RECLEAN Required`,
        message: isApproved
          ? `Front office verified Room ${roomNum}. Room is now available for check-in.`
          : `Front office reported issues in Room ${roomNum}: "${verificationRemarks}". Reclean requested.`,
        type: 'room',
        audience: targetHk ? [targetHk, ROLES.FO, ROLES.SUPERVISOR, ROLES.OWNER] : 'all',
        link: '/app/rooms',
      })
    },
    [mutate, user, addLog, addNotification]
  )

  const guestCheckout = useCallback(
    (roomId) => {
      let roomNum = ''
      mutate((d) => {
        d.rooms = d.rooms.map((r) => {
          if (r.id !== roomId) return r
          roomNum = r.number
          return {
            ...r,
            status: ROOM_STATUS.CLEANING_PENDING,
            cleaningPhotos: [],
            cleaningRemarks: '',
            verificationRemarks: null,
            updatedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Guest Checked Out', `Room ${roomNum} checked out and marked for Cleaning Pending`)
      addNotification({
        title: `Guest Checked Out: Room ${roomNum}`,
        message: `Room ${roomNum} is vacated and requires housekeeping cleaning assignment.`,
        type: 'room',
        audience: [ROLES.SUPERVISOR, ROLES.HK, ROLES.OWNER],
        link: '/app/rooms',
      })
    },
    [mutate, addLog, addNotification]
  )

  const markRoomOccupied = useCallback(
    (roomId) => {
      let roomNum = ''
      mutate((d) => {
        d.rooms = d.rooms.map((r) => {
          if (r.id !== roomId) return r
          roomNum = r.number
          return {
            ...r,
            status: ROOM_STATUS.OCCUPIED,
            updatedAt: new Date().toISOString(),
          }
        })
      })
      addLog('Guest Checked In', `Room ${roomNum} marked Occupied`)
    },
    [mutate, addLog]
  )

  // --- Laundry Functions ---
  const collectDirtyLaundry = useCallback(
    (itemId, quantity) => {
      mutate((d) => {
        d.laundryItems = d.laundryItems.map((item) => {
          if (item.id !== itemId) return item
          return { ...item, dirtyQty: Number(item.dirtyQty) + Number(quantity) }
        })
        d.laundryTransactions = [
          {
            id: uid('lt'),
            type: 'dirty_collect',
            category: d.laundryItems.find((i) => i.id === itemId)?.category || 'Linen',
            itemName: d.laundryItems.find((i) => i.id === itemId)?.name || 'Laundry Item',
            quantity: Number(quantity),
            vendorName: 'Internal Collection',
            dispatchDate: new Date().toISOString().split('T')[0],
            responsibleEmployee: user ? `${user.name} (${user.role.toUpperCase()})` : 'HK Staff',
            status: 'dirty',
            notes: 'Collected dirty linen from rooms',
          },
          ...d.laundryTransactions,
        ]
      })
      addLog('Dirty Laundry Collected', `Collected ${quantity} units`)
    },
    [mutate, user, addLog]
  )

  const dispatchLaundry = useCallback(
    (itemId, quantity, vendorName = 'Royal Cleaners Ltd.') => {
      mutate((d) => {
        d.laundryItems = d.laundryItems.map((item) => {
          if (item.id !== itemId) return item
          const qty = Number(quantity)
          return {
            ...item,
            dirtyQty: Math.max(0, Number(item.dirtyQty) - qty),
            sentQty: Number(item.sentQty) + qty,
          }
        })
        const found = d.laundryItems.find((i) => i.id === itemId)
        d.laundryTransactions = [
          {
            id: uid('lt'),
            type: 'dispatch',
            category: found?.category || 'Linen',
            itemName: found?.name || 'Item',
            quantity: Number(quantity),
            vendorName,
            dispatchDate: new Date().toISOString().split('T')[0],
            responsibleEmployee: user ? `${user.name} (${user.role.toUpperCase()})` : 'HK Staff',
            status: 'sent_for_laundry',
            notes: `Dispatched to ${vendorName}`,
            damagedQty: 0,
            missingQty: 0,
          },
          ...d.laundryTransactions,
        ]
      })
      addLog('Laundry Dispatched', `Sent ${quantity} units for washing`)
    },
    [mutate, user, addLog]
  )

  const returnLaundry = useCallback(
    (itemId, { returnedQty, damagedQty = 0, missingQty = 0, notes = '' }) => {
      let itemTarget = null
      mutate((d) => {
        const ret = Number(returnedQty)
        const dam = Number(damagedQty)
        const mis = Number(missingQty)
        const totalAccounted = ret + dam + mis

        d.laundryItems = d.laundryItems.map((item) => {
          if (item.id !== itemId) return item
          itemTarget = item
          return {
            ...item,
            sentQty: Math.max(0, Number(item.sentQty) - totalAccounted),
            freshQty: Number(item.freshQty) + ret,
          }
        })

        const item = d.laundryItems.find((i) => i.id === itemId)
        d.laundryTransactions = [
          {
            id: uid('lt'),
            type: 'return',
            category: item?.category || 'Linen',
            itemName: item?.name || 'Item',
            quantity: ret,
            vendorName: 'Royal Cleaners Ltd.',
            dispatchDate: new Date().toISOString().split('T')[0],
            returnDate: new Date().toISOString().split('T')[0],
            responsibleEmployee: user ? `${user.name} (${user.role.toUpperCase()})` : 'HK Staff',
            status: 'returned',
            damagedQty: dam,
            missingQty: mis,
            notes,
          },
          ...d.laundryTransactions,
        ]
      })
      addLog('Laundry Returned', `Received ${returnedQty} fresh units. Damaged: ${damagedQty}, Missing: ${missingQty}`)
      if (Number(damagedQty) > 0 || Number(missingQty) > 0) {
        addNotification({
          title: `Laundry Damage / Missing Detected`,
          message: `${itemTarget?.name}: ${damagedQty} damaged, ${missingQty} missing from laundry vendor return.`,
          type: 'inventory',
          audience: [ROLES.SUPERVISOR, ROLES.OWNER],
          link: '/app/laundry',
        })
      }
    },
    [mutate, user, addLog, addNotification]
  )

  // --- Daily Supplies Functions ---
  const recordSupplyUsage = useCallback(
    (supplyId, usedQuantity) => {
      mutate((d) => {
        d.supplies = d.supplies.map((s) => {
          if (s.id !== supplyId) return s
          const qty = Number(usedQuantity)
          const newUsed = Number(s.usedQty) + qty
          const newAvailable = Math.max(0, Number(s.openingStock) + Number(s.receivedQty) - newUsed)
          return {
            ...s,
            usedQty: newUsed,
            availableStock: newAvailable,
          }
        })
      })
      addLog('Supply Consumed', `Recorded usage of ${usedQuantity} units`)
    },
    [mutate, addLog]
  )

  const addSupplyStock = useCallback(
    (supplyId, receivedQuantity) => {
      mutate((d) => {
        d.supplies = d.supplies.map((s) => {
          if (s.id !== supplyId) return s
          const qty = Number(receivedQuantity)
          const newReceived = Number(s.receivedQty) + qty
          const newAvailable = Number(s.openingStock) + newReceived - Number(s.usedQty)
          return {
            ...s,
            receivedQty: newReceived,
            availableStock: newAvailable,
          }
        })
      })
      addLog('Supply Restocked', `Added ${receivedQuantity} received units`)
    },
    [mutate, addLog]
  )

  // --- Central Stock Management Functions ---
  const addStockItem = useCallback(
    (item) => {
      mutate((d) => {
        const opening = Number(item.openingStock || 0)
        const received = Number(item.receivedStock || 0)
        const used = Number(item.usedStock || 0)
        const available = opening + received - used
        const newItem = {
          id: uid('stk'),
          ...item,
          openingStock: opening,
          receivedStock: received,
          usedStock: used,
          availableStock: available,
          lastPurchasedDate: new Date().toISOString().split('T')[0],
        }
        d.stockItems = [newItem, ...d.stockItems]
      })
      addLog('Stock Item Created', `Added new stock item ${item.name} (${item.category})`)
    },
    [mutate, addLog]
  )

  const recordStockTransaction = useCallback(
    (stockId, { type, quantity, notes = '' }) => {
      let isLowNow = false
      let targetItem = null
      mutate((d) => {
        d.stockItems = d.stockItems.map((item) => {
          if (item.id !== stockId) return item
          const qty = Number(quantity)
          let received = Number(item.receivedStock)
          let used = Number(item.usedStock)

          if (type === 'purchase' || type === 'receive') {
            received += qty
          } else if (type === 'usage' || type === 'consume') {
            used += qty
          }

          const available = Number(item.openingStock) + received - used
          if (available <= Number(item.minimumStock)) {
            isLowNow = true
            targetItem = item
          }
          return {
            ...item,
            receivedStock: received,
            usedStock: used,
            availableStock: available,
            lastPurchasedDate: type === 'purchase' ? new Date().toISOString().split('T')[0] : item.lastPurchasedDate,
          }
        })
      })
      addLog(`Stock ${type.toUpperCase()}`, `Updated ${quantity} units: ${notes}`)
      if (isLowNow && targetItem) {
        addNotification({
          title: `Low Stock Alert: ${targetItem.name}`,
          message: `${targetItem.name} (${targetItem.category}) is low on stock. Please initiate purchase order.`,
          type: 'inventory',
          audience: [ROLES.SUPERVISOR, ROLES.OWNER],
          link: '/app/stock',
        })
      }
    },
    [mutate, addLog, addNotification]
  )

  // --- Cleaning Training & Tutorial Management ---
  const addTrainingModule = useCallback(
    (module) => {
      mutate((d) => {
        const newMod = {
          id: uid('trg'),
          ...module,
          createdAt: new Date().toISOString(),
        }
        d.trainingModules = [newMod, ...d.trainingModules]
      })
      addLog('Training Tutorial Added', `Added tutorial "${module.title}" under ${module.category}`)
      addNotification({
        title: `New SOP Tutorial Published: ${module.title}`,
        message: `New standard cleaning guidelines posted under ${module.category} for housekeeping employees.`,
        type: 'system',
        audience: [ROLES.HK, ROLES.SUPERVISOR, ROLES.OWNER],
        link: '/app/training',
      })
    },
    [mutate, addLog, addNotification]
  )

  // --- Housekeeper Stock & Strict Zero-Balance Request Management (Section 13, 14, 15) ---
  const requestStock = useCallback(
    ({ itemId, requestedQuantity, requestReason }) => {
      let error = null
      let createdRequest = null

      mutate((d) => {
        // Enforce Housekeeper Zero-Balance Rule (Section 15: "HK can request additional stock ONLY when balance is exactly ZERO")
        const currentHkStock = (d.housekeeperStock || []).find(
          (h) => h.housekeeperId === user?.staffId && h.itemId === itemId
        )
        const balance = currentHkStock ? Number(currentHkStock.currentStock) : 0

        if (balance > 0) {
          error = `Stock Request Blocked: You still have ${balance} ${currentHkStock.unit || 'units'} available. You can only request when your balance is exactly ZERO.`
          return
        }

        const stockItem = (d.stockItems || []).find((s) => s.id === itemId) ||
          (d.supplies || []).find((s) => s.id === itemId)

        createdRequest = {
          id: uid('sr'),
          housekeeperId: user?.staffId || 's-hk1',
          housekeeperName: user?.name || 'Housekeeping Staff',
          itemId,
          itemName: stockItem?.name || 'Stock Item',
          currentBalance: 0,
          requestedQuantity: Number(requestedQuantity),
          approvedQuantity: null,
          issuedQuantity: null,
          requestReason,
          requestDate: new Date().toISOString(),
          status: 'pending',
          approver: null,
          issuedAt: null,
        }

        d.stockRequests = [createdRequest, ...(d.stockRequests || [])]
      })

      if (error) return { ok: false, error }

      addLog('Stock Requested', `Requested ${requestedQuantity} of ${createdRequest?.itemName} (Zero balance verified)`)
      addNotification({
        title: `Stock Request: ${createdRequest?.itemName}`,
        message: `${user?.name} requested ${requestedQuantity} units of ${createdRequest?.itemName}. Current balance is 0.`,
        type: 'inventory',
        audience: [ROLES.SUPERVISOR, ROLES.FO, ROLES.OWNER],
        link: '/app/stock',
      })
      return { ok: true, request: createdRequest }
    },
    [mutate, user, addLog, addNotification]
  )

  const approveOrRejectStockRequest = useCallback(
    (requestId, { isApproved, approvedQuantity, rejectionReason = '' }) => {
      let reqTarget = null
      mutate((d) => {
        d.stockRequests = (d.stockRequests || []).map((sr) => {
          if (sr.id !== requestId) return sr
          reqTarget = sr
          return {
            ...sr,
            status: isApproved ? 'approved' : 'rejected',
            approvedQuantity: isApproved ? Number(approvedQuantity) : 0,
            rejectionReason: isApproved ? null : rejectionReason,
            approver: user ? `${user.name} (${user.role.toUpperCase()})` : 'Authorized Staff',
            approvedAt: new Date().toISOString(),
          }
        })
      })

      if (isApproved) {
        addLog('Stock Request Approved', `Approved ${approvedQuantity} units for ${reqTarget?.housekeeperName}`)
        addNotification({
          title: `Stock Request Approved (${reqTarget?.itemName})`,
          message: `Approved quantity: ${approvedQuantity}. Ready for stock issuance.`,
          type: 'inventory',
          audience: [reqTarget?.housekeeperId, ROLES.SUPERVISOR, ROLES.OWNER],
          link: '/app/stock',
        })
      } else {
        addLog('Stock Request Rejected', `Rejected request for ${reqTarget?.itemName}: ${rejectionReason}`)
        addNotification({
          title: `Stock Request Rejected (${reqTarget?.itemName})`,
          message: `Reason: ${rejectionReason}`,
          type: 'inventory',
          audience: [reqTarget?.housekeeperId],
          link: '/app/stock',
        })
      }
    },
    [mutate, user, addLog, addNotification]
  )

  // Issue Stock (Central Stock Decreases -> HK Stock Increases)
  const issueStockToHousekeeper = useCallback(
    (requestId, issuedQuantity) => {
      let error = null
      let issuedItem = null
      let targetHkId = null

      mutate((d) => {
        const req = (d.stockRequests || []).find((r) => r.id === requestId)
        if (!req) {
          error = 'Request not found'
          return
        }
        targetHkId = req.housekeeperId
        const qty = Number(issuedQuantity)

        // Validate Central Stock availability
        let centralItem = (d.stockItems || []).find((s) => s.id === req.itemId)
        let isSupply = false
        if (!centralItem) {
          centralItem = (d.supplies || []).find((s) => s.id === req.itemId)
          isSupply = true
        }

        const available = centralItem?.availableStock || 0
        if (available < qty) {
          error = `Insufficient Central Stock! Available: ${available}, requested issuance: ${qty}.`
          return
        }

        // Deduct Central Stock
        if (isSupply) {
          d.supplies = d.supplies.map((s) =>
            s.id === centralItem.id
              ? { ...s, availableStock: s.availableStock - qty, usedQty: (s.usedQty || 0) + qty }
              : s
          )
        } else {
          d.stockItems = d.stockItems.map((s) =>
            s.id === centralItem.id
              ? { ...s, availableStock: s.availableStock - qty, usedStock: (s.usedStock || 0) + qty }
              : s
          )
        }

        // Increase Housekeeper Stock
        let foundHkStock = false
        d.housekeeperStock = (d.housekeeperStock || []).map((hs) => {
          if (hs.housekeeperId === req.housekeeperId && hs.itemId === req.itemId) {
            foundHkStock = true
            return { ...hs, currentStock: Number(hs.currentStock) + qty }
          }
          return hs
        })

        if (!foundHkStock) {
          d.housekeeperStock.push({
            id: uid('hks'),
            housekeeperId: req.housekeeperId,
            housekeeperName: req.housekeeperName,
            itemId: req.itemId,
            itemName: req.itemName,
            category: centralItem?.category || 'Consumables',
            currentStock: qty,
            unit: centralItem?.unit || 'pcs',
          })
        }

        // Mark request as issued
        d.stockRequests = d.stockRequests.map((r) =>
          r.id === requestId
            ? { ...r, status: 'issued', issuedQuantity: qty, issuedAt: new Date().toISOString() }
            : r
        )

        issuedItem = req.itemName
      })

      if (error) return { ok: false, error }

      addLog('Stock Issued to Housekeeper', `Issued ${issuedQuantity} units of ${issuedItem}`)
      addNotification({
        title: `Stock Issued: ${issuedItem}`,
        message: `${issuedQuantity} units have been transferred to your personal trolley kit.`,
        type: 'inventory',
        audience: [targetHkId],
        link: '/app/stock',
      })
      return { ok: true }
    },
    [mutate, addLog, addNotification]
  )

  // Material Consumption during cleaning (Deducts ONLY from HK Stock, NEVER central stock twice)
  const recordRoomMaterialConsumption = useCallback(
    ({ roomNumber, itemId, quantityConsumed, unit }) => {
      let error = null
      mutate((d) => {
        const hkStock = (d.housekeeperStock || []).find(
          (h) => h.housekeeperId === user?.staffId && h.itemId === itemId
        )

        if (!hkStock || Number(hkStock.currentStock) < Number(quantityConsumed)) {
          error = `Insufficient personal stock for ${hkStock?.itemName || 'item'}. Available: ${hkStock?.currentStock || 0}`
          return
        }

        // Deduct from HK personal stock
        d.housekeeperStock = d.housekeeperStock.map((h) =>
          h.id === hkStock.id
            ? { ...h, currentStock: Math.max(0, Number(h.currentStock) - Number(quantityConsumed)) }
            : h
        )

        // Append to room consumption history
        d.rooms = d.rooms.map((r) => {
          if (r.number !== roomNumber) return r
          const prev = r.materialsConsumed || []
          return {
            ...r,
            materialsConsumed: [
              ...prev,
              {
                id: uid('mc'),
                itemId,
                itemName: hkStock.itemName,
                quantity: Number(quantityConsumed),
                unit,
                housekeeper: user?.name || 'HK Staff',
                consumedAt: new Date().toISOString(),
              },
            ],
          }
        })
      })

      if (error) return { ok: false, error }

      addLog('Material Consumed', `Room ${roomNumber}: Used ${quantityConsumed} ${unit} of material`)
      return { ok: true }
    },
    [mutate, user, addLog]
  )

  // Wastage Management (Section 17: Spillage, Damaged Bottle, Wrong Dilution, Expired, etc.)
  const recordWastage = useCallback(
    ({ itemId, quantity, unit, reason, roomNumber, notes = '' }) => {
      let itemTarget = null
      mutate((d) => {
        const hkStock = (d.housekeeperStock || []).find(
          (h) => h.housekeeperId === user?.staffId && h.itemId === itemId
        )

        if (hkStock) {
          d.housekeeperStock = d.housekeeperStock.map((h) =>
            h.id === hkStock.id
              ? { ...h, currentStock: Math.max(0, Number(h.currentStock) - Number(quantity)) }
              : h
          )
        }

        const newWastage = {
          id: uid('wst'),
          itemId,
          itemName: hkStock?.itemName || 'Inventory Item',
          quantity: Number(quantity),
          unit,
          reason,
          housekeeperId: user?.staffId || 's-hk1',
          housekeeperName: user?.name || 'HK Staff',
          roomNumber: roomNumber || 'General',
          notes,
          recordedAt: new Date().toISOString(),
        }
        itemTarget = newWastage.itemName
        d.wastageRecords = [newWastage, ...(d.wastageRecords || [])]
      })

      addLog('Wastage Recorded', `${quantity} ${unit} of ${itemTarget} wasted (${reason})`)
      addNotification({
        title: `Material Wastage Reported`,
        message: `${user?.name} reported ${quantity} ${unit} of ${itemTarget} wasted due to: ${reason}.`,
        type: 'inventory',
        audience: [ROLES.SUPERVISOR, ROLES.OWNER],
        link: '/app/stock',
      })
    },
    [mutate, user, addLog, addNotification]
  )

  // Standard vs Actual Consumption Config (Section 18)
  const updateStandardConsumption = useCallback(
    (id, newStandard) => {
      mutate((d) => {
        d.standardConsumptions = (d.standardConsumptions || []).map((sc) =>
          sc.id === id ? { ...sc, standardPerRoom: Number(newStandard) } : sc
        )
      })
      addLog('Standard Consumption Updated', `Configured new standard consumption value`)
    },
    [mutate, addLog]
  )

  return (
    <DataContext.Provider
      value={{
        ...data,
        roomByNumber,
        // Notifications
        myNotifications,
        unreadCount,
        addNotification,
        setNotificationRead,
        markAllNotificationsRead,
        // Tasks
        createTask,
        updateTaskStatus,
        submitTaskCompletion,
        verifyTask,
        // Floor Walk
        addFloorInspection,
        // Room Management
        assignRoomCleaning,
        updateRoomCleaningStatus,
        submitRoomCleaning,
        verifyRoomCleaning,
        guestCheckout,
        markRoomOccupied,
        // Laundry
        collectDirtyLaundry,
        dispatchLaundry,
        returnLaundry,
        // Supplies
        recordSupplyUsage,
        addSupplyStock,
        // Central Stock
        addStockItem,
        recordStockTransaction,
        // Housekeeper Stock & Strict Zero-Balance Requests
        requestStock,
        approveOrRejectStockRequest,
        issueStockToHousekeeper,
        recordRoomMaterialConsumption,
        recordWastage,
        updateStandardConsumption,
        // Training
        addTrainingModule,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
