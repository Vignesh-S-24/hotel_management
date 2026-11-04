import { startTransition, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { Check, Minus, Repeat, RotateCcw, ShieldHalf, UserRound } from 'lucide-react'
import adminBanner from '../../../assets/banners/admin-panel.jpg'
import receptionBanner from '../../../assets/banners/reception-panel.jpg'
import CommonBadge from '../../../components/common/CommonBadge'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard from '../../../components/common/CommonCard'
import CommonConfirmDialog from '../../../components/common/CommonConfirmDialog'
import CommonInput from '../../../components/common/CommonInput'
import { useToast } from '../../../components/common/CommonToast'
import PageHeader from '../../../components/shared/PageHeader'
import PanelBanner from '../../../components/shared/PanelBanner'
import { ChangePasswordForm, ProfileForm, ToggleRow } from '../../../components/shared/ProfileForms'
import Tabs from '../../../components/shared/Tabs'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { useTheme } from '../../../context/ThemeContext'
import { adminNav, clientNav } from '../../../routes/navigation'
import { ROLE_HOME } from '../../../utils/constants'
import { phoneRules } from '../../../utils/validation'

const generalSchema = yup.object({
  hotelName: yup.string().trim().required('Hotel name required').max(60),
  address: yup.string().trim().required('Address required').max(160),
  phone: phoneRules,
  email: yup.string().trim().required('Email required').email('Enter a valid email'),
  checkInTime: yup.string().required('Check-in time required'),
  checkOutTime: yup.string().required('Check-out time required'),
})

function GeneralSettings() {
  const { settings, updateSettings } = useData()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(generalSchema),
    defaultValues: settings,
  })

  useEffect(() => reset(settings), [settings, reset])

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 300))
    updateSettings(v)
    toast.success('Hotel information saved')
  }

  return (
    <div className="space-y-6">
      <CommonCard title="Hotel Information">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CommonInput label="Hotel name" required error={errors.hotelName?.message} {...register('hotelName')} />
            <CommonInput label="Front desk email" type="email" required error={errors.email?.message} {...register('email')} />
            <CommonInput label="Address" required className="sm:col-span-2" error={errors.address?.message} {...register('address')} />
            <CommonInput label="Phone" type="tel" required error={errors.phone?.message} {...register('phone')} />
            <div className="grid grid-cols-2 gap-4">
              <CommonInput label="Check-in" type="time" error={errors.checkInTime?.message} {...register('checkInTime')} />
              <CommonInput label="Check-out" type="time" error={errors.checkOutTime?.message} {...register('checkOutTime')} />
            </div>
          </div>
          <div className="flex justify-end">
            <CommonButton type="submit" loading={isSubmitting} disabled={!isDirty}>
              Save changes
            </CommonButton>
          </div>
        </form>
      </CommonCard>
      <CommonCard title="Workflow">
        <div className="divide-y divide-border">
          <ToggleRow
            label="Require inspection"
            description="Cleaned rooms must be approved by an inspector before they become Ready to Use."
            checked={settings.requireInspection}
            onChange={(v) => {
              updateSettings({ requireInspection: v })
              toast.success('Setting saved')
            }}
          />
          <ToggleRow
            label="Low stock alerts"
            description="Notify the Super Admin when central stock drops to the minimum."
            checked={settings.lowStockAlerts}
            onChange={(v) => {
              updateSettings({ lowStockAlerts: v })
              toast.success('Setting saved')
            }}
          />
        </div>
      </CommonCard>
    </div>
  )
}

