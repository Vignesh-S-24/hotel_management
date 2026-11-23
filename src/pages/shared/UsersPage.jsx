import { useState } from 'react'
import { Users, Shield, Plus, Mail, Phone, BadgeCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, ROLES } from '../../utils/constants'

export default function UsersPage() {
  const { users } = useAuth()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            Employees & User Roles
          </h1>
          <p className="text-sm text-text-muted">
            The 4 operational tiers: Owner (Super Admin), Supervisor (Admin), FO (Front Office), and HK (Housekeeping).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div key={u.id} className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                <div>
                  <h3 className="font-bold text-sm text-text">{u.name}</h3>
                  <span className="text-[11px] text-text-muted">{u.title}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                {u.role}
              </span>
            </div>

            <div className="bg-surface-subtle p-3 rounded-xl border border-border space-y-1.5 text-xs text-text-muted">
              <div><strong>Employee ID:</strong> {u.employeeId}</div>
              <div><strong>Department:</strong> {u.department}</div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {u.email}</div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {u.phone}</div>
            </div>

            <div className="text-[11px] font-semibold text-text flex items-center gap-1">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              Role: {ROLE_LABELS[u.role]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
