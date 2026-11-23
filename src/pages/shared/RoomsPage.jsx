import { useState } from 'react'
import {
  BedDouble,
  Sparkles,
  Upload,
  UserCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import {
  CLEANING_TYPES,
  CLEANING_TYPE_LABELS,
  ROLES,
  ROOM_STATUS,
  ROOM_STATUS_LABELS,
} from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonSelect from '../../components/common/CommonSelect'

export default function RoomsPage() {
  const { user, users } = useAuth()
  const {
    rooms,
    assignRoomCleaning,
    updateRoomCleaningStatus,
    submitRoomCleaning,
    verifyRoomCleaning,
    guestCheckout,
    markRoomOccupied,
  } = useData()
  const toast = useToast()

  const [filterFloor, setFilterFloor] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modals state
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState(null)
  const [assignedHk, setAssignedHk] = useState('')
  const [selectedCleaningType, setSelectedCleaningType] = useState(CLEANING_TYPES.FULL_CLEANING)

  // Cleaning submission modal
  const [selectedRoomForClean, setSelectedRoomForClean] = useState(null)
  const [cleanRemarks, setCleanRemarks] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoList, setPhotoList] = useState([])

  // FO Verification modal
  const [selectedRoomForVerify, setSelectedRoomForVerify] = useState(null)
  const [verifyRemarks, setVerifyRemarks] = useState('')

  const isSupervisorOrOwner = user.role === ROLES.SUPERVISOR || user.role === ROLES.OWNER
  const isFO = user.role === ROLES.FO || isSupervisorOrOwner
  const isHK = user.role === ROLES.HK

  const hkStaffList = users.filter((u) => u.role === ROLES.HK)

  const filteredRooms = rooms.filter((r) => {
    if (filterFloor !== 'all' && r.floor !== Number(filterFloor)) return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    return true
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case ROOM_STATUS.OCCUPIED:
        return <CommonBadge tone="neutral">Occupied</CommonBadge>
      case ROOM_STATUS.CHECKOUT_PENDING:
        return <CommonBadge tone="warning">Checkout Pending</CommonBadge>
      case ROOM_STATUS.CLEANING_PENDING:
        return <CommonBadge tone="error">Cleaning Pending</CommonBadge>
      case ROOM_STATUS.CLEANING_IN_PROGRESS:
        return <CommonBadge tone="info">Cleaning In Progress</CommonBadge>
      case ROOM_STATUS.VERIFICATION_PENDING:
        return <CommonBadge tone="violet" dot className="">Verification Pending</CommonBadge>
      case ROOM_STATUS.RECLEAN_REQUIRED:
        return <CommonBadge tone="warning">Reclean Required</CommonBadge>
      case ROOM_STATUS.READY:
        return <CommonBadge tone="success">Ready</CommonBadge>
      default:
        return <CommonBadge tone="neutral">{status}</CommonBadge>
    }
  }

  const handleAssign = (e) => {
    e.preventDefault()
    if (!selectedRoomForAssign || !assignedHk) {
      toast.error('Select Housekeeping staff')
      return
    }
    assignRoomCleaning(selectedRoomForAssign.id, assignedHk, selectedCleaningType)
    toast.success(`Room ${selectedRoomForAssign.number} Assigned`, `Cleaning type: ${CLEANING_TYPE_LABELS[selectedCleaningType]}`)
    setSelectedRoomForAssign(null)
    setAssignedHk('')
  }

  const handleAddSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500',
    ]
    setPhotoList([...photoList, samples[Math.floor(Math.random() * samples.length)]])
  }

  const handleSubmitCleaning = (e) => {
    e.preventDefault()
    if (photoList.length === 0) {
      toast.error('Cleaning Proof Photo Required', 'Housekeeping must upload cleaning photos before submission.')
      return
    }
    submitRoomCleaning(selectedRoomForClean.id, {
      photos: photoList,
      remarks: cleanRemarks,
    })
    toast.success(`Room ${selectedRoomForClean.number} Submitted`, 'Submitted for Front Office verification.')
    setSelectedRoomForClean(null)
    setPhotoList([])
    setCleanRemarks('')
  }

  const handleVerify = (isApproved) => {
    verifyRoomCleaning(selectedRoomForVerify.id, isApproved, verifyRemarks)
    toast.info(isApproved ? `Room ${selectedRoomForVerify.number} marked READY` : `Room ${selectedRoomForVerify.number} sent for recleaning`)
    setSelectedRoomForVerify(null)
    setVerifyRemarks('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <BedDouble className="w-7 h-7 text-primary" />
            Room & Housekeeping Management
          </h1>
          <p className="text-sm text-text-muted">
            Guest Checkout → Room Cleaning Assignment → HK Cleaning → FO Verification → Room Ready.
          </p>
        </div>

        {/* Cleaning types indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-surface-muted p-2 rounded-xl border border-border text-xs">
          <span className="font-semibold text-text-primary">Cleaning Types:</span>
          <CommonBadge tone="info">Full Cleaning</CommonBadge>
          <CommonBadge tone="warning">Floor Cleaning</CommonBadge>
          <CommonBadge tone="violet">Full Change</CommonBadge>
        </div>
      </div>

      {/* Filter Toolbar with CommonSelect */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <CommonSelect
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            options={[
              { value: 'all', label: 'All Floors' },
              { value: '1', label: '1st Floor' },
              { value: '2', label: '2nd Floor' },
              { value: '3', label: '3rd Floor' },
              { value: '4', label: '4th Floor' },
            ]}
            className="w-32"
            selectClassName="py-1.5 text-xs"
          />

          <CommonSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Room Statuses' },
              ...Object.entries(ROOM_STATUS).map(([k, val]) => ({
                value: val,
                label: ROOM_STATUS_LABELS[val],
              })),
            ]}
            className="w-48"
            selectClassName="py-1.5 text-xs"
          />
        </div>

        <div className="text-xs text-text-secondary">
          Showing <strong className="text-text-primary">{filteredRooms.length}</strong> rooms
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isAssignedToMe = room.assignedHkId === user.staffId
          const assignedStaff = users.find((u) => u.staffId === room.assignedHkId)

          return (
            <div
              key={room.id}
              className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-text-primary">
                      Room {room.number}
                    </span>
                    <span className="text-[10px] text-text-secondary bg-surface-muted px-2 py-0.5 rounded border border-border">
                      Fl {room.floor}
                    </span>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                <div className="text-xs text-text-secondary mb-3 font-medium">
                  {room.type} • {CLEANING_TYPE_LABELS[room.cleaningType] || 'Full Cleaning'}
                </div>

                {/* Workflow Status Box */}
                <div className="bg-surface-muted p-3 rounded-xl border border-border space-y-1.5 text-xs text-text-secondary mb-3">
                  <div className="flex items-center justify-between">
                    <span>Housekeeper:</span>
                    <strong className="text-text-primary">
                      {assignedStaff ? assignedStaff.name : 'Unassigned'}
                    </strong>
                  </div>

                  {room.cleaningRemarks && (
                    <div className="pt-1 text-[11px] italic">
                      <span className="font-semibold text-text-primary not-italic">HK Note: </span>
                      "{room.cleaningRemarks}"
                    </div>
                  )}

                  {room.verificationRemarks && (
                    <div className="pt-1 text-[11px] text-violet dark:text-violet-soft">
                      <span className="font-semibold not-italic">FO Note: </span>
                      "{room.verificationRemarks}"
                    </div>
                  )}
                </div>

                {/* Photos thumbnail preview */}
                {room.cleaningPhotos && room.cleaningPhotos.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">
                      Submitted Photos ({room.cleaningPhotos.length})
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {room.cleaningPhotos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Cleaning proof"
                          className="w-12 h-12 rounded-lg object-cover border border-border shrink-0 cursor-pointer hover:opacity-90"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons based on Role & Room Status */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {/* 1. Checkout (FO / Supervisor) */}
                {isFO && room.status === ROOM_STATUS.OCCUPIED && (
                  <CommonButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="text-amber-800 bg-amber-50 hover:bg-amber-100"
                    onClick={() => guestCheckout(room.id)}
                  >
                    Guest Checkout → Clean
                  </CommonButton>
                )}

                {/* 2. Assign Cleaning (Supervisor/Owner) */}
                {isSupervisorOrOwner &&
                  (room.status === ROOM_STATUS.CLEANING_PENDING || room.status === ROOM_STATUS.CHECKOUT_PENDING) && (
                    <CommonButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedRoomForAssign(room)
                        setSelectedCleaningType(room.cleaningType || CLEANING_TYPES.FULL_CLEANING)
                      }}
                    >
                      Assign HK Staff
                    </CommonButton>
                  )}

                {/* 3. HK Start Cleaning */}
                {(isAssignedToMe || isSupervisorOrOwner) &&
                  (room.status === ROOM_STATUS.CLEANING_PENDING || room.status === ROOM_STATUS.RECLEAN_REQUIRED) && (
                    <CommonButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => updateRoomCleaningStatus(room.id, ROOM_STATUS.CLEANING_IN_PROGRESS)}
                    >
                      Start Cleaning
                    </CommonButton>
                  )}

                {/* 4. HK Submit Cleaning with Photos */}
                {(isAssignedToMe || isSupervisorOrOwner) &&
                  room.status === ROOM_STATUS.CLEANING_IN_PROGRESS && (
                    <CommonButton
                      variant="success"
                      size="sm"
                      fullWidth
                      icon={Upload}
                      onClick={() => {
                        setSelectedRoomForClean(room)
                        setPhotoList([])
                        setCleanRemarks('')
                      }}
                    >
                      Submit Cleaning Proof
                    </CommonButton>
                  )}

                {/* 5. FO Verification (Approve / Reject) */}
                {isFO && room.status === ROOM_STATUS.VERIFICATION_PENDING && (
                  <CommonButton
                    variant="soft"
                    size="sm"
                    fullWidth
                    icon={UserCheck}
                    className="bg-violet-soft text-violet hover:bg-violet/15 font-semibold"
                    onClick={() => {
                      setSelectedRoomForVerify(room)
                      setVerifyRemarks('')
                    }}
                  >
                    Verify Room
                  </CommonButton>
                )}

                {/* 6. Mark Ready room as Occupied (FO) */}
                {isFO && room.status === ROOM_STATUS.READY && (
                  <CommonButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => markRoomOccupied(room.id)}
                  >
                    Check In Guest (Occupied)
                  </CommonButton>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Assign Housekeeper with CommonModal */}
      <CommonModal
        open={Boolean(selectedRoomForAssign)}
        onClose={() => setSelectedRoomForAssign(null)}
        title={`Assign Cleaning: Room ${selectedRoomForAssign?.number}`}
        description={`${selectedRoomForAssign?.type} • Floor ${selectedRoomForAssign?.floor}`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <CommonSelect
            label="Cleaning Activity Type"
            required
            value={selectedCleaningType}
            onChange={(e) => setSelectedCleaningType(e.target.value)}
            options={[
              { value: CLEANING_TYPES.FULL_CLEANING, label: 'Full Cleaning (Complete bedding, towels, amenities & bathroom)' },
              { value: CLEANING_TYPES.FLOOR_CLEANING, label: 'Floor Cleaning (Sweep, mop, dusting)' },
              { value: CLEANING_TYPES.FULL_CHANGE, label: 'Full Change (Bedding & Linen change only)' },
            ]}
          />

          <CommonSelect
            label="Select Housekeeping Staff"
            required
            value={assignedHk}
            onChange={(e) => setAssignedHk(e.target.value)}
            placeholder="Choose Staff..."
            options={hkStaffList.map((hk) => ({
              value: hk.staffId,
              label: `${hk.name} (${hk.employeeId})`,
            }))}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setSelectedRoomForAssign(null)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
            >
              Confirm Assignment
            </CommonButton>
          </div>
        </form>
      </CommonModal>

      {/* Modal: HK Submit Cleaning with CommonModal */}
      <CommonModal
        open={Boolean(selectedRoomForClean)}
        onClose={() => setSelectedRoomForClean(null)}
        title={`Complete Room ${selectedRoomForClean?.number} Cleaning`}
        description={`Type: ${CLEANING_TYPE_LABELS[selectedRoomForClean?.cleaningType]}`}
      >
        <form onSubmit={handleSubmitCleaning} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Housekeeping Remarks
            </label>
            <textarea
              rows={2}
              value={cleanRemarks}
              onChange={(e) => setCleanRemarks(e.target.value)}
              placeholder="Linens replaced, bathroom descaled, tea amenities refilled..."
              className="field-control"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                Cleaning Photos <span className="text-error">* (Mandatory for FO)</span>
              </label>
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="text-xs text-primary hover:underline font-medium"
              >
                + Add Sample Room Photo
              </button>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste image link..."
                className="field-control flex-1"
              />
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => {
                  if (photoUrl.trim()) {
                    setPhotoList([...photoList, photoUrl.trim()])
                    setPhotoUrl('')
                  }
                }}
              >
                Add
              </CommonButton>
            </div>

            {photoList.length > 0 && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-surface-muted rounded-xl border border-border">
                {photoList.map((url, i) => (
                  <div key={i} className="relative shrink-0">
                    <img src={url} alt="Proof" className="w-16 h-16 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setPhotoList(photoList.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setSelectedRoomForClean(null)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="success"
            >
              Submit for FO Verification
            </CommonButton>
          </div>
        </form>
      </CommonModal>

      {/* Modal: FO Verification with CommonModal */}
      <CommonModal
        open={Boolean(selectedRoomForVerify)}
        onClose={() => setSelectedRoomForVerify(null)}
        title={`Verify Room ${selectedRoomForVerify?.number}`}
        description="Front Office Quality & Cleanliness Inspection"
      >
        <div className="space-y-4">
          <div className="bg-surface-muted p-3.5 rounded-xl border border-border text-xs space-y-2">
            <div><span className="font-semibold text-text-primary">Cleaning Remarks:</span> {selectedRoomForVerify?.cleaningRemarks || 'None'}</div>
            {selectedRoomForVerify?.cleaningPhotos?.length > 0 && (
              <div>
                <span className="font-semibold block mb-1.5 text-text-primary">Attached Cleaning Photos:</span>
                <div className="flex gap-2 overflow-x-auto">
                  {selectedRoomForVerify.cleaningPhotos.map((p, idx) => (
                    <img key={idx} src={p} alt="Inspection" className="w-16 h-16 object-cover rounded-lg border border-border cursor-pointer" onClick={() => window.open(p, '_blank')} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              FO Verification Remarks
            </label>
            <textarea
              rows={2}
              value={verifyRemarks}
              onChange={(e) => setVerifyRemarks(e.target.value)}
              placeholder="Passed inspection, amenities complete, room fresh..."
              className="field-control"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setSelectedRoomForVerify(null)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              variant="danger"
              icon={XCircle}
              onClick={() => handleVerify(false)}
            >
              Reclean Required
            </CommonButton>
            <CommonButton
              variant="success"
              icon={CheckCircle2}
              onClick={() => handleVerify(true)}
            >
              Approve & Mark READY
            </CommonButton>
          </div>
        </div>
      </CommonModal>
    </div>
  )
}
