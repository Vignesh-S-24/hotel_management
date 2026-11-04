import { Moon, Sun } from 'lucide-react'
import CommonCard from '../../../components/common/CommonCard'
import { useToast } from '../../../components/common/CommonToast'
import { Avatar } from '../../../components/layout/HeaderShell'
import DetailList from '../../../components/shared/DetailList'
import PageHeader from '../../../components/shared/PageHeader'
import { ChangePasswordForm, ProfileForm, ToggleRow } from '../../../components/shared/ProfileForms'
import { AvailabilityBadge } from '../../../components/shared/StatusBadge'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { useTheme } from '../../../context/ThemeContext'
import { formatDate } from '../../../utils/formatDate'

const DEFAULT_PREFS = { roomReady: true, requestUpdates: true, repairUpdates: true }

export default function Profile() {
  const { user } = useAuth()
  const { staffById, myPreferences, updatePreferences } = useData()
  const { mode, toggle } = useTheme()
  const toast = useToast()
  const me = staffById[user.staffId]
  const prefs = { ...DEFAULT_PREFS, ...myPreferences }

  const set = (key) => (value) => {
    updatePreferences({ [key]: value })
    toast.success('Preferences saved')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your account details and demo preferences." />
      <CommonCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={user.name} size="h-14 w-14" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-text-primary">{user.name}</p>
            <p className="text-sm text-text-secondary">
              {user.title} · {user.employeeId}
            </p>
          </div>
          {me && (
            <span className="self-start sm:self-auto">
              <AvailabilityBadge value={me.availability} />
            </span>
          )}
        </div>
        {me && (
          <div className="mt-4 border-t border-border pt-4">
            <DetailList
              items={[
                ['Shift', me.shift],
                ['Joined', formatDate(me.joinedAt)],
                ['Panel', 'Client (Reception)'],
              ]}
              cols={2}
            />
          </div>
        )}
      </CommonCard>
      <CommonCard title="Edit Profile">
        <ProfileForm />
      </CommonCard>
      <CommonCard title="Preferences" subtitle="Turning a type off hides it from your notification centre. Stored per user in this browser.">
        <div className="divide-y divide-border">
          <ToggleRow label="Room ready alerts" description="Notify me when a room passes inspection" checked={prefs.roomReady} onChange={set('roomReady')} />
          <ToggleRow label="Request updates" description="Housekeeper assigned or request completed" checked={prefs.requestUpdates} onChange={set('requestUpdates')} />
          <ToggleRow label="Repair updates" description="Progress on issues I reported" checked={prefs.repairUpdates} onChange={set('repairUpdates')} />
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Appearance</p>
              <p className="text-xs text-text-secondary">Currently {mode} mode</p>
            </div>
            <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface-muted">
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {mode === 'dark' ? 'light' : 'dark'}
            </button>
          </div>
        </div>
      </CommonCard>
      <CommonCard title="Change Password">
        <ChangePasswordForm />
      </CommonCard>
    </div>
  )
}
