import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowDownUp, Boxes, PackageX, Pencil, Plus } from 'lucide-react'
import CommonBadge from '../../../components/common/CommonBadge'
import CommonButton from '../../../components/common/CommonButton'
import CommonCard, { StatCard } from '../../../components/common/CommonCard'
import CommonPagination from '../../../components/common/CommonPagination'
import CommonSearch from '../../../components/common/CommonSearch'
import CommonTable from '../../../components/common/CommonTable'
import FilterBar, { FilterSelect } from '../../../components/shared/FilterBar'
import PageHeader from '../../../components/shared/PageHeader'
import Tabs from '../../../components/shared/Tabs'
import { useData } from '../../../context/DataContext'
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading'
import { useTableData } from '../../../hooks/useTableData'
import { INVENTORY_CATEGORIES, MOVEMENT_TYPES } from '../../../utils/constants'
import { formatDateTime } from '../../../utils/formatDate'
import { ItemFormModal, MovementModal } from './InventoryForms'

const stockState = (i) => (i.stock === 0 ? 'out' : i.stock <= i.minStock ? 'low' : 'ok')
const STOCK_BADGE = {
  out: <CommonBadge tone="error" dot>Out of Stock</CommonBadge>,
  low: <CommonBadge tone="warning" dot>Low Stock</CommonBadge>,
  ok: <CommonBadge tone="success" dot>In Stock</CommonBadge>,
}

