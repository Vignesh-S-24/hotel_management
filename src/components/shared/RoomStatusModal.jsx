import { useEffect, useState } from 'react'
import { useData } from '../../context/DataContext'
import { ROOM_STATUS_OPTIONS } from '../../utils/constants'
import CommonButton from '../common/CommonButton'
import CommonInput from '../common/CommonInput'
import CommonModal from '../common/CommonModal'
import CommonSelect from '../common/CommonSelect'
import { useToast } from '../common/CommonToast'
import { RoomStatusBadge } from './StatusBadge'

// Admin override of a room's status (APK: "Change status" with a reason).
export default function RoomStatusModal({ room, onClose }) {
  const { setRoomStatus } = useData()
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    setStatus(room?.status ?? '')
    setNote('')
  }, [room])

  if (!room) return null

  const save = () => {
    setRoomStatus(room.id, status, note.trim())
    toast.success('Status updated', `Room ${room.number} is now ${ROOM_STATUS_OPTIONS.find((o) => o.value === status).label}.`)
    onClose()
  }

  return (
    <CommonModal
      open
      onClose={onClose}
      title={`Update status · Room ${room.number}`}
      size="sm"
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton onClick={save} disabled={status === room.status}>
            Save status
          </CommonButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          Current status <RoomStatusBadge value={room.status} />
        </div>
        <CommonSelect label="New status" value={status} onChange={(e) => setStatus(e.target.value)} options={ROOM_STATUS_OPTIONS} />
        <CommonInput label="Reason" multiline rows={2} placeholder="Optional, shown in history" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </CommonModal>
  )
}
