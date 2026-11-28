import { useState } from 'react'
import {
  Boxes,
  Plus,
  MapPin,
  Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { STOCK_CATEGORIES, ROLES } from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import CommonTable from '../../components/common/CommonTable'
import CommonSearch from '../../components/common/CommonSearch'

export default function StockPage() {
  const { user } = useAuth()
  const { stockItems, addStockItem, recordStockTransaction } = useData()
  const toast = useToast()

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStockForTx, setSelectedStockForTx] = useState(null)
  const [txType, setTxType] = useState('purchase') // 'purchase' | 'usage'
  const [txQuantity, setTxQuantity] = useState('')
  const [txNotes, setTxNotes] = useState('')

  // New Item form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Laundry')
  const [openingStock, setOpeningStock] = useState('50')
  const [minimumStock, setMinimumStock] = useState('20')
  const [unit, setUnit] = useState('pcs')
  const [location, setLocation] = useState('Main Store')

  const canManage = user.role === ROLES.OWNER || user.role === ROLES.SUPERVISOR

  const filteredItems = stockItems.filter((item) => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const handleCreate = (e) => {
    e.preventDefault()
    addStockItem({
      name,
      category,
      openingStock: Number(openingStock),
      receivedStock: 0,
      usedStock: 0,
      minimumStock: Number(minimumStock),
      unit,
      location,
    })
    toast.success('Stock Item Added', `${name} created under ${category}`)
    setShowAddModal(false)
    setName('')
  }

  const handleTransaction = (e) => {
    e.preventDefault()
    if (!selectedStockForTx || !txQuantity) return
    recordStockTransaction(selectedStockForTx.id, {
      type: txType,
      quantity: Number(txQuantity),
      notes: txNotes,
    })
    toast.info(
      txType === 'purchase' ? 'Stock Received / Purchased' : 'Stock Usage Logged',
      `${txQuantity} ${selectedStockForTx.unit} updated.`
    )
    setSelectedStockForTx(null)
    setTxQuantity('')
    setTxNotes('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-primary" />
            Central Stock Management
          </h1>
          <p className="text-sm text-text-muted">
            Categories: Laundry, EB (Electricity), Plumbing, Others. Stock Formula: Available = Opening + Received - Used.
          </p>
        </div>

        {canManage && (
          <CommonButton
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Stock Item
          </CommonButton>
        )}
      </div>

      {/* Stock Formula Banner */}
      <div className="bg-primary-soft/40 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-text-primary">
          <span className="p-1 rounded bg-primary text-white font-mono text-[10px]">FORMULA</span>
          <span>Automatic Central Stock Calculation:</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-sm text-primary">
          <span>Available Stock = Opening Stock + Received Stock – Used Stock</span>
        </div>
      </div>

      {/* Search and Categories Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', ...STOCK_CATEGORIES].map((cat) => (
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

        <div className="w-full sm:w-64">
          <CommonSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search stock item..."
          />
        </div>
      </div>

      {/* Stock Items Table with CommonTable */}
      <CommonTable
          columns={[
            {
              key: 'name',
              header: 'Item Name & Location',
              primary: true,
              render: (item) => (
                <div>
                  <div className="font-bold text-text-primary text-sm">{item.name}</div>
                  <div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                </div>
              ),
            },
            {
              key: 'category',
              header: 'Category',
              render: (item) => (
                <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-surface-muted border border-border">
                  {item.category}
                </span>
              ),
            },
            {
              key: 'openingStock',
              header: 'Opening Stock',
              render: (item) => `${item.openingStock} ${item.unit}`,
            },
            {
              key: 'receivedStock',
              header: '+ Received',
              render: (item) => <span className="text-emerald-700 font-semibold">+{item.receivedStock} {item.unit}</span>,
            },
            {
              key: 'usedStock',
              header: '- Used',
              render: (item) => <span className="text-rose-700 font-semibold">-{item.usedStock} {item.unit}</span>,
            },
            {
              key: 'availableStock',
              header: 'Available Stock',
              render: (item) => (
                <span className="font-black text-sm text-primary">
                  {item.availableStock} {item.unit}
                </span>
              ),
            },
            {
              key: 'minimumStock',
              header: 'Alert Level',
              render: (item) => {
                const isLow = item.availableStock <= item.minimumStock
                return isLow ? (
                  <CommonBadge tone="error">Low Stock Alert (&le; {item.minimumStock})</CommonBadge>
                ) : (
                  <span className="text-text-secondary text-[11px]">
                    Min: {item.minimumStock} {item.unit}
                  </span>
                )
              },
            },
            {
              key: 'actions',
              header: 'Stock Action',
              className: 'text-right',
              render: (item) => (
                <div className="flex items-center justify-end gap-1.5">
                  <CommonButton
                    variant="soft"
                    size="sm"
                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    onClick={() => {
                      setSelectedStockForTx(item)
                      setTxType('purchase')
                      setTxQuantity('')
                    }}
                  >
                    + Receive
                  </CommonButton>
                  <CommonButton
                    variant="soft"
                    size="sm"
                    className="text-rose-700 bg-rose-50 hover:bg-rose-100"
                    onClick={() => {
                      setSelectedStockForTx(item)
                      setTxType('usage')
                      setTxQuantity('')
                    }}
                  >
                    - Consume
                  </CommonButton>
                </div>
              ),
            },
          ]}
          rows={filteredItems}
        />

      {/* Modal: Add Stock Item with CommonModal */}
      <CommonModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Central Stock Item"
        description="Create centralized inventory record across hotel operations."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <CommonInput
            label="Item Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 15W LED Tubes / PVC Pipe Connectors"
          />

          <div className="grid grid-cols-2 gap-3">
            <CommonSelect
              label="Category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={STOCK_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <CommonInput
              label="Unit"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs / units / cans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CommonInput
              label="Opening Stock"
              type="number"
              min="0"
              required
              value={openingStock}
              onChange={(e) => setOpeningStock(e.target.value)}
            />

            <CommonInput
              label="Min Stock Threshold"
              type="number"
              min="1"
              required
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
            />
          </div>

          <CommonInput
            label="Storage Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Electrical Storage Room #2"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
            >
              Create Item
            </CommonButton>
          </div>
        </form>
      </CommonModal>

      {/* Modal: Record Transaction with CommonModal */}
      <CommonModal
        open={Boolean(selectedStockForTx)}
        onClose={() => setSelectedStockForTx(null)}
        title={txType === 'purchase' ? 'Receive / Purchase Stock' : 'Log Stock Usage'}
        description={`${selectedStockForTx?.name} (${selectedStockForTx?.category})`}
      >
        <form onSubmit={handleTransaction} className="space-y-4">
          <CommonInput
            label={`Quantity (${selectedStockForTx?.unit})`}
            type="number"
            min="1"
            required
            value={txQuantity}
            onChange={(e) => setTxQuantity(e.target.value)}
            placeholder="e.g. 10"
          />

          <CommonInput
            label="Usage / Purchase Note"
            value={txNotes}
            onChange={(e) => setTxNotes(e.target.value)}
            placeholder="e.g. Replaced faulty switches on Floor 3"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setSelectedStockForTx(null)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant={txType === 'purchase' ? 'success' : 'danger'}
            >
              Confirm
            </CommonButton>
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