function NotificationSettings() {
  const { settings, updateSettings } = useData()
  const toast = useToast()
  const prefs = settings.notifications
  const set = (key) => (v) => {
    updateSettings({ notifications: { ...prefs, [key]: v } })
    toast.success('Notification Settings saved')
  }
  return (
    <CommonCard title="Notification preferences" subtitle="Demo only — no emails or push messages are sent.">
      <div className="divide-y divide-border">
        <ToggleRow label="Push notifications" description="In-app alerts in the notification centre" checked={prefs.push} onChange={set('push')} />
        <ToggleRow label="Email summaries" checked={prefs.email} onChange={set('email')} />
        <ToggleRow label="Repair alerts" description="New repairs and status changes" checked={prefs.repairs} onChange={set('repairs')} />
        <ToggleRow label="Inventory alerts" description="Low and out-of-stock items" checked={prefs.inventory} onChange={set('inventory')} />
        <ToggleRow label="Inspection results" description="Rejected inspections and corrective actions" checked={prefs.inspections} onChange={set('inspections')} />
        <ToggleRow label="Daily digest" description="One summary at the end of the day" checked={prefs.dailyDigest} onChange={set('dailyDigest')} />
      </div>
    </CommonCard>
  )
}

function DemoSettings() {
  const { switchRole } = useAuth()
  const { resetDemoData } = useData()
  const { resetAccounts } = useAuth()
  const { mode, setMode } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  const navTable = (banner, items) => (
    <div className="space-y-3">
      <PanelBanner {...banner} />
      <CommonCard title="Navigation" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {items.map(({ label, to, icon: Icon, apk, note }) => (
            <li key={to} className="flex items-center gap-3 px-4 py-2.5">
              <Icon className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{label}</p>
                <p className="truncate text-xs text-text-secondary">
                  {to}
                  {note ? ` · ${note}` : ''}
                </p>
              </div>
              <CommonBadge tone={apk ? 'success' : 'warning'}>
                {apk ? <Check className="h-3 w-3" aria-hidden /> : <Minus className="h-3 w-3" aria-hidden />}
                {apk ? 'In APK' : 'Assumption'}
              </CommonBadge>
            </li>
          ))}
        </ul>
      </CommonCard>
    </div>
  )

  return (
    <div className="space-y-6">
      <CommonCard title="Prototype tools">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Switch role</p>
            <p className="text-xs text-text-secondary">Sign in as the demo receptionist to see the Client panel.</p>
          </div>
          <CommonButton
            variant="secondary"
            icon={Repeat}
            onClick={() =>
              // Role change and navigation in one transition; see HeaderShell.handleSwitch.
              startTransition(() => {
                const u = switchRole('client')
                toast.info('Switched to Reception', `Signed in as ${u.name}.`)
                navigate(ROLE_HOME.client)
              })
            }
          >
            Switch to Reception
          </CommonButton>
        </div>
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Appearance</p>
            <p className="text-xs text-text-secondary">Both panels share the same theme tokens.</p>
          </div>
          <div className="inline-flex rounded-lg bg-surface-muted p-1">
            {['light', 'dark'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${mode === m ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Reset demo data</p>
            <p className="text-xs text-text-secondary">Restore all rooms, tasks, inventory and passwords to the original mock data.</p>
          </div>
          <CommonButton variant="danger" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
            Reset demo data
          </CommonButton>
        </div>
      </CommonCard>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {navTable({ icon: ShieldHalf, title: 'Admin Panel', subtitle: 'Manage your hotel operations efficiently', image: adminBanner }, adminNav)}
        {navTable({ icon: UserRound, title: 'Client (Reception) Panel', subtitle: 'View hotel information and manage requests', image: receptionBanner }, clientNav)}
      </div>
      <CommonConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message="Every change made in this browser will be lost. This cannot be undone."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData()
          resetAccounts()
          setConfirmReset(false)
          toast.success('Demo data reset')
        }}
      />
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('profile')
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profile, hotel configuration and prototype options." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'profile', label: 'Admin profile' },
          { value: 'general', label: 'General' },
          { value: 'notifications', label: 'Notifications' },
          { value: 'demo', label: 'Demo & roles' },
        ]}
      />
      {tab === 'profile' && (
        <div className="space-y-6">
          <CommonCard title="Edit Profile">
            <ProfileForm />
          </CommonCard>
          <CommonCard title="Change Password">
            <ChangePasswordForm />
          </CommonCard>
        </div>
      )}
      {tab === 'general' && <GeneralSettings />}
      {tab === 'notifications' && <NotificationSettings />}
      {tab === 'demo' && <DemoSettings />}
    </div>
  )
}
