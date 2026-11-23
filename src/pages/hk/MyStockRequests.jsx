import { useState } from 'react'
import {
  Package,
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonTable from '../../components/common/CommonTable'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import { useToast } from '../../components/common/CommonToast'

export default function MyStockRequests() {
  const { user } = useAuth()
  const {
    housekeeperStock,
    stockRequests,
    requestStock,
    stockItems,
    supplies,
    recordWastage,
  } = useData()
  const toast = useToast()

  // Filter personal stock for this logged-in HK staff
  const myStock = (housekeeperStock || []).filter(
    (h) => h.housekeeperId === user?.staffId || h.housekeeperId === 's-hk1'
  )

  const myRequests = (stockRequests || []).filter(
    (sr) => sr.housekeeperId === user?.staffId || sr.housekeeperId === 's-hk1'
  )

  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedStockItem, setSelectedStockItem] = useState(null)
  const [requestQty, setRequestQty] = useState('1')
  const [requestReason, setRequestReason] = useState('')

  // Wastage Modal
  const [showWastageModal, setShowWastageModal] = useState(false)
  const [wastageItem, setWastageItem] = useState(null)
  const [wastageQty, setWastageQty] = useState('0.5')
  const [wastageReason, setWastageReason] = useState('Spillage')
  const [wastageNotes, setWastageNotes] = useState('')

  const handleOpenRequest = (item) => {
    // Critical Section 15 Business Rule Check:
    if (Number(item.currentStock) > 0) {
      toast.error(
        'Request Blocked by System Rule',
        `Current balance is ${item.currentStock} ${item.unit}. You can ONLY request additional stock when your balance is exactly ZERO (0).`
      )
      return
    }
    setSelectedStockItem(item)
    setShowRequestModal(true)
  }

  const handleSubmitRequest = (e) => {
    e.preventDefault()
    if (!selectedStockItem) return

    const res = requestStock({
      itemId: selectedStockItem.itemId,
      requestedQuantity: Number(requestQty),
      requestReason,
    })

    if (!res.ok) {
      toast.error('Stock Request Denied', res.error)
      return
    }

    toast.success('Stock Request Submitted', `Requested ${requestQty} units for approval.`)
    setShowRequestModal(false)
    setRequestQty('1')
    setRequestReason('')
  }

  const handleSubmitWastage = (e) => {
    e.preventDefault()
    if (!wastageItem) return

    recordWastage({
      itemId: wastageItem.itemId,
      quantity: Number(wastageQty),
      unit: wastageItem.unit,
      reason: wastageReason,
      notes: wastageNotes,
    })

    toast.warning('Wastage Recorded', `Reported ${wastageQty} ${wastageItem.unit} as wasted due to ${wastageReason}.`)
    setShowWastageModal(false)
    setWastageNotes('')
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Housekeeper Personal Stock & Replenishment
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Personal trolley stock inventory with strictly validated zero-balance replenishment requests.
          </p>
        </div>
      </div>

      {/* Zero Balance Business Rule Callout */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-700 dark:text-amber-400">
            Mandatory Thai Residency Business Rule (Section 15)
          </p>
          <p className="text-text-secondary mt-0.5">
            Housekeepers can request additional stock <strong>ONLY when the current balance of that item is exactly ZERO (0)</strong>. If balance &gt; 0, the request action is automatically disabled by the system.
          </p>
        </div>
      </div>

      {/* Current Personal Stock Table with CommonTable */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <span className="text-xs font-bold text-text-primary">My Trolley / Caddy Stock Items</span>
          <CommonBadge tone="neutral">Assigned to: {user?.name}</CommonBadge>
        </div>
        <CommonTable
          columns={[
            {
              key: 'itemName',
              header: 'Item Name',
              primary: true,
              render: (item) => <span className="font-bold text-text-primary">{item.itemName}</span>,
            },
            { key: 'category', header: 'Category' },
            {
              key: 'currentStock',
              header: 'Current Balance',
              render: (item) => {
                const isZero = Number(item.currentStock) === 0
                return (
                  <span
                    className={`font-black text-sm px-2 py-0.5 rounded ${
                      isZero ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}
                  >
                    {item.currentStock}
                  </span>
                )
              },
            },
            { key: 'unit', header: 'Unit' },
            {
              key: 'zeroBalanceStatus',
              header: 'Zero-Balance Status',
              render: (item) => {
                const isZero = Number(item.currentStock) === 0
                return isZero ? (
                  <CommonBadge tone="error" dot>0 Balance (Eligible for Request)</CommonBadge>
                ) : (
                  <CommonBadge tone="neutral">Balance &gt; 0 (Request Locked)</CommonBadge>
                )
              },
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'text-right',
              render: (item) => {
                const isZero = Number(item.currentStock) === 0
                return (
                  <div className="flex items-center justify-end gap-2">
                    <CommonButton
                      size="sm"
                      onClick={() => handleOpenRequest(item)}
                      disabled={!isZero}
                      title={!isZero ? 'Stock Request is disabled because balance is greater than zero' : 'Request replenishment'}
                    >
                      Request Stock
                    </CommonButton>
                    <CommonButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setWastageItem(item)
                        setShowWastageModal(true)
                      }}
                    >
                      Report Wastage
                    </CommonButton>
                  </div>
                )
              },
            },
          ]}
          rows={myStock}
        />
      </div>

      {/* Stock Request History with CommonTable */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-border bg-surface-muted/40">
          <h2 className="text-xs font-bold text-text-primary">Stock Request Audit History</h2>
        </div>
        <CommonTable
          columns={[
            {
              key: 'requestDate',
              header: 'Requested Date',
              primary: true,
              render: (req) => new Date(req.requestDate).toLocaleDateString(),
            },
            { key: 'itemName', header: 'Item', render: (req) => <span className="font-bold text-text-primary">{req.itemName}</span> },
            { key: 'requestedQuantity', header: 'Requested Qty', render: (req) => <span className="font-semibold text-text-primary">{req.requestedQuantity}</span> },
            { key: 'approvedQuantity', header: 'Approved Qty', render: (req) => req.approvedQuantity ?? '—' },
            { key: 'issuedQuantity', header: 'Issued Qty', render: (req) => <span className="font-bold text-emerald-600">{req.issuedQuantity ?? '—'}</span> },
            {
              key: 'status',
              header: 'Status',
              render: (req) => (
                <CommonBadge
                  tone={
                    req.status === 'issued'
                      ? 'success'
                      : req.status === 'approved'
                      ? 'info'
                      : req.status === 'rejected'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {req.status.toUpperCase()}
                </CommonBadge>
              ),
            },
            { key: 'approver', header: 'Approver', render: (req) => req.approver ?? 'Pending' },
            { key: 'requestReason', header: 'Reason', render: (req) => <span className="italic">{req.requestReason}</span> },
          ]}
          rows={myRequests}
        />
      </div>

      {/* Request Replenishment Modal */}
      {showRequestModal && selectedStockItem && (
        <CommonModal
          open={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title={`Request Stock: ${selectedStockItem.itemName}`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="request-stock-form"
                size="md"
              >
                Submit Replenishment Request
              </CommonButton>
            </>
          }
        >
          <form id="request-stock-form" onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="p-3 rounded-lg bg-surface-muted border border-border text-xs">
              <p className="font-semibold text-text-primary">Verified Current Balance: 0 {selectedStockItem.unit}</p>
              <p className="text-text-secondary mt-0.5">Zero-balance condition met. Submit request for Supervisor approval.</p>
            </div>

            <CommonInput
              label={`Requested Quantity (${selectedStockItem.unit})`}
              type="number"
              min="1"
              required
              value={requestQty}
              onChange={(e) => setRequestQty(e.target.value)}
            />

            <CommonInput
              label="Request Reason / Operational Need"
              required
              multiline
              rows={3}
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="e.g. Preparing 8 checkout suites on 2nd floor..."
            />
          </form>
        </CommonModal>
      )}

      {/* Report Wastage Modal */}
      {showWastageModal && wastageItem && (
        <CommonModal
          open={showWastageModal}
          onClose={() => setShowWastageModal(false)}
          title={`Report Wastage: ${wastageItem.itemName}`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowWastageModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="wastage-form"
                variant="danger"
                size="md"
              >
                Record Material Wastage
              </CommonButton>
            </>
          }
        >
          <form id="wastage-form" onSubmit={handleSubmitWastage} className="space-y-4">
            <CommonInput
              label={`Wasted Quantity (${wastageItem.unit})`}
              type="number"
              step="0.1"
              required
              value={wastageQty}
              onChange={(e) => setWastageQty(e.target.value)}
            />

            <CommonSelect
              label="Wastage Reason (Section 17)"
              required
              value={wastageReason}
              onChange={(e) => setWastageReason(e.target.value)}
              options={[
                { value: 'Spillage', label: 'Spillage' },
                { value: 'Damaged Bottle', label: 'Damaged Bottle' },
                { value: 'Wrong Dilution', label: 'Wrong Dilution' },
                { value: 'Expired', label: 'Expired' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <CommonInput
              label="Incident Description & Room"
              multiline
              rows={2}
              value={wastageNotes}
              onChange={(e) => setWastageNotes(e.target.value)}
              placeholder="e.g. Slipped in corridor outside Room 102..."
            />
          </form>
        </CommonModal>
      )}
    </div>
  )
}
