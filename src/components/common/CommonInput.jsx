import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function FieldWrapper({ id, label, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>
      )}
    </div>
  )
}

const CommonInput = forwardRef(function CommonInput(
  { label, error, hint, required, multiline = false, rows = 3, icon: Icon, type = 'text', className = '', id: idProp, ...props },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const control = [
    'field-control',
    Icon ? 'pl-9' : '',
    isPassword ? 'pr-10' : '',
  ].join(' ')
  const aria = { 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? `${id}-error` : undefined }

  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />}
        {multiline ? (
          <textarea ref={ref} id={id} rows={rows} className={`${control} resize-y`} {...aria} {...props} />
        ) : (
          <input ref={ref} id={id} type={isPassword && show ? 'text' : type} className={control} {...aria} {...props} />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-secondary hover:text-text-primary"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </FieldWrapper>
  )
})

export default CommonInput
