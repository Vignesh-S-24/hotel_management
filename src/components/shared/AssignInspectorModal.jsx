import { useEffect, useState } from 'react'
import { useData } from '../../context/DataContext'
import { useStaffOptions } from '../../hooks/useStaffOptions'
import CommonButton from '../common/CommonButton'
import CommonModal from '../common/CommonModal'
import CommonSelect from '../common/CommonSelect'
import { useToast } from '../common/CommonToast'

// APK: "Reassign inspector" / "Hand over inspection".
export default function AssignInspectorModal({ inspection, onClose, title = 'Reassign inspector' }) {
  const { assignInspector, roomLabel, staffName } = useData()
  const { inspectors } = useStaffOptions()
  const toast = useToast()
  const [staffId, setStaffId] = useState('')

  useEffect(() => setStaffId(''), [inspection])
  if (!inspection) return null

  const options = inspectors.filter((o) => o.value !== inspection.inspectorId)

  return (
    <CommonModal
      open
      onClose={onClose}
      size="sm"
      title={`${title} · ${roomLabel(inspection.roomId)}`}
      description={`Current inspector: ${staffName(inspection.inspectorId)}`}
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton
            disabled={!staffId}
            onClick={() => {
              assignInspector(inspection.id, staffId)
              toast.success('Inspection reassigned', `${staffName(staffId)} will inspect ${roomLabel(inspection.roomId)}.`)
              onClose()
            }}
          >
            Assign
          </CommonButton>
        </>
      }
    >
      <CommonSelect label="Choose who will inspect" placeholder="Select inspector" options={options} value={staffId} onChange={(e) => setStaffId(e.target.value)} data-autofocus />
    </CommonModal>
  )
}
