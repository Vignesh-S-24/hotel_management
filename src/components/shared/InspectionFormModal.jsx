import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { DEFECT_OPTIONS } from '../../utils/constants'
import CommonButton from '../common/CommonButton'
import CommonInput from '../common/CommonInput'
import CommonModal from '../common/CommonModal'
import { useToast } from '../common/CommonToast'

const schema = yup.object({
  result: yup.string().oneOf(['passed', 'failed']).required('Choose Approve or Reject'),
  defects: yup.array().of(yup.string()).when('result', { is: 'failed', then: (s) => s.min(1, 'Flag at least one issue') }),
  remarks: yup.string().trim().max(400).when('result', { is: 'failed', then: (s) => s.required('Rejection reason is required') }),
  correctiveAction: yup.string().trim().max(300),
})

// APK: "Review inspection" — approve, or reject with flagged items that
// reopen for the housekeeper. Used by Super Admin and Reception.
export default function InspectionFormModal({ inspection, onClose }) {
  const { recordInspection, roomLabel, staffName, tasks } = useData()
  const toast = useToast()
  const task = tasks.find((t) => t.id === inspection?.taskId)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { result: '', defects: [], remarks: '', correctiveAction: '' } })

  useEffect(() => reset({ result: '', defects: [], remarks: '', correctiveAction: '' }), [inspection, reset])

  if (!inspection) return null
  const result = watch('result')
  const label = roomLabel(inspection.roomId)

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 300))
    recordInspection(inspection.id, {
      ...v,
      correctiveAction: v.correctiveAction || (v.result === 'failed' ? `Fix flagged items: ${v.defects.join(', ')}` : ''),
    })
    if (v.result === 'passed') toast.success('Inspection approved', `${label} is ready to use.`)
    else toast.warning('Inspection rejected', `${label} sent back to ${staffName(task?.assigneeId)}.`)
    onClose()
  }

  const choice = (value, Icon, text, active) => (
    <button
      type="button"
      onClick={() => setValue('result', value, { shouldValidate: true })}
      aria-pressed={result === value}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition ${result === value ? active : 'border-border text-text-secondary hover:bg-surface-muted'}`}
    >
      <Icon className="h-5 w-5" aria-hidden /> {text}
    </button>
  )

  return (
    <CommonModal
      open
      onClose={onClose}
      title={`Inspect ${label}`}
      description={`Cleaned by ${staffName(task?.assigneeId)}${task?.attempts > 1 ? ` · attempt ${task.attempts}` : ''}`}
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="inspection-form" loading={isSubmitting} variant={result === 'failed' ? 'danger' : 'primary'}>
            {result === 'failed' ? 'Reject & send back' : 'Save result'}
          </CommonButton>
        </>
      }
    >
      <form id="inspection-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-text-primary">Result</p>
          <div className="flex gap-2">
            {choice('passed', CheckCircle2, 'Approve', 'border-success bg-success-soft text-success')}
            {choice('failed', XCircle, 'Reject', 'border-error bg-error-soft text-error')}
          </div>
          {errors.result && <p className="mt-1 text-xs text-error">{errors.result.message}</p>}
        </div>
        {result === 'failed' && (
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-text-primary">Fix these items</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEFECT_OPTIONS.map((d) => (
                <label key={d} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted">
                  <input type="checkbox" value={d} className="h-4 w-4 rounded text-error focus:ring-error" {...register('defects')} />
                  {d}
                </label>
              ))}
            </div>
            {errors.defects && <p className="mt-1 text-xs text-error">{errors.defects.message}</p>}
          </fieldset>
        )}
        <CommonInput
          label={result === 'failed' ? 'Comment for housekeeper' : 'Remarks'}
          required={result === 'failed'}
          multiline
          rows={3}
          placeholder={result === 'failed' ? 'e.g. Bathroom mirror and floor need additional cleaning.' : 'Optional'}
          error={errors.remarks?.message}
          {...register('remarks')}
        />
        {result === 'failed' && <CommonInput label="Corrective action" placeholder="Defaults to the flagged items" error={errors.correctiveAction?.message} {...register('correctiveAction')} />}
      </form>
    </CommonModal>
  )
}
