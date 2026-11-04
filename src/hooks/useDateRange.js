import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatDate, toInputDate } from '../utils/formatDate'

const shift = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toInputDate(d)
}

const monthStart = (offset) => {
  const d = new Date()
  return toInputDate(new Date(d.getFullYear(), d.getMonth() + offset, 1))
}

export const DATE_PRESETS = [
  { value: 'today', label: 'Today', range: () => [shift(0), shift(0)] },
  { value: 'yesterday', label: 'Yesterday', range: () => [shift(-1), shift(-1)] },
  { value: 'last7', label: 'Last 7 days', range: () => [shift(-6), shift(0)] },
  { value: 'last30', label: 'Last 30 days', range: () => [shift(-29), shift(0)] },
  { value: 'thisMonth', label: 'This month', range: () => [monthStart(0), shift(0)] },
  { value: 'lastMonth', label: 'Last month', range: () => [monthStart(-1), toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0))] },
]

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? '')

// Every calendar day between two yyyy-mm-dd dates, inclusive.
export function eachDay(from, to) {
  const days = []
  const d = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  while (d <= end) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Dashboard date filter kept in the URL (?range=last7 or ?range=custom&from=…&to=…)
// so it survives refreshes and back navigation.
export function useDateRange(defaultPreset = 'last7') {
  const [params, setParams] = useSearchParams()
  const key = params.get('range')
  const from = params.get('from')
  const to = params.get('to')

  const range = useMemo(() => {
    if (key === 'custom' && isDate(from) && isDate(to) && from <= to) {
      return { preset: 'custom', from, to, label: from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}` }
    }
    const preset = DATE_PRESETS.find((p) => p.value === key) ?? DATE_PRESETS.find((p) => p.value === defaultPreset)
    const [start, end] = preset.range()
    return { preset: preset.value, from: start, to: end, label: preset.label }
  }, [key, from, to, defaultPreset])

  const setRange = useCallback(
    (next) =>
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('range', next.preset)
          if (next.preset === 'custom') {
            p.set('from', next.from)
            p.set('to', next.to)
          } else {
            p.delete('from')
            p.delete('to')
          }
          return p
        },
        { replace: true },
      ),
    [setParams],
  )

  return [range, setRange]
}
