import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import CommonButton from './CommonButton'
import CommonModal from './CommonModal'

export default function CommonConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}) {
  const Icon = tone === 'danger' ? AlertTriangle : CheckCircle2
  return (
    <CommonModal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <CommonButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </CommonButton>
          <CommonButton variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} disabled={confirmDisabled}>
            {confirmLabel}
          </CommonButton>
        </>
      }
    >
      <div className="flex gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-error-soft text-error' : 'bg-primary-soft text-primary'}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          {message && <p className="text-sm text-text-secondary">{message}</p>}
          {children}
        </div>
      </div>
    </CommonModal>
  )
}
