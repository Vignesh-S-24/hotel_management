import { useEffect, useState } from 'react'

// Mimics network latency so loading states are visible in the mock app.
export function useSimulatedLoading(delay = 350) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(id)
  }, [delay])
  return loading
}
