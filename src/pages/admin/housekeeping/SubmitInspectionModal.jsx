import { useEffect, useState } from 'react'
import CommonButton from '../../../components/common/CommonButton'
import CommonModal from '../../../components/common/CommonModal'
import CommonSelect from '../../../components/common/CommonSelect'
import { useToast } from '../../../components/common/CommonToast'
import { useData } from '../../../context/DataContext'
import { useStaffOptions } from '../../../hooks/useStaffOptions'
import { CHECKLIST_ITEMS } from '../../../utils/constants'

// Simulates the housekeeper's "Submit for Inspection" step from the APK:
// required checklist items must be ticked and an inspector chosen.
export default function SubmitInspectionModal({ task, onClose }) {
  const { submitTask, roomLabel, settings } = useData()
  const { inspectors } = useStaffOptions()
  const toast = useToast()
  const [checked, setChecked] = useState([])
  const [inspectorId, setInspectorId] = useState('')
  const [error, setError] = useState('')
  const isRoom = Boolean(task?.roomId)
  const needsInspection = isRoom && settings.requireInspection

  useEffect(() => {
    setChecked(task?.checklist ?? [])
    setInspectorId(inspectors.find((o) => !o.disabled)?.value ?? '')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  if (!task) return null
  const items = isRoom ? CHECKLIST_ITEMS : ['Area swept and mopped', 'Bins emptied', 'Surfaces wiped']
  const allDone = items.every((i) => checked.includes(i))

  const toggle = (item) => setChecked((c) => (c.includes(item) ? c.filter((x) => x !== item) : [...c, item]))

  const submit = () => {
    if (!allDone) return setError('Required items must be ticked before submitting.')
    if (needsInspection && !inspectorId) return setError('Choose who will inspect.')
    submitTask(task.id, inspectorId, checked)
    toast.success(needsInspection ? 'Submitted for inspection' : 'Cleaning completed', roomLabel(task.roomId, task.location))
    onClose()
  }

  return (
    <CommonModal
      open
      onClose={onClose}
      title={`${needsInspection ? 'Submit for inspection' : 'Mark cleaning done'} · ${roomLabel(task.roomId, task.location)}`}
      description="Housekeeper step, simulated from the Admin panel for this demo."
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton onClick={submit}>{needsInspection ? 'Submit for Inspection' : 'Mark done'}</CommonButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-text-primary">Checklist</span>
          <button type="button" className="text-primary hover:text-primary-hover" onClick={() => setChecked(allDone ? [] : items)}>
            {allDone ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item}>
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted">
                <input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} className="h-4 w-4 rounded text-primary focus:ring-primary" />
                {item}
              </label>
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-secondary">
          {checked.length}/{items.length} done
        </p>
        {needsInspection && <CommonSelect label="Inspector" options={inspectors} value={inspectorId} onChange={(e) => setInspectorId(e.target.value)} />}
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </CommonModal>
  )
}