export default function InventoryList() {
  const { inventory, movements, staffName } = useData()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const stock = params.get('stock') ?? 'all'
  const [tab, setTab] = useState('items')
  const [category, setCategory] = useState('all')
  const [ledgerItem, setLedgerItem] = useState('all')
  const [ledgerType, setLedgerType] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [moving, setMoving] = useState(null)

  const setStock = (v) => setParams(v === 'all' ? {} : { stock: v }, { replace: true })
  const itemName = (id) => inventory.find((i) => i.id === id)?.name ?? 'Item not found'

  const itemFilter = useCallback(
    (i) => (category === 'all' || i.category === category) && (stock === 'all' || (stock === 'low' ? stockState(i) !== 'ok' : stockState(i) === stock)),
    [category, stock],
  )
  const itemSearch = useCallback((i) => `${i.name} ${i.category} ${i.supplier}`, [])
  const items = useTableData(inventory, { filterFn: itemFilter, searchText: itemSearch, initialSort: { key: 'name', dir: 'asc' }, resetKey: `${category}${stock}` })

  const ledgerFilter = useCallback((m) => (ledgerItem === 'all' || m.itemId === ledgerItem) && (ledgerType === 'all' || m.type === ledgerType), [ledgerItem, ledgerType])
  const ledgerSearch = useCallback((m) => `${itemName(m.itemId)} ${m.reason} ${m.reference} ${staffName(m.staffId)}`, // eslint-disable-next-line react-hooks/exhaustive-deps
  [inventory, staffName])
  const ledger = useTableData(movements, { filterFn: ledgerFilter, searchText: ledgerSearch, initialSort: { key: 'at', dir: 'desc' }, resetKey: `${ledgerItem}${ledgerType}` })

  const itemColumns = [
    {
      key: 'name',
      header: 'Item',
      sortable: true,
      primary: true,
      render: (i) => (
        <div>
          <p className="font-medium text-text-primary">{i.name}</p>
          <p className="text-xs text-text-secondary">{i.supplier || 'No supplier'}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortable: true },
    {
      key: 'stock',
      header: 'Central stock',
      sortable: true,
      render: (i) => (
        <span className="tabular-nums">
          {i.stock} <span className="text-text-secondary">{i.unit}</span>
        </span>
      ),
    },
    { key: 'minStock', header: 'Minimum', sortable: true, render: (i) => <span className="tabular-nums text-text-secondary">{i.minStock}</span> },
    { key: 'state', header: 'Status', render: (i) => STOCK_BADGE[stockState(i)] },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (i) => (
        <div className="flex justify-end gap-1">
          <CommonButton size="sm" variant="soft" icon={ArrowDownUp} onClick={() => setMoving(i)}>
            Adjust
          </CommonButton>
          <CommonButton
            size="sm"
            variant="ghost"
            icon={Pencil}
            aria-label={`Edit ${i.name}`}
            onClick={() => {
              setEditing(i)
              setFormOpen(true)
            }}
          />
        </div>
      ),
    },
  ]

  const ledgerColumns = [
    { key: 'at', header: 'Date', sortable: true, primary: true, render: (m) => formatDateTime(m.at) },
    { key: 'item', header: 'Item', render: (m) => itemName(m.itemId) },
    { key: 'type', header: 'Movement', render: (m) => <CommonBadge tone={MOVEMENT_TYPES[m.type].tone}>{MOVEMENT_TYPES[m.type].label}</CommonBadge> },
    {
      key: 'qty',
      header: 'Quantity',
      sortable: true,
      render: (m) => (
        <span className={`tabular-nums font-medium ${MOVEMENT_TYPES[m.type].sign > 0 ? 'text-success' : 'text-text-primary'}`}>
          {MOVEMENT_TYPES[m.type].sign > 0 ? '+' : '−'}
          {m.qty}
        </span>
      ),
    },
    { key: 'details', header: 'Details', render: (m) => <span className="text-text-secondary">{[m.staffId && `To ${staffName(m.staffId)}`, m.reference, m.reason].filter(Boolean).join(' · ') || '—'}</span> },
    { key: 'by', header: 'Recorded by', render: (m) => staffName(m.byId) },
  ]

  const lowCount = inventory.filter((i) => stockState(i) === 'low').length
  const outCount = inventory.filter((i) => stockState(i) === 'out').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Central stock is issued to housekeepers; room consumption comes from housekeeper stock."
        actions={
          <CommonButton
            icon={Plus}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add Inventory
          </CommonButton>
        }
      />
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-3">
        <StatCard label="Items tracked" value={inventory.length} icon={Boxes} tone="primary" />
        <StatCard label="Low stock" value={lowCount} icon={AlertTriangle} tone="warning" hint="View low stock" to="/admin/inventory?stock=low" />
        <StatCard label="Out of stock" value={outCount} icon={PackageX} tone="error" hint="Reorder now" to="/admin/inventory?stock=out" />
      </div>
      <CommonCard bodyClassName="p-0">
        <Tabs
          className="px-4"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'items', label: 'Items', count: inventory.length },
            { value: 'ledger', label: 'Stock ledger', count: movements.length },
          ]}
        />
        {tab === 'items' ? (
          <>
            <FilterBar>
              <CommonSearch value={items.query} onChange={items.setQuery} placeholder="Search items or categories" className="sm:w-64" />
              <FilterSelect label="Filter by category" value={category} onChange={setCategory} options={INVENTORY_CATEGORIES.map((c) => ({ value: c, label: c }))} allLabel="All categories" />
              <FilterSelect
                label="Filter by stock level"
                value={stock}
                onChange={setStock}
                options={[
                  { value: 'low', label: 'Low or out of stock' },
                  { value: 'out', label: 'Out of stock' },
                  { value: 'ok', label: 'In stock' },
                ]}
                allLabel="All stock levels"
              />
            </FilterBar>
            <CommonTable caption="Inventory items" columns={itemColumns} rows={items.rows} sort={items.sort} onSort={items.toggleSort} loading={loading} />
            <CommonPagination page={items.page} pageSize={items.pageSize} total={items.total} onPageChange={items.setPage} onPageSizeChange={items.setPageSize} />
          </>
        ) : (
          <>
            <FilterBar>
              <CommonSearch value={ledger.query} onChange={ledger.setQuery} placeholder="Search ledger" className="sm:w-64" />
              <FilterSelect label="Filter by item" value={ledgerItem} onChange={setLedgerItem} options={inventory.map((i) => ({ value: i.id, label: i.name }))} allLabel="All items" />
              <FilterSelect label="Filter by movement" value={ledgerType} onChange={setLedgerType} options={Object.entries(MOVEMENT_TYPES).map(([value, m]) => ({ value, label: m.label }))} allLabel="All movements" />
            </FilterBar>
            <CommonTable caption="Stock ledger" columns={ledgerColumns} rows={ledger.rows} sort={ledger.sort} onSort={ledger.toggleSort} loading={loading} />
            <CommonPagination page={ledger.page} pageSize={ledger.pageSize} total={ledger.total} onPageChange={ledger.setPage} onPageSizeChange={ledger.setPageSize} />
          </>
        )}
      </CommonCard>
      <ItemFormModal open={formOpen} item={editing} onClose={() => setFormOpen(false)} />
      {moving && <MovementModal item={inventory.find((i) => i.id === moving.id)} onClose={() => setMoving(null)} />}
    </div>
  )
}
