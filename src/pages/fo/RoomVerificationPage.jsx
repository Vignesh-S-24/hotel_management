import { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertOctagon,
  BedDouble,
  UserCheck,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { ROOM_STATUS } from '../../utils/constants'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonTable from '../../components/common/CommonTable'
import CommonInput from '../../components/common/CommonInput'
import { useToast } from '../../components/common/CommonToast'

export default function RoomVerificationPage() {
  const { user } = useAuth()
  const { rooms, verifyRoomCleaning } = useData()
  const toast = useToast()

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Rooms waiting for FO inspection (Section 6 & 19)
  const pendingInspectionRooms = (rooms || []).filter(
    (r) => r.status === ROOM_STATUS.INSPECTION_PENDING
  )

  const otherRooms = (rooms || []).filter(
    (r) => r.status !== ROOM_STATUS.INSPECTION_PENDING
  )

  const handleApprove = (room) => {
    verifyRoomCleaning(room.id, true, `Approved by FO ${user?.name || 'Ananya'}. Room ready for check-in.`)
    toast.success('Room Verified READY', `Room ${room.number} is now AVAILABLE for guest occupancy!`)
  }

  const handleOpenReject = (room) => {
    setSelectedRoom(room)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = (e) => {
    e.preventDefault()
    if (!selectedRoom || !rejectionReason.trim()) {
      toast.error('Rejection Reason Mandatory', 'Please provide detailed defect notes for the HK team.')
      return
    }

    verifyRoomCleaning(selectedRoom.id, false, rejectionReason)
    toast.warning('Reclean Requested', `Room ${selectedRoom.number} marked as RE_CLEANING_REQUIRED. HK notified.`)
    setRejectModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Front Office Room Cleaning Verification
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Level-2 room inspection: Physical audit of cleaned suites before marking READY for guest check-in.
          </p>
        </div>
      </div>

      {/* Verification Queue (INSPECTION_PENDING) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Verification Queue ({pendingInspectionRooms.length} Pending Approval)
          </h2>
          <CommonBadge tone={pendingInspectionRooms.length > 0 ? 'warning' : 'success'}>
            {pendingInspectionRooms.length > 0 ? 'Action Required' : 'All Rooms Verified'}
          </CommonBadge>
        </div>

        {pendingInspectionRooms.length === 0 ? (
          <div className="bg-surface rounded-lg border border-dashed border-border p-8 text-center text-xs text-text-secondary">
            No rooms currently pending FO physical inspection. All completed rooms are verified and ready.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInspectionRooms.map((room) => (
              <div
                key={room.id}
                className="bg-surface rounded-xl border border-primary/30 shadow-md p-4 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-primary">Inspection Pending</span>
                    <h3 className="text-lg font-black text-text-primary">
                      Room {room.number} · {room.type}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Cleaned by: <strong className="text-text-primary">{room.assignedHkName || 'Murugan Velu'}</strong>
                    </p>
                  </div>
                  <CommonBadge tone="violet" dot>Level 2 Verification</CommonBadge>
                </div>

                {/* Proof Photos */}
                <div>
                  <span className="text-[11px] font-semibold text-text-secondary block mb-1">
                    Housekeeper Photo Proof:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {(room.cleaningPhotos && room.cleaningPhotos.length > 0
                      ? room.cleaningPhotos
                      : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500']
                    ).map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Cleaning proof"
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                </div>

                {room.cleaningRemarks && (
                  <p className="text-xs text-text-secondary bg-surface-muted p-2 rounded italic">
                    "{room.cleaningRemarks}"
                  </p>
                )}

                {/* Approval & Rejection Actions (Section 19: FO Responsibility) */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <CommonButton
                    onClick={() => handleApprove(room)}
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    className="flex-1"
                  >
                    Approve Room (READY)
                  </CommonButton>

                  <CommonButton
                    onClick={() => handleOpenReject(room)}
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    className="flex-1"
                  >
                    Reject (Reclean)
                  </CommonButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reclean & Other Room Status Board with CommonTable */}
      <div className="mt-6">
        <CommonTable
          columns={[
            {
              key: 'number',
              header: 'Room',
              primary: true,
              render: (r) => <span className="font-bold text-text-primary">Room {r.number}</span>,
            },
            {
              key: 'type',
              header: 'Type & Floor',
              render: (r) => `${r.type} · Floor ${r.floor}`,
            },
            {
              key: 'status',
              header: 'Current Status',
              render: (r) => (
                <CommonBadge
                  tone={
                    r.status === ROOM_STATUS.READY || r.status === ROOM_STATUS.AVAILABLE
                      ? 'success'
                      : r.status === ROOM_STATUS.RE_CLEANING_REQUIRED
                      ? 'error'
                      : r.status === ROOM_STATUS.INSPECTION_PENDING
                      ? 'violet'
                      : 'neutral'
                  }
                >
                  {r.status.toUpperCase()}
                </CommonBadge>
              ),
            },
            {
              key: 'assignedHkName',
              header: 'Assigned HK',
              render: (r) => r.assignedHkName || '—',
            },
            {
              key: 'verificationRemarks',
              header: 'Verification Notes',
              render: (r) => <span className="italic">{r.verificationRemarks || '—'}</span>,
            },
          ]}
          rows={rooms || []}
        />
      </div>

      {/* Rejection Modal with Mandatory Reason */}
      {rejectModalOpen && selectedRoom && (
        <CommonModal
          open={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Cleaning: Room ${selectedRoom.number}`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="reject-room-form"
                variant="danger"
                size="md"
              >
                Confirm Rejection & Dispatch Re-cleaning
              </CommonButton>
            </>
          }
        >
          <form id="reject-room-form" onSubmit={handleConfirmReject} className="space-y-4">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
              <p className="font-bold">Rejection Rule (Section 19):</p>
              <p>Rejection reason is mandatory. Room status will automatically transition to <strong>RE_CLEANING_REQUIRED</strong> and a rework task will be created for the assigned housekeeper.</p>
            </div>

            <CommonInput
              label="Mandatory Rejection Reason & Inspection Defect Notes"
              required
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Water marks on bathroom mirror, towel set missing from rack, under-bed dust found..."
            />
          </form>
        </CommonModal>
      )}
    </div>
  )
}
