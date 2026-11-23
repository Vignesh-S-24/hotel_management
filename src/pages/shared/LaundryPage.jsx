import { useState } from 'react'
import {
  Shirt,
  Send,
  RotateCcw,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { LAUNDRY_CATEGORIES } from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import CommonTable from '../../components/common/CommonTable'

export default function LaundryPage() {
  const { user } = useAuth()
  const {
    laundryItems,
    laundryTransactions,
    collectDirtyLaundry,
    dispatchLaundry,
    returnLaundry,
  } = useData()
  const toast = useToast()

  const [activeCategory, setActiveCategory] = useState('All')

  // Modals
  const [showCollectModal, setShowCollectModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)

  // Collect form
  const [collectItemId, setCollectItemId] = useState('')
  const [collectQty, setCollectQty] = useState('')

  // Dispatch form
  const [dispatchItemId, setDispatchItemId] = useState('')
  const [dispatchQty, setDispatchQty] = useState('')
  const [vendorName, setVendorName] = useState('Royal Cleaners & Laundry Ltd.')

  // Return form
  const [returnItemId, setReturnItemId] = useState('')
  const [returnedQty, setReturnedQty] = useState('')
  const [damagedQty, setDamagedQty] = useState('0')
  const [missingQty, setMissingQty] = useState('0')
  const [returnNotes, setReturnNotes] = useState('')

  const filteredItems = laundryItems.filter(
    (i) => activeCategory === 'All' || i.category === activeCategory
  )

  const handleCollect = (e) => {
    e.preventDefault()
    if (!collectItemId || !collectQty) return
    collectDirtyLaundry(collectItemId, collectQty)
    toast.success('Dirty Laundry Collected', `${collectQty} items recorded.`)
    setShowCollectModal(false)
    setCollectQty('')
  }

  const handleDispatch = (e) => {
    e.preventDefault()
    if (!dispatchItemId || !dispatchQty) return
    dispatchLaundry(dispatchItemId, dispatchQty, vendorName)
    toast.info('Laundry Dispatched', `${dispatchQty} items sent to ${vendorName}`)
    setShowDispatchModal(false)
    setDispatchQty('')
  }

  const handleReturn = (e) => {
    e.preventDefault()
    if (!returnItemId || !returnedQty) return
    returnLaundry(returnItemId, {
      returnedQty,
      damagedQty,
      missingQty,
      notes: returnNotes,
    })
    toast.success('Laundry Returned & Fresh Stock Updated', `${returnedQty} fresh items added to stock.`)
    setShowReturnModal(false)
    setReturnedQty('')
    setDamagedQty('0')
    setMissingQty('0')
    setReturnNotes('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Shirt className="w-7 h-7 text-primary" />
            Laundry Management
          </h1>
          <p className="text-sm text-text-muted">
            Track full lifecycle: Dirty Linen → Send to Vendor → Return (Damage/Missing) → Fresh Stock.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <CommonButton
            variant="secondary"
            icon={Plus}
            className="text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
            onClick={() => {
              setCollectItemId(laundryItems[0]?.id || '')
              setShowCollectModal(true)
            }}
          >
            Collect Dirty
          </CommonButton>
          <CommonButton
            variant="primary"
            icon={Send}
            onClick={() => {
              setDispatchItemId(laundryItems[0]?.id || '')
              setShowDispatchModal(true)
            }}
          >
            Send for Laundry
          </CommonButton>
          <CommonButton
            variant="success"
            icon={RotateCcw}
            onClick={() => {
              setReturnItemId(laundryItems[0]?.id || '')
              setShowReturnModal(true)
            }}
          >
            Receive Return
          </CommonButton>
        </div>
      </div>

      {/* Workflow Diagram Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-text-primary">
          <span>Workflow:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <CommonBadge tone="warning">1. Dirty Laundry</CommonBadge>
          <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
          <CommonBadge tone="info">2. Send for Laundry</CommonBadge>
          <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
          <CommonBadge tone="violet">3. Return & Damage Check</CommonBadge>
          <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
          <CommonBadge tone="success" className="font-bold">4. Fresh Laundry (+ Stock Auto-Updated)</CommonBadge>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
        {['All', ...LAUNDRY_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Live Laundry Items Table */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Current Laundry Stock Status</h2>
          <span className="text-xs text-text-muted">Updated in real-time</span>
        </div>

        <CommonTable
          columns={[
            {
              key: 'name',
              header: 'Item Name',
              render: (item) => <span className="font-bold text-text-primary">{item.name}</span>,
            },
            {
              key: 'category',
              header: 'Category',
              render: (item) => (
                <span className="px-2 py-0.5 rounded bg-surface-muted border border-border text-[11px]">
                  {item.category}
                </span>
              ),
            },
            {
              key: 'dirtyQty',
              header: 'Dirty Qty',
              render: (item) => (
                <span className="font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                  {item.dirtyQty} pcs
                </span>
              ),
            },
            {
              key: 'sentQty',
              header: 'Sent for Wash',
              render: (item) => (
                <span className="font-bold text-blue-600 bg-blue-500/10 px-2 py-1 rounded">
                  {item.sentQty} pcs
                </span>
              ),
            },
            {
              key: 'freshQty',
              header: 'Fresh Stock',
              render: (item) => (
                <span className="font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">
                  {item.freshQty} pcs
                </span>
              ),
            },
            {
              key: 'minStock',
              header: 'Min Stock Alert',
              render: (item) =>
                item.freshQty <= item.minimumStock ? (
                  <CommonBadge tone="error">Low Stock (&le; {item.minimumStock})</CommonBadge>
                ) : (
                  <span className="text-text-secondary text-[11px]">Min: {item.minimumStock} pcs</span>
                ),
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'text-right',
              render: (item) => (
                <div className="text-right">
                  <button
                    onClick={() => {
                      setDispatchItemId(item.id)
                      setShowDispatchModal(true)
                    }}
                    className="text-primary hover:underline font-semibold mr-3"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setReturnItemId(item.id)
                      setShowReturnModal(true)
                    }}
                    className="text-success hover:underline font-semibold"
                  >
                    Return
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredItems}
          rowKey="id"
        />
      </div>

      {/* Laundry Audit & Return Transactions */}
      <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
        <h2 className="text-sm font-bold text-text mb-3">Recent Laundry Transactions & Reconciliation</h2>
        <div className="space-y-3">
          {laundryTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-xl border border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CommonBadge
                    tone={
                      tx.type === 'dispatch'
                        ? 'info'
                        : tx.type === 'return'
                        ? 'success'
                        : 'warning'
                    }
                    className="uppercase"
                  >
                    {tx.type}
                  </CommonBadge>
                  <span className="font-bold text-text-primary">{tx.itemName}</span>
                  <span className="text-text-secondary">({tx.category})</span>
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Responsible: <strong className="text-text-primary">{tx.responsibleEmployee}</strong> • Vendor: {tx.vendorName}
                  {tx.notes && <span className="italic"> — "{tx.notes}"</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-text-primary text-sm">
                  {tx.quantity} pcs
                </span>
                {tx.type === 'return' && (tx.damagedQty > 0 || tx.missingQty > 0) && (
                  <div className="flex gap-1.5 text-[10px] font-semibold">
                    {tx.damagedQty > 0 && (
                      <CommonBadge tone="error">Damaged: {tx.damagedQty}</CommonBadge>
                    )}
                    {tx.missingQty > 0 && (
                      <CommonBadge tone="warning">Missing: {tx.missingQty}</CommonBadge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collect Dirty Modal with CommonModal */}
      <CommonModal
        open={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        title="Collect Dirty Laundry"
        description="Record dirty items gathered from hotel rooms."
      >
        <form onSubmit={handleCollect} className="space-y-4">
          <CommonSelect
            label="Laundry Item"
            required
            value={collectItemId}
            onChange={(e) => setCollectItemId(e.target.value)}
            options={laundryItems.map((i) => ({
              value: i.id,
              label: `${i.name} (${i.category})`,
            }))}
          />

          <CommonInput
            label="Collected Quantity (pcs)"
            type="number"
            min="1"
            required
            value={collectQty}
            onChange={(e) => setCollectQty(e.target.value)}
            placeholder="e.g. 25"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setShowCollectModal(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
            >
              Confirm Dirty Collection
            </CommonButton>
          </div>
        </form>
      </CommonModal>

      {/* Send for Laundry Modal with CommonModal */}
      <CommonModal
        open={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        title="Dispatch Laundry for Washing"
        description="Hand over dirty laundry to external laundry vendor."
      >
        <form onSubmit={handleDispatch} className="space-y-4">
          <CommonSelect
            label="Laundry Item"
            required
            value={dispatchItemId}
            onChange={(e) => setDispatchItemId(e.target.value)}
            options={laundryItems.map((i) => ({
              value: i.id,
              label: `${i.name} (Dirty Available: ${i.dirtyQty} pcs)`,
            }))}
          />

          <CommonInput
            label="Dispatch Quantity (pcs)"
            type="number"
            min="1"
            required
            value={dispatchQty}
            onChange={(e) => setDispatchQty(e.target.value)}
            placeholder="e.g. 40"
          />

          <CommonInput
            label="Laundry Vendor Name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setShowDispatchModal(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
            >
              Send for Laundry
            </CommonButton>
          </div>
        </form>
      </CommonModal>

      {/* Laundry Return Modal with CommonModal */}
      <CommonModal
        open={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Receive Laundry Return"
        description="Returned fresh items are added automatically to fresh inventory stock."
      >
        <form onSubmit={handleReturn} className="space-y-4">
          <CommonSelect
            label="Laundry Item"
            required
            value={returnItemId}
            onChange={(e) => setReturnItemId(e.target.value)}
            options={laundryItems.map((i) => ({
              value: i.id,
              label: `${i.name} (With vendor: ${i.sentQty} pcs)`,
            }))}
          />

          <CommonInput
            label="Accepted Fresh Quantity (pcs)"
            type="number"
            min="0"
            required
            value={returnedQty}
            onChange={(e) => setReturnedQty(e.target.value)}
            placeholder="e.g. 38"
          />

          <div className="grid grid-cols-2 gap-3">
            <CommonInput
              label="Damaged Items (pcs)"
              type="number"
              min="0"
              value={damagedQty}
              onChange={(e) => setDamagedQty(e.target.value)}
            />

            <CommonInput
              label="Missing Items (pcs)"
              type="number"
              min="0"
              value={missingQty}
              onChange={(e) => setMissingQty(e.target.value)}
            />
          </div>

          <CommonInput
            label="Reconciliation Notes"
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="e.g. 2 torn pillow covers billed to vendor"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setShowReturnModal(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="success"
            >
              Accept & Update Fresh Stock
            </CommonButton>
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
