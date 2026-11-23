import { useState } from 'react'
import {
  PackageOpen,
  Plus,
  Minus,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonInput from '../../components/common/CommonInput'

export default function SuppliesPage() {
  const { supplies, recordSupplyUsage, addSupplyStock } = useData()
  const toast = useToast()

  const [selectedSupplyForUse, setSelectedSupplyForUse] = useState(null)
  const [selectedSupplyForAdd, setSelectedSupplyForAdd] = useState(null)
  const [quantity, setQuantity] = useState('')

  const handleUse = (e) => {
    e.preventDefault()
    if (!selectedSupplyForUse || !quantity) return
    recordSupplyUsage(selectedSupplyForUse.id, quantity)
    toast.info('Supply Usage Recorded', `${quantity} ${selectedSupplyForUse.unit} consumed.`)
    setSelectedSupplyForUse(null)
    setQuantity('')
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!selectedSupplyForAdd || !quantity) return
    addSupplyStock(selectedSupplyForAdd.id, quantity)
    toast.success('Supply Stock Received', `${quantity} ${selectedSupplyForAdd.unit} added.`)
    setSelectedSupplyForAdd(null)
    setQuantity('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <PackageOpen className="w-7 h-7 text-primary" />
            Daily Hotel Supplies
          </h1>
          <p className="text-sm text-text-muted">
            Monitor daily consumption, track shortages, opening vs available stock.
          </p>
        </div>
      </div>

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplies.map((item) => {
          const isLow = item.availableStock <= item.minimumStock
          return (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-text-primary">{item.name}</h3>
                  {isLow ? (
                    <CommonBadge tone="error">Shortage / Low Stock</CommonBadge>
                  ) : (
                    <CommonBadge tone="success">Sufficient</CommonBadge>
                  )}
                </div>

                <div className="text-xs text-text-secondary mb-4">
                  Category: <strong className="text-text-primary">{item.category}</strong>
                </div>

                {/* Stock Stats Formula Card */}
                <div className="bg-surface-muted p-3.5 rounded-xl border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Opening Stock:</span>
                    <span className="font-medium text-text-primary">{item.openingStock} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-success">
                    <span>+ Received Quantity:</span>
                    <span className="font-semibold">+{item.receivedQty} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-error">
                    <span>- Used Today:</span>
                    <span className="font-semibold">-{item.usedQty} {item.unit}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="font-bold text-text-primary">Available Stock:</span>
                    <span className="text-base font-black text-primary">
                      {item.availableStock} {item.unit}
                    </span>
                  </div>

                  <div className="text-[10px] text-text-secondary pt-1">
                    Minimum Threshold Alert: {item.minimumStock} {item.unit}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center gap-2 mt-4">
                <CommonButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={Minus}
                  className="text-error border-error/20 hover:bg-error-soft/30"
                  onClick={() => {
                    setSelectedSupplyForUse(item)
                    setQuantity('')
                  }}
                >
                  Log Usage
                </CommonButton>

                <CommonButton
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={Plus}
                  onClick={() => {
                    setSelectedSupplyForAdd(item)
                    setQuantity('')
                  }}
                >
                  Receive Stock
                </CommonButton>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Log Usage with CommonModal */}
      <CommonModal
        open={Boolean(selectedSupplyForUse)}
        onClose={() => setSelectedSupplyForUse(null)}
        title="Record Supply Consumption"
        description={selectedSupplyForUse?.name}
      >
        <form onSubmit={handleUse} className="space-y-4">
          <CommonInput
            label={`Quantity Consumed (${selectedSupplyForUse?.unit})`}
            type="number"
            min="1"
            max={selectedSupplyForUse?.availableStock}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 15"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setSelectedSupplyForUse(null)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="danger"
            >
              Record Consumption
            </CommonButton>
          </div>
        </form>
      </CommonModal>

      {/* Modal: Receive Stock with CommonModal */}
      <CommonModal
        open={Boolean(selectedSupplyForAdd)}
        onClose={() => setSelectedSupplyForAdd(null)}
        title="Receive Supplies"
        description={selectedSupplyForAdd?.name}
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <CommonInput
            label={`Received Quantity (${selectedSupplyForAdd?.unit})`}
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 50"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setSelectedSupplyForAdd(null)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
            >
              Confirm Received Stock
            </CommonButton>
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
