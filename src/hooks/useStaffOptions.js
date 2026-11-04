import { useMemo } from 'react'
import { useData } from '../context/DataContext'

const AVAIL = { on_duty: '', unavailable: ' (unavailable)', on_leave: ' (on leave)' }

// Select options for housekeepers (with workload) and inspectors.
export function useStaffOptions() {
  const { staff, tasks } = useData()
  return useMemo(() => {
    const load = (id) => tasks.filter((t) => t.assigneeId === id && ['assigned', 'in_progress'].includes(t.status)).length
    const activeStaff = staff.filter((s) => s.active)
    const toOption = (s, extra = '') => ({ value: s.id, label: `${s.name}${extra}${AVAIL[s.availability]}`, disabled: s.availability !== 'on_duty' })
    return {
      housekeepers: activeStaff.filter((s) => s.role === 'housekeeper').map((s) => toOption(s, ` · ${load(s.id)} active`)),
      inspectors: activeStaff.filter((s) => ['receptionist', 'super_admin'].includes(s.role)).map((s) => toOption(s)),
      technicians: activeStaff.filter((s) => ['maintenance', 'super_admin'].includes(s.role)).map((s) => toOption(s)),
      allHousekeepers: staff.filter((s) => s.role === 'housekeeper').map((s) => ({ value: s.id, label: s.name })),
    }
  }, [staff, tasks])
}
