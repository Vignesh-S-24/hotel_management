import { Outlet } from 'react-router-dom'
import { Hotel, ClipboardCheck, Sparkles, Shirt } from 'lucide-react'
import { HOTEL_NAME } from '../utils/constants'

const points = [
  {
    icon: Sparkles,
    title: 'Daily Floor Walk Inspections',
    desc: 'Morning and evening inspections with photo records.',
  },
  {
    icon: ClipboardCheck,
    title: 'Supervisor & FO Verification',
    desc: 'Strict accountability before marking rooms Ready to Use.',
  },
  {
    icon: Shirt,
    title: 'End-to-End Laundry Tracking',
    desc: 'Track dirty, dispatched, and returned fresh stock.',
  },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Brand Sidebar on Desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
              <Hotel className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{HOTEL_NAME}</h2>
              <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                Central Task Management
              </span>
            </div>
          </div>

          <h3 className="text-3xl font-black leading-tight max-w-md mb-6">
            Complete Operations & Housekeeping Excellence.
          </h3>
          <p className="text-sm text-white/80 max-w-md mb-12">
            Connecting Owner, Supervisors, Front Office and Housekeeping into a unified operational workflow.
          </p>

          <div className="space-y-6 max-w-md">
            {points.map((p, i) => {
              const Icon = p.icon
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-white/70 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-xs text-white/50 relative z-10 pt-8 border-t border-white/10">
          &copy; {new Date().getFullYear()} {HOTEL_NAME}. All rights reserved.
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Outlet />
      </div>
    </div>
  )
}
