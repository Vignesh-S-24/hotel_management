import { useState } from 'react'
import {
  Users,
  ShieldAlert,
  Sliders,
  DollarSign,
  TrendingDown,
  Building,
  Save,
  CheckCircle,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonInput from '../../components/common/CommonInput'
import CommonTable from '../../components/common/CommonTable'
import { useToast } from '../../components/common/CommonToast'

export default function OwnerPortal() {
  const { user } = useAuth()
  const {
    standardConsumptions,
    updateStandardConsumption,
    wastageRecords,
    activityLogs,
    rooms,
    stockItems,
  } = useData()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('standard_consumption')
  const [editingId, setEditingId] = useState(null)
  const [val, setVal] = useState('')

  const handleSaveStandard = (id) => {
    if (!val || isNaN(val)) {
      toast.error('Validation Error', 'Please enter a valid numeric standard quantity.')
      return
    }
    updateStandardConsumption(id, Number(val))
    toast.success('Standard Updated', 'Configured new room standard consumption.')
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Owner & Super Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Executive oversight, standard consumption benchmarks, material wastage audits, and system configuration.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <CommonButton
          variant={activeTab === 'standard_consumption' ? 'primary' : 'secondary'}
          size="sm"
          icon={Sliders}
          onClick={() => setActiveTab('standard_consumption')}
        >
          Standard vs Actual Benchmarks
        </CommonButton>

        <CommonButton
          variant={activeTab === 'wastage_audits' ? 'primary' : 'secondary'}
          size="sm"
          icon={TrendingDown}
          onClick={() => setActiveTab('wastage_audits')}
        >
          Material Wastage Audits ({(wastageRecords || []).length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'audit_logs' ? 'primary' : 'secondary'}
          size="sm"
          icon={ShieldAlert}
          onClick={() => setActiveTab('audit_logs')}
        >
          Complete Security Audit Trail ({(activityLogs || []).length})
        </CommonButton>
      </div>

      {/* Tab 1: Standard vs Actual Consumption Benchmarks (Section 18) */}
      {activeTab === 'standard_consumption' && (
        <div className="space-y-4">
          <div className="bg-primary-soft/40 border border-primary/20 rounded-xl p-4 text-xs text-text-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-text-primary text-sm">Configurable Room Consumption Limits</p>
              <p>Configure standard per-room consumption allowances. Real-time deviations will be flagged in operational reports.</p>
            </div>
            <CommonBadge tone="primary" dot>Formula: Variance = Actual - Standard</CommonBadge>
          </div>

          <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
            <CommonTable
              columns={[
                {
                  key: 'itemName',
                  header: 'Consumable Item',
                  render: (sc) => <span className="font-bold text-text-primary">{sc.itemName}</span>,
                },
                {
                  key: 'standardPerRoom',
                  header: 'Standard Allowance / Room',
                  render: (sc) =>
                    editingId === sc.id ? (
                      <input
                        type="number"
                        defaultValue={sc.standardPerRoom}
                        onChange={(e) => setVal(e.target.value)}
                        className="w-24 px-2 py-1 rounded border border-primary text-xs bg-surface text-text-primary focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-text-primary bg-surface-muted px-2 py-1 rounded">
                        {sc.standardPerRoom} {sc.unit}
                      </span>
                    ),
                },
                {
                  key: 'unit',
                  header: 'Unit',
                  render: (sc) => <span className="text-text-secondary">{sc.unit}</span>,
                },
                {
                  key: 'actions',
                  header: 'Configure',
                  className: 'text-right',
                  render: (sc) => (
                    <div className="text-right">
                      {editingId === sc.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveStandard(sc.id)}
                            className="px-2.5 py-1 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded bg-surface border border-border text-xs text-text-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(sc.id)
                            setVal(sc.standardPerRoom)
                          }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Edit Standard
                        </button>
                      )}
                    </div>
                  ),
                },
              ]}
              rows={standardConsumptions || []}
              rowKey="id"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Material Wastage Audits (Section 17 & 22) */}
      {activeTab === 'wastage_audits' && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
          <CommonTable
            columns={[
              {
                key: 'recordedAt',
                header: 'Date & Time',
                primary: true,
                render: (w) => new Date(w.recordedAt).toLocaleString(),
              },
              {
                key: 'itemName',
                header: 'Item',
                render: (w) => <span className="font-bold text-text-primary">{w.itemName}</span>,
              },
              {
                key: 'quantity',
                header: 'Wasted Quantity',
                render: (w) => <span className="text-rose-600 font-semibold">{w.quantity} {w.unit}</span>,
              },
              {
                key: 'reason',
                header: 'Reason',
                render: (w) => <CommonBadge tone="error">{w.reason}</CommonBadge>,
              },
              { key: 'housekeeperName', header: 'Housekeeper' },
              { key: 'roomNumber', header: 'Location / Room', render: (w) => `Room ${w.roomNumber}` },
              { key: 'notes', header: 'Audit Remarks', render: (w) => <span className="italic">{w.notes || '—'}</span> },
            ]}
            rows={wastageRecords || []}
          />
        </div>
      )}

      {/* Tab 3: Complete Security Audit Trail (Section 23 & 28) */}
      {activeTab === 'audit_logs' && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-border bg-surface-muted/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Immutable System Operational Logs</span>
            <CommonBadge tone="neutral">Read-only audit record</CommonBadge>
          </div>
          <CommonTable
            columns={[
              {
                key: 'timestamp',
                header: 'Timestamp',
                primary: true,
                render: (log) => new Date(log.timestamp).toLocaleString(),
              },
              {
                key: 'action',
                header: 'Action',
                render: (log) => <span className="font-bold text-text-primary">{log.action}</span>,
              },
              {
                key: 'user',
                header: 'User Role',
                render: (log) => <CommonBadge tone="primary">{log.user}</CommonBadge>,
              },
              {
                key: 'details',
                header: 'Operational Details',
                render: (log) => log.details,
              },
            ]}
            rows={activityLogs || []}
          />
        </div>
      )}
    </div>
  )
}
