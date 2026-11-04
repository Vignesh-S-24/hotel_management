import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CommonButton from '../../../components/common/CommonButton'
import CommonInput from '../../../components/common/CommonInput'
import CommonModal from '../../../components/common/CommonModal'
import CommonSelect from '../../../components/common/CommonSelect'
import { useToast } from '../../../components/common/CommonToast'
import { useData } from '../../../context/DataContext'
import { useStaffOptions } from '../../../hooks/useStaffOptions'
import { INVENTORY_CATEGORIES, MOVEMENT_TYPES } from '../../../utils/constants'
import { numberField } from '../../../utils/validation'

const itemSchema = yup.object({
  name: yup.string().trim().required('Item name required').max(60),
  category: yup.string().required(),
  unit: yup.string().trim().required('Unit required').max(10),
  stock: numberField('Opening stock').required('Opening stock required').min(0, 'Stock cannot be negative'),
  minStock: numberField('Minimum stock').required('Minimum stock required').min(0, 'Minimum stock cannot be negative'),
  supplier: yup.string().trim().max(60),
})

const emptyItem = { name: '', category: 'Amenities', unit: 'pcs', stock: 0, minStock: 10, supplier: '' }

export function ItemFormModal({ open, item, onClose }) {
  const { saveItem } = useData()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(itemSchema), defaultValues: emptyItem })

  useEffect(() => {
    if (open) reset(item ? { ...emptyItem, ...item } : emptyItem)
  }, [open, item, reset])

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 250))
    saveItem(v, item?.id)
    toast.success(item ? 'Inventory item updated' : 'Inventory added', v.name)
    onClose()
  }

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={item ? `Edit ${item.name}` : 'Add Inventory'}
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="item-form" loading={isSubmitting}>
            {item ? 'Save changes' : 'Add item'}
          </CommonButton>
        </>
      }
    >
      <form id="item-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CommonInput label="Item name" required className="sm:col-span-2" error={errors.name?.message} {...register('name')} />
        <CommonSelect label="Category" options={INVENTORY_CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} />
        <CommonInput label="Unit" required placeholder="pcs, L" error={errors.unit?.message} {...register('unit')} />
        <CommonInput
          label="Opening stock"
          type="number"
          min={0}
          disabled={Boolean(item)}
          hint={item ? 'Use Adjust Stock to change quantities.' : undefined}
          error={errors.stock?.message}
          {...register('stock')}
        />
        <CommonInput label="Minimum stock" type="number" min={0} error={errors.minStock?.message} {...register('minStock')} />
        <CommonInput label="Supplier" className="sm:col-span-2" error={errors.supplier?.message} {...register('supplier')} />
      </form>
    </CommonModal>
  )
}

const movementSchema = yup.object({
  type: yup.string().required(),
  qty: numberField('Quantity').required('Enter quantity').integer('Whole numbers only').min(1, 'Enter a number above 0'),
  staffId: yup.string().when('type', { is: 'issue', then: (s) => s.required('Select a housekeeper') }),
  reference: yup.string().trim().max(30),
  reason: yup.string().trim().when('type', { is: (t) => ['adjust_up', 'adjust_down', 'damaged'].includes(t), then: (s) => s.required('Reason required for adjustment') }),
})

// APK: "Add Stock", "Adjust Stock", "Issued to housekeeper", "Damaged".
export function MovementModal({ item, onClose }) {
  const { recordMovement } = useData()
  const { housekeepers } = useStaffOptions()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(movementSchema), defaultValues: { type: 'in', qty: '', staffId: '', reference: '', reason: '' } })

  if (!item) return null
  const type = watch('type')
  const qty = Number(watch('qty')) || 0
  const after = item.stock + MOVEMENT_TYPES[type].sign * qty

  const onSubmit = async (v) => {
    await new Promise((r) => setTimeout(r, 250))
    const res = recordMovement({ itemId: item.id, ...v })
    if (!res.ok) return setError('qty', { message: res.error })
    toast.success(MOVEMENT_TYPES[v.type].label, `${v.qty} ${item.unit} ${item.name}`)
    onClose()
  }

  return (
    <CommonModal
      open
      onClose={onClose}
      title={`Adjust Stock · ${item.name}`}
      description={`Central stock now: ${item.stock} ${item.unit}`}
      footer={
        <>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" form="movement-form" loading={isSubmitting}>
            Record movement
          </CommonButton>
        </>
      }
    >
      <form id="movement-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CommonSelect label="Movement type" options={Object.entries(MOVEMENT_TYPES).map(([value, m]) => ({ value, label: m.label }))} {...register('type')} />
        <CommonInput label={`Quantity (${item.unit})`} type="number" min={1} required error={errors.qty?.message} {...register('qty')} />
        {type === 'issue' && <CommonSelect label="Issue to" required placeholder="Select a housekeeper" className="sm:col-span-2" options={housekeepers} error={errors.staffId?.message} {...register('staffId')} />}
        {type === 'in' && <CommonInput label="Invoice number" placeholder="e.g. INV-4900" className="sm:col-span-2" error={errors.reference?.message} {...register('reference')} />}
        <CommonInput
          label="Reason"
          required={['adjust_up', 'adjust_down', 'damaged'].includes(type)}
          multiline
          rows={2}
          className="sm:col-span-2"
          placeholder="e.g. Physical count correction"
          error={errors.reason?.message}
          {...register('reason')}
        />
        <p className={`text-sm sm:col-span-2 ${after < 0 ? 'text-error' : after <= item.minStock ? 'text-warning' : 'text-text-secondary'}`}>
          New central stock: <strong className="tabular-nums">{after}</strong> {item.unit}
          {after >= 0 && after <= item.minStock && ' · below minimum'}
        </p>
      </form>
    </CommonModal>
  )
}
