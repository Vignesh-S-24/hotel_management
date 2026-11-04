import CommonDropdown from '../common/CommonDropdown'

export default function FilterBar({ children, className = '' }) {
  return <div className={`flex flex-col gap-2.5 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>{children}</div>
}

export function FilterSelect({ value, onChange, options, label, allLabel = 'All', className = '' }) {
  return (
    <CommonDropdown
      value={value}
      onChange={onChange}
      options={[{ value: 'all', label: allLabel }, ...options]}
      label={label}
      className={`w-full shrink-0 sm:w-auto sm:min-w-[7.5rem] ${className}`}
    />
  )
}
