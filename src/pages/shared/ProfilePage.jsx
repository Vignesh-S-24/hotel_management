import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Save,
  Camera,
  Users,
  BadgeCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, ROLES } from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonInput from '../../components/common/CommonInput'
import CommonBadge from '../../components/common/CommonBadge'

export default function ProfilePage() {
  const { user, users = [] } = useAuth()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'users'
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '+91 98401 23456')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveProfile = (e) => {
    e.preventDefault()
    toast.success('Profile Updated', 'Personal information saved successfully.')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Required Field', 'Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password Too Short', 'New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', 'New password and confirm password do not match.')
      return
    }

    toast.success('Password Changed', 'Your security password has been updated.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Profile Banner */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center text-3xl font-black shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary shadow-sm"
              title="Change profile picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                {user?.name || 'Authorized Staff'}
              </h1>
              <CommonBadge tone="primary" dot>
                {ROLE_LABELS[user?.role] || user?.role?.toUpperCase()}
              </CommonBadge>
            </div>
            <p className="text-xs text-text-secondary flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              Thai Residency – Centralized Hotel Operations
            </p>
            <p className="text-xs text-text-secondary flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Employee ID: <strong className="text-text-primary">{user?.employeeId || user?.staffId || 'TR-EMP-001'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 pt-1 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-[#64748B] hover:text-text-primary hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          My Profile & Security
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 pt-1 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-[#64748B] hover:text-text-primary hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Employees & Roles
          <span
            className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'users'
                ? 'bg-primary/10 text-primary'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {users.length}
          </span>
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Details Form */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </h2>
              <p className="text-xs text-text-secondary">Update your contact information.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <CommonInput
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
              />

              <CommonInput
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <CommonInput
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
              />

              <div className="pt-2">
                <CommonButton type="submit" icon={Save} size="md">
                  Save Changes
                </CommonButton>
              </div>
            </form>
          </div>

          {/* Security & Password */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Change Password
              </h2>
              <p className="text-xs text-text-secondary">Keep your system access credentials safe.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <CommonInput
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />

              <CommonInput
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />

              <CommonInput
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />

              <div className="pt-2">
                <CommonButton type="submit" variant="secondary" icon={Shield} size="md">
                  Update Password
                </CommonButton>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Employees & Roles View */
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Employees & User Roles
            </h2>
            <p className="text-xs text-text-muted">
              The 4 operational tiers: Owner (Super Admin), Supervisor (Admin), FO (Front Office), and HK (Housekeeping).
            </p>
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
      )}
    </div>
  )
}
