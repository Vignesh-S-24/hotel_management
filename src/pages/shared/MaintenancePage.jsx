import { useState } from 'react'
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RotateCcw,
  Plus,
  ShieldAlert,
  Camera,
  Layers,
  Building,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_AREAS,
  ROLES,
} from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import CommonTable from '../../components/common/CommonTable'

export default function MaintenancePage() {
  const { user } = useAuth()
  const {
    maintenanceRequests = [],
    rooms = [],
    addMaintenanceRequest,
    updateMaintenanceStatus,
  } = useData()
  const toast = useToast()

  // Tabs: 'rooms', 'pending', 'completed'
  const [activeTab, setActiveTab] = useState('rooms')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [selectedReq, setSelectedReq] = useState(null)

  // Add form fields
  const [targetType, setTargetType] = useState('room') // 'room' | 'common'
  const [roomNumber, setRoomNumber] = useState('')
  const [commonArea, setCommonArea] = useState('Reception')
  const [floor, setFloor] = useState('1')
  const [category, setCategory] = useState('Plumbing')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [roomBlocked, setRoomBlocked] = useState(false)
  const [assignedTo, setAssignedTo] = useState('Internal Staff')
  const [expectedDate, setExpectedDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0])

  // Completion modal fields
  const [workDoneRemarks, setWorkDoneRemarks] = useState('')
  const [materialsUsed, setMaterialsUsed] = useState('')

  // Reopen modal fields
  const [reopenReason, setReopenReason] = useState('')

  // Filter lists
  const openRequests = maintenanceRequests.filter(
    (m) =>
      m.status === MAINTENANCE_STATUS.PENDING ||
      m.status === MAINTENANCE_STATUS.ASSIGNED ||
      m.status === MAINTENANCE_STATUS.IN_PROGRESS ||
      m.status === MAINTENANCE_STATUS.REOPENED
  )

  const completedRequests = maintenanceRequests.filter(
    (m) => m.status === MAINTENANCE_STATUS.COMPLETED || m.status === MAINTENANCE_STATUS.VERIFIED
  )

  const roomsUnderMaintenance = maintenanceRequests.filter(
    (m) =>
      m.roomBlocked &&
      (m.status === MAINTENANCE_STATUS.PENDING ||
        m.status === MAINTENANCE_STATUS.ASSIGNED ||
        m.status === MAINTENANCE_STATUS.IN_PROGRESS ||
        m.status === MAINTENANCE_STATUS.REOPENED)
  )

  const handleCreate = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title Required', 'Please enter a summary of the issue.')
      return
    }

    addMaintenanceRequest({
      roomNumber: targetType === 'room' ? roomNumber : '',
      commonArea: targetType === 'common' ? commonArea : '',
      floor: Number(floor),
      category,
      title,
      description,
      priority,
      roomBlocked: targetType === 'room' ? roomBlocked : false,
      assignedTo,
      expectedCompletionDate: expectedDate,
      reportedBy: user?.name,
    })

    toast.success('Maintenance Reported', `Request logged for ${targetType === 'room' ? `Room ${roomNumber}` : commonArea}`)
    setShowAddModal(false)
    setTitle('')
    setDescription('')
    setRoomNumber('')
  }

  const handleStartWork = (req) => {
    updateMaintenanceStatus(req.id, MAINTENANCE_STATUS.IN_PROGRESS)
    toast.info('Work Started', `Maintenance #${req.id} set to In Progress.`)
  }

  const handleConfirmComplete = (e) => {
    e.preventDefault()
    if (!selectedReq) return
    updateMaintenanceStatus(selectedReq.id, MAINTENANCE_STATUS.COMPLETED, {
      workDoneRemarks,
      materialsUsed,
      afterPhotos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'],
    })
    toast.success('Work Completed', `Submitted #${selectedReq.id} for supervisor verification.`)
    setShowCompleteModal(false)
    setSelectedReq(null)
    setWorkDoneRemarks('')
  }

  const handleVerify = (req) => {
    updateMaintenanceStatus(req.id, MAINTENANCE_STATUS.VERIFIED)
    toast.success('Maintenance Verified', `Issue #${req.id} closed and verified.`)
  }

  const handleConfirmReopen = (e) => {
    e.preventDefault()
    if (!selectedReq || !reopenReason.trim()) {
      toast.error('Reason Required', 'Mandatory reopen reason required.')
      return
    }
    updateMaintenanceStatus(selectedReq.id, MAINTENANCE_STATUS.REOPENED, {
      reopenedReason: reopenReason,
    })
    toast.warning('Maintenance Reopened', `Task #${selectedReq.id} returned to pending.`)
    setShowReopenModal(false)
    setSelectedReq(null)
    setReopenReason('')
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Repair & Maintenance Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Centralized tracking of room repairs, facility issues, work assignments, and supervisor verifications (Section 19).
          </p>
        </div>

        <CommonButton
          onClick={() => setShowAddModal(true)}
          icon={Plus}
          size="md"
        >
          Add New Maintenance
        </CommonButton>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="text-xs text-text-secondary font-medium">Under Maintenance</div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{roomsUnderMaintenance.length}</div>
          <span className="text-[11px] text-text-secondary">Rooms blocked from booking</span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="text-xs text-text-secondary font-medium">Pending Requests</div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{openRequests.length}</div>
          <span className="text-[11px] text-text-secondary">Active repairs & assigned</span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="text-xs text-text-secondary font-medium">Completed & Verified</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{completedRequests.length}</div>
          <span className="text-[11px] text-text-secondary">Total closed work orders</span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="text-xs text-text-secondary font-medium">Categories Tracked</div>
          <div className="text-xl sm:text-2xl font-black text-primary mt-1">{MAINTENANCE_CATEGORIES.length}</div>
          <span className="text-[11px] text-text-secondary">EB, Plumbing, AC & Civil</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <CommonButton
          variant={activeTab === 'rooms' ? 'primary' : 'secondary'}
          size="sm"
          icon={Building}
          onClick={() => setActiveTab('rooms')}
        >
          1. Maintenance Rooms ({roomsUnderMaintenance.length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          icon={Clock}
          onClick={() => setActiveTab('pending')}
        >
          2. Maintenance Pending ({openRequests.length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'completed' ? 'primary' : 'secondary'}
          size="sm"
          icon={CheckCircle2}
          onClick={() => setActiveTab('completed')}
        >
          3. Maintenance Completed ({completedRequests.length})
        </CommonButton>
      </div>

      {/* Tab 1: Maintenance Rooms */}
      {activeTab === 'rooms' && (
        <div className="space-y-3">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Rooms & Areas Currently Under Maintenance</h2>
            <span className="text-xs text-text-secondary">Live Room Blocked tracking</span>
          </div>

          <CommonTable
            columns={[
              {
                key: 'target',
                header: 'Location / Room',
                primary: true,
                render: (m) => (
                  <div>
                    <span className="font-bold text-text-primary">
                      {m.roomNumber ? `Room ${m.roomNumber}` : m.commonArea}
                    </span>
                    <span className="block text-[11px] text-text-secondary">Floor {m.floor}</span>
                  </div>
                ),
              },
              {
                key: 'category',
                header: 'Category',
                render: (m) => (
                  <span className="px-2 py-0.5 rounded bg-surface-muted border border-border text-[11px]">
                    {m.category}
                  </span>
                ),
              },
              {
                key: 'title',
                header: 'Issue Summary',
                render: (m) => (
                  <div>
                    <span className="font-semibold text-text-primary text-xs">{m.title}</span>
                    <p className="text-[11px] text-text-secondary line-clamp-1">{m.description}</p>
                  </div>
                ),
              },
              {
                key: 'priority',
                header: 'Priority',
                render: (m) => (
                  <CommonBadge
                    tone={m.priority === 'urgent' || m.priority === 'critical' ? 'error' : m.priority === 'high' ? 'warning' : 'neutral'}
                  >
                    {m.priority?.toUpperCase()}
                  </CommonBadge>
                ),
              },
              {
                key: 'blocked',
                header: 'Room Status',
                render: (m) =>
                  m.roomBlocked ? (
                    <CommonBadge tone="error" dot>ROOM BLOCKED</CommonBadge>
                  ) : (
                    <CommonBadge tone="neutral">Accessible</CommonBadge>
                  ),
              },
              {
                key: 'status',
                header: 'Repair Status',
                render: (m) => (
                  <CommonBadge tone={m.status === 'in_progress' ? 'info' : 'warning'}>
                    {MAINTENANCE_STATUS_LABELS[m.status] || m.status}
                  </CommonBadge>
                ),
              },
            ]}
            rows={roomsUnderMaintenance}
            rowKey="id"
          />
        </div>
      )}

      {/* Tab 2: Maintenance Pending */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">All Active & Pending Maintenance Work Orders</h2>
            <span className="text-xs text-text-secondary">Assigned & In-Progress tasks</span>
          </div>

          <CommonTable
            columns={[
              {
                key: 'id',
                header: 'ID & Target',
                primary: true,
                render: (m) => (
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">#{m.id}</span>
                    <span className="block text-xs font-semibold text-text-primary">
                      {m.roomNumber ? `Room ${m.roomNumber}` : m.commonArea}
                    </span>
                  </div>
                ),
              },
              {
                key: 'details',
                header: 'Category & Issue',
                render: (m) => (
                  <div>
                    <span className="font-bold text-text-primary text-xs">{m.title}</span>
                    <span className="block text-[11px] text-text-secondary">{m.category} • Assigned: {m.assignedTo}</span>
                  </div>
                ),
              },
              {
                key: 'priority',
                header: 'Priority',
                render: (m) => (
                  <CommonBadge tone={m.priority === 'urgent' ? 'error' : m.priority === 'high' ? 'warning' : 'neutral'}>
                    {m.priority?.toUpperCase()}
                  </CommonBadge>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (m) => (
                  <CommonBadge tone={m.status === 'in_progress' ? 'info' : m.status === 'reopened' ? 'error' : 'warning'} dot>
                    {MAINTENANCE_STATUS_LABELS[m.status]}
                  </CommonBadge>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (m) => (
                  <div className="flex items-center justify-end gap-1.5">
                    {m.status !== 'in_progress' && (
                      <CommonButton
                        size="sm"
                        variant="soft"
                        onClick={() => handleStartWork(m)}
                      >
                        Start Work
                      </CommonButton>
                    )}
                    <CommonButton
                      size="sm"
                      variant="success"
                      onClick={() => {
                        setSelectedReq(m)
                        setShowCompleteModal(true)
                      }}
                    >
                      Mark Completed
                    </CommonButton>
                  </div>
                ),
              },
            ]}
            rows={openRequests}
            rowKey="id"
          />
        </div>
      )}

      {/* Tab 3: Maintenance Completed */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Completed Work Orders & Audit History</h2>
            <span className="text-xs text-text-secondary">Verified or Awaiting Supervisor Review</span>
          </div>

          <CommonTable
            columns={[
              {
                key: 'id',
                header: 'ID & Location',
                primary: true,
                render: (m) => (
                  <div>
                    <span className="font-mono text-xs font-bold text-text-secondary">#{m.id}</span>
                    <span className="block font-bold text-text-primary text-xs">
                      {m.roomNumber ? `Room ${m.roomNumber}` : m.commonArea}
                    </span>
                  </div>
                ),
              },
              {
                key: 'work',
                header: 'Work Details & Remarks',
                render: (m) => (
                  <div>
                    <span className="font-bold text-text-primary text-xs">{m.title}</span>
                    <p className="text-[11px] text-text-secondary italic">"{m.workDoneRemarks || 'Repairs completed.'}"</p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Verification',
                render: (m) => (
                  <CommonBadge tone={m.status === 'verified' ? 'success' : 'violet'}>
                    {m.status === 'verified' ? 'Verified Approved' : 'Verification Pending'}
                  </CommonBadge>
                ),
              },
              {
                key: 'actions',
                header: 'Supervisor Review',
                className: 'text-right',
                render: (m) => (
                  <div className="flex items-center justify-end gap-1.5">
                    {m.status !== 'verified' && (user?.role === ROLES.OWNER || user?.role === ROLES.SUPERVISOR) && (
                      <CommonButton
                        size="sm"
                        variant="success"
                        onClick={() => handleVerify(m)}
                      >
                        Approve (Verify)
                      </CommonButton>
                    )}
                    <CommonButton
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedReq(m)
                        setShowReopenModal(true)
                      }}
                    >
                      Reopen
                    </CommonButton>
                  </div>
                ),
              },
            ]}
            rows={completedRequests}
            rowKey="id"
          />
        </div>
      )}

      {/* Add New Maintenance Modal */}
      {showAddModal && (
        <CommonModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Maintenance Request"
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="add-maintenance-form"
                size="md"
              >
                Submit Request
              </CommonButton>
            </>
          }
        >
          <form id="add-maintenance-form" onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'room'}
                  onChange={() => setTargetType('room')}
                />
                Guest Room
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === 'common'}
                  onChange={() => setTargetType('common')}
                />
                Common Hotel Area
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {targetType === 'room' ? (
                <CommonSelect
                  label="Room Number"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Select Room..."
                  options={rooms.map((r) => ({
                    value: r.number,
                    label: `Room ${r.number} (Floor ${r.floor})`,
                  }))}
                />
              ) : (
                <CommonSelect
                  label="Common Area"
                  required
                  value={commonArea}
                  onChange={(e) => setCommonArea(e.target.value)}
                  options={MAINTENANCE_AREAS.map((a) => ({ value: a, label: a }))}
                />
              )}

              <CommonSelect
                label="Floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                options={[
                  { value: '1', label: '1st Floor' },
                  { value: '2', label: '2nd Floor' },
                  { value: '3', label: '3rd Floor' },
                  { value: '4', label: '4th Floor / Terrace' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CommonSelect
                label="Maintenance Category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={MAINTENANCE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />

              <CommonSelect
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>

            <CommonInput
              label="Issue Summary Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC unit leaking water over desk"
            />

            <CommonInput
              label="Issue Description & Details"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exact symptoms, sound, or inspection findings..."
            />

            {targetType === 'room' && (
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Block Room from Booking?</span>
                  <p className="text-[11px] text-text-secondary">If enabled, room is marked NOT_AVAILABLE until repair is verified.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomBlocked}
                    onChange={(e) => setRoomBlocked(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
            )}
          </form>
        </CommonModal>
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && selectedReq && (
        <CommonModal
          open={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title={`Complete Maintenance Work: #${selectedReq.id}`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowCompleteModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="complete-maintenance-form"
                size="md"
              >
                Submit Completion
              </CommonButton>
            </>
          }
        >
          <form id="complete-maintenance-form" onSubmit={handleConfirmComplete} className="space-y-4">
            <CommonInput
              label="Work Done / Resolution Remarks"
              required
              multiline
              rows={3}
              value={workDoneRemarks}
              onChange={(e) => setWorkDoneRemarks(e.target.value)}
              placeholder="Describe the repair actions taken..."
            />

            <CommonInput
              label="Materials / Replacement Parts Used"
              value={materialsUsed}
              onChange={(e) => setMaterialsUsed(e.target.value)}
              placeholder="e.g. 1x Washer, 2m PVC pipe, 1x 15A switch..."
            />
          </form>
        </CommonModal>
      )}

      {/* Reopen Modal */}
      {showReopenModal && selectedReq && (
        <CommonModal
          open={showReopenModal}
          onClose={() => setShowReopenModal(false)}
          title={`Reopen Maintenance Request: #${selectedReq.id}`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowReopenModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="reopen-form"
                variant="danger"
                size="md"
              >
                Confirm Reopen
              </CommonButton>
            </>
          }
        >
          <form id="reopen-form" onSubmit={handleConfirmReopen} className="space-y-4">
            <CommonInput
              label="Mandatory Reopen Reason"
              required
              multiline
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Explain why the repair was not satisfactory..."
            />
          </form>
        </CommonModal>
      )}
    </div>
  )
}
