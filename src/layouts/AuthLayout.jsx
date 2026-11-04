import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Building2, ClipboardCheck, Sparkles, Wrench } from 'lucide-react'
import { APP_NAME, HOTEL_NAME } from '../utils/constants'

const points = [
  [Sparkles, 'Housekeeping from checkout to ready room'],
  [ClipboardCheck, 'Inspections with checklist and corrective actions'],
  [Wrench, 'Repairs, inventory and reports in one place'],
]

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{APP_NAME}</p>
            <p className="text-sm text-white/70">{HOTEL_NAME}</p>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Hotel operations, room by room.</h2>
          <ul className="mt-8 space-y-4">
            {points.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/60">Prototype demo · mock data only · no backend</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-text-primary">{APP_NAME}</p>
              <p className="text-sm text-text-secondary">{HOTEL_NAME}</p>
            </div>
          </div>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
