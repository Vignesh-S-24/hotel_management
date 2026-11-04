import CommonBadge from '../common/CommonBadge'
import {
  INSPECTION_STATUS,
  MAINTENANCE_STATUS,
  PRIORITIES,
  ROOM_STATUS,
  STAFF_AVAILABILITY,
  TASK_STATUS,
} from '../../utils/constants'

const make = (map) =>
  function EnumBadge({ value }) {
    const entry = map[value]
    if (!entry) return <CommonBadge>{value ?? '—'}</CommonBadge>
    return (
      <CommonBadge tone={entry.tone} dot>
        {entry.label}
      </CommonBadge>
    )
  }

export const RoomStatusBadge = make(ROOM_STATUS)
export const TaskStatusBadge = make(TASK_STATUS)
export const PriorityBadge = make(PRIORITIES)
export const InspectionBadge = make(INSPECTION_STATUS)
export const MaintenanceBadge = make(MAINTENANCE_STATUS)
export const AvailabilityBadge = make(Object.fromEntries(STAFF_AVAILABILITY.map((a) => [a.value, a])))

export function ActiveBadge({ active }) {
  return (
    <CommonBadge tone={active ? 'success' : 'neutral'} dot>
      {active ? 'Active' : 'Inactive'}
    </CommonBadge>
  )
}
