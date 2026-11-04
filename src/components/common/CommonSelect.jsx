import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { FieldWrapper } from './CommonInput'

const CommonSelect = forwardRef(function CommonSelect(
  { label, error, hint, required, options = [], placeholder, className = '', selectClassName = '', id: idProp, ...props },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`field-control appearance-none pr-9 ${selectClassName}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
      </div>
    </FieldWrapper>
  )
})

export default CommonSelect
