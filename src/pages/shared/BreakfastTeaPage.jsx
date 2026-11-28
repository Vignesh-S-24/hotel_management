import { useState } from 'react'
import {
  Coffee,
  Utensils,
  Trash2,
  Calendar,
  Clock,
  Plus,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FOOD_WASTAGE_REASONS, MEAL_TYPE_OPTIONS } from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import CommonTable from '../../components/common/CommonTable'

export default function BreakfastTeaPage() {
  const { user } = useAuth()
  const {
    mealRecords = [],
    breakfastRecords = [],
    teaCoffeeRecords = [],
    breakfastWastage = [],
    recordMealCount,
    recordBreakfastCount,
    recordTeaCoffeeCount,
    recordBreakfastWastage,
  } = useData()
  const toast = useToast()

  // Unified list of meals: uses mealRecords, plus falls back to breakfastRecords if not yet in mealRecords
  const allMeals = (() => {
    if (mealRecords && mealRecords.length > 0) return mealRecords
    return (breakfastRecords || []).map((b) => ({
      ...b,
      mealType: 'Breakfast',
    }))
  })()

  // Active view: 'all_meals' | 'breakfast' | 'lunch' | 'dinner' | 'tea_coffee' | 'wastage'
  const [activeTab, setActiveTab] = useState('all_meals')

  // Modals
  const [showMealModal, setShowMealModal] = useState(false)
  const [showTeaCoffeeModal, setShowTeaCoffeeModal] = useState(false)
  const [showWastageModal, setShowWastageModal] = useState(false)

  // Meal form fields (Breakfast, Lunch, Dinner)
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0])
  const [mealType, setMealType] = useState('Breakfast')
  const [customersServed, setCustomersServed] = useState('')
  const [mealRemarks, setMealRemarks] = useState('')

  // Tea Coffee form fields
  const [tcDate, setTcDate] = useState(new Date().toISOString().split('T')[0])
  const [teaCount, setTeaCount] = useState('')
  const [coffeeCount, setCoffeeCount] = useState('')
  const [serviceTime, setServiceTime] = useState('07:00 - 10:30 AM')
  const [tcRemarks, setTcRemarks] = useState('')

  // Wastage form fields
  const [wastageDate, setWastageDate] = useState(new Date().toISOString().split('T')[0])
  const [wastageItem, setWastageItem] = useState('Breakfast')
  const [wastageQty, setWastageQty] = useState('1')
  const [wastageReason, setWastageReason] = useState('Excess Prepared')
  const [wastageRemarks, setWastageRemarks] = useState('')

  // Metrics for Today
  const todayStr = new Date().toISOString().split('T')[0]
  const todayBreakfast =
    allMeals.find((r) => r.date === todayStr && r.mealType === 'Breakfast')?.customersServed ||
    breakfastRecords.find((r) => r.date === todayStr)?.customersServed ||
    0
  const todayLunch =
    allMeals.find((r) => r.date === todayStr && r.mealType === 'Lunch')?.customersServed || 0
  const todayDinner =
    allMeals.find((r) => r.date === todayStr && r.mealType === 'Dinner')?.customersServed || 0
  const todayTotalMeals = Number(todayBreakfast) + Number(todayLunch) + Number(todayDinner)

  const todayTeaCoffee = teaCoffeeRecords.find((r) => r.date === todayStr)?.total || 0
  const todayWastage = breakfastWastage
    .filter((r) => r.date === todayStr)
    .reduce((sum, r) => sum + Number(r.quantity || 0), 0)

  const handleOpenAddMeal = (defaultType = 'Breakfast') => {
    setMealType(defaultType)
    setCustomersServed('')
    setMealRemarks('')
    setShowMealModal(true)
  }

  const handleSaveMeal = (e) => {
    e.preventDefault()
    if (!customersServed || Number(customersServed) < 0) {
      toast.error('Invalid Count', 'Please enter a valid number of customers.')
      return
    }

    if (recordMealCount) {
      recordMealCount({
        date: mealDate,
        mealType,
        customersServed: Number(customersServed),
        remarks: mealRemarks,
      })
    } else {
      recordBreakfastCount({
        date: mealDate,
        customersServed: Number(customersServed),
        remarks: `[${mealType}] ${mealRemarks}`,
      })
    }

    toast.success(`${mealType} Count Saved`, `Recorded ${customersServed} guests for ${mealDate}.`)
    setShowMealModal(false)
    setCustomersServed('')
    setMealRemarks('')
  }

  const handleSaveTeaCoffee = (e) => {
    e.preventDefault()
    if (Number(teaCount) < 0 || Number(coffeeCount) < 0) {
      toast.error('Invalid Count', 'Counts must be zero or positive.')
      return
    }

    recordTeaCoffeeCount({
      date: tcDate,
      teaCount: Number(teaCount || 0),
      coffeeCount: Number(coffeeCount || 0),
      serviceTime,
      remarks: tcRemarks,
    })

    toast.success('Beverage Count Saved', `Recorded ${teaCount} tea & ${coffeeCount} coffee for ${tcDate}.`)
    setShowTeaCoffeeModal(false)
    setTeaCount('')
    setCoffeeCount('')
    setTcRemarks('')
  }

  const handleSaveWastage = (e) => {
    e.preventDefault()
    if (!wastageQty || Number(wastageQty) <= 0) {
      toast.error('Invalid Quantity', 'Please enter a valid wastage quantity.')
      return
    }

    recordBreakfastWastage({
      date: wastageDate,
      item: wastageItem,
      quantity: Number(wastageQty),
      unit: ['Breakfast', 'Lunch', 'Dinner'].includes(wastageItem) ? 'portions' : 'cups',
      reason: wastageReason,
      remarks: wastageRemarks,
    })

    toast.warning('Wastage Recorded', `Logged ${wastageQty} wasted ${wastageItem} (${wastageReason}).`)
    setShowWastageModal(false)
    setWastageQty('1')
    setWastageRemarks('')
  }

  // Filtered meals list according to active tab
  const displayedMeals =
    activeTab === 'all_meals'
      ? allMeals
      : activeTab === 'breakfast'
      ? allMeals.filter((m) => m.mealType === 'Breakfast')
      : activeTab === 'lunch'
      ? allMeals.filter((m) => m.mealType === 'Lunch')
      : activeTab === 'dinner'
      ? allMeals.filter((m) => m.mealType === 'Dinner')
      : []

  const getMealBadgeTone = (type) => {
    switch (type) {
      case 'Breakfast':
        return 'warning'
      case 'Lunch':
        return 'info'
      case 'Dinner':
        return 'primary'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Utensils className="w-7 h-7 text-primary shrink-0" />
            <span>Dining, Meals & Beverages Management</span>
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Complete daily tracking for Breakfast, Lunch, Dinner, Tea & Coffee service, and audited food wastage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto pb-1 xl:pb-0">
          <CommonButton
            variant="primary"
            icon={Plus}
            onClick={() => handleOpenAddMeal('Breakfast')}
            className="whitespace-nowrap"
          >
            Record Meal (B/L/D)
          </CommonButton>

          <CommonButton
            variant="secondary"
            icon={Coffee}
            onClick={() => setShowTeaCoffeeModal(true)}
            className="whitespace-nowrap"
          >
            Record Tea / Coffee
          </CommonButton>

          <CommonButton
            variant="danger"
            icon={Trash2}
            onClick={() => setShowWastageModal(true)}
            className="whitespace-nowrap"
          >
            Record Wastage
          </CommonButton>
        </div>
      </div>

      {/* KPI Cards: Breakfast, Lunch, Dinner, Beverages, Wastage */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Breakfast */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Breakfast</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{todayBreakfast}</div>
          <span className="text-[11px] text-text-secondary">Morning guests served</span>
        </div>

        {/* Lunch */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Lunch</span>
            <Sunset className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{todayLunch}</div>
          <span className="text-[11px] text-text-secondary">Afternoon guests served</span>
        </div>

        {/* Dinner */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Dinner</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">{todayDinner}</div>
          <span className="text-[11px] text-text-secondary">Evening guests served</span>
        </div>

        {/* Tea & Coffee */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Tea / Coffee</span>
            <Coffee className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-600 mt-1">{todayTeaCoffee} cups</div>
          <span className="text-[11px] text-text-secondary">Beverages served</span>
        </div>

        {/* Wastage */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Wastage</span>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{todayWastage}</div>
          <span className="text-[11px] text-text-secondary">Portions & cups</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <CommonButton
          variant={activeTab === 'all_meals' ? 'primary' : 'secondary'}
          size="sm"
          icon={Utensils}
          onClick={() => setActiveTab('all_meals')}
        >
          All Meals ({allMeals.length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'breakfast' ? 'primary' : 'secondary'}
          size="sm"
          icon={Sun}
          onClick={() => setActiveTab('breakfast')}
        >
          Breakfast ({allMeals.filter((m) => m.mealType === 'Breakfast').length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'lunch' ? 'primary' : 'secondary'}
          size="sm"
          icon={Sunset}
          onClick={() => setActiveTab('lunch')}
        >
          Lunch ({allMeals.filter((m) => m.mealType === 'Lunch').length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'dinner' ? 'primary' : 'secondary'}
          size="sm"
          icon={Moon}
          onClick={() => setActiveTab('dinner')}
        >
          Dinner ({allMeals.filter((m) => m.mealType === 'Dinner').length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'tea_coffee' ? 'primary' : 'secondary'}
          size="sm"
          icon={Coffee}
          onClick={() => setActiveTab('tea_coffee')}
        >
          Tea / Coffee ({teaCoffeeRecords.length})
        </CommonButton>

        <CommonButton
          variant={activeTab === 'wastage' ? 'primary' : 'secondary'}
          size="sm"
          icon={Trash2}
          onClick={() => setActiveTab('wastage')}
        >
          Wastage Audit ({breakfastWastage.length})
        </CommonButton>
      </div>

      {/* Meal Tables (All, Breakfast, Lunch, Dinner) */}
      {['all_meals', 'breakfast', 'lunch', 'dinner'].includes(activeTab) && (
        <div className="space-y-3">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary capitalize">
              {activeTab === 'all_meals' ? 'All Dining Services (Breakfast, Lunch & Dinner)' : `${activeTab} Guest Counts`}
            </h2>
            <span className="text-xs text-text-secondary">Official meal service counts</span>
          </div>

          <CommonTable
            columns={[
              {
                key: 'date',
                header: 'Service Date',
                primary: true,
                render: (r) => (
                  <span className="font-bold text-text-primary text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {r.date}
                  </span>
                ),
              },
              {
                key: 'mealType',
                header: 'Meal Session',
                render: (r) => (
                  <CommonBadge tone={getMealBadgeTone(r.mealType || 'Breakfast')}>
                    {r.mealType || 'Breakfast'}
                  </CommonBadge>
                ),
              },
              {
                key: 'count',
                header: 'Customers Served',
                render: (r) => (
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded text-xs">
                    {r.customersServed} guests
                  </span>
                ),
              },
              {
                key: 'recorder',
                header: 'Recorded By',
                render: (r) => <span className="text-xs text-text-secondary">{r.recordedBy}</span>,
              },
              {
                key: 'remarks',
                header: 'Operational Remarks',
                render: (r) => <span className="text-xs text-text-secondary italic">{r.remarks || '—'}</span>,
              },
            ]}
            rows={displayedMeals}
            rowKey="id"
          />
        </div>
      )}

      {/* Tab: Tea / Coffee Records */}
      {activeTab === 'tea_coffee' && (
        <div className="space-y-3">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Daily Customer Tea & Coffee Service Count</h2>
            <span className="text-xs text-text-secondary">Breakfast & lounge distribution</span>
          </div>

          <CommonTable
            columns={[
              {
                key: 'date',
                header: 'Date & Time',
                primary: true,
                render: (r) => (
                  <div>
                    <span className="font-bold text-text-primary text-xs">{r.date}</span>
                    <span className="block text-[11px] text-text-secondary">{r.serviceTime}</span>
                  </div>
                ),
              },
              {
                key: 'breakdown',
                header: 'Counts (Tea / Coffee)',
                render: (r) => (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-bold">
                      Tea: {r.teaCount}
                    </span>
                    <span className="bg-stone-500/10 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded font-bold">
                      Coffee: {r.coffeeCount}
                    </span>
                  </div>
                ),
              },
              {
                key: 'total',
                header: 'Total Beverages',
                render: (r) => (
                  <span className="font-mono font-black text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded text-xs">
                    {r.total} cups
                  </span>
                ),
              },
              {
                key: 'recordedBy',
                header: 'Logged By',
                render: (r) => <span className="text-xs text-text-secondary">{r.recordedBy}</span>,
              },
              {
                key: 'remarks',
                header: 'Remarks',
                render: (r) => <span className="text-xs text-text-secondary italic">{r.remarks || '—'}</span>,
              },
            ]}
            rows={teaCoffeeRecords}
            rowKey="id"
          />
        </div>
      )}

      {/* Tab: Wastage Records */}
      {activeTab === 'wastage' && (
        <div className="space-y-3">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Food & Beverage Wastage Audit</h2>
              <p className="text-xs text-text-secondary">Wastage tracking is separate and does NOT deduct from guest served counts.</p>
            </div>
            <CommonBadge tone="error" dot>Audited Separation</CommonBadge>
          </div>

          <CommonTable
            columns={[
              {
                key: 'date',
                header: 'Date & Item',
                primary: true,
                render: (r) => (
                  <div>
                    <span className="font-bold text-text-primary text-xs">{r.date}</span>
                    <span className="block text-xs font-semibold text-primary">{r.item}</span>
                  </div>
                ),
              },
              {
                key: 'qty',
                header: 'Wasted Quantity',
                render: (r) => (
                  <span className="font-mono font-bold text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded text-xs">
                    {r.quantity} {r.unit}
                  </span>
                ),
              },
              {
                key: 'reason',
                header: 'Wastage Reason',
                render: (r) => (
                  <CommonBadge tone="warning">
                    {r.reason}
                  </CommonBadge>
                ),
              },
              {
                key: 'recordedBy',
                header: 'Recorded By',
                render: (r) => <span className="text-xs text-text-secondary">{r.recordedBy}</span>,
              },
              {
                key: 'remarks',
                header: 'Incident Notes',
                render: (r) => <span className="text-xs text-text-secondary italic">{r.remarks || '—'}</span>,
              },
            ]}
            rows={breakfastWastage}
            rowKey="id"
          />
        </div>
      )}

      {/* Record Meal Modal (Breakfast, Lunch, Dinner) */}
      {showMealModal && (
        <CommonModal
          open={showMealModal}
          onClose={() => setShowMealModal(false)}
          title={`Record Customer Meal Count`}
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowMealModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="meal-form"
                size="md"
              >
                Save Meal Record
              </CommonButton>
            </>
          }
        >
          <form id="meal-form" onSubmit={handleSaveMeal} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <CommonInput
                label="Service Date"
                type="date"
                required
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
              />

              <CommonSelect
                label="Meal Session"
                required
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                options={MEAL_TYPE_OPTIONS}
              />
            </div>

            <CommonInput
              label={`Number of Customers Served (${mealType})`}
              type="number"
              min="0"
              required
              value={customersServed}
              onChange={(e) => setCustomersServed(e.target.value)}
              placeholder="e.g. 50"
            />

            <CommonInput
              label="Remarks / Audit Note"
              multiline
              rows={2}
              value={mealRemarks}
              onChange={(e) => setMealRemarks(e.target.value)}
              placeholder={`e.g. ${mealType} buffet service completed smoothly...`}
            />
          </form>
        </CommonModal>
      )}

      {/* Record Tea / Coffee Modal */}
      {showTeaCoffeeModal && (
        <CommonModal
          open={showTeaCoffeeModal}
          onClose={() => setShowTeaCoffeeModal(false)}
          title="Record Customer Tea & Coffee Count"
          footer={
            <>
              <CommonButton
                variant="secondary"
                size="md"
                onClick={() => setShowTeaCoffeeModal(false)}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                form="tea-coffee-form"
                size="md"
              >
                Save Beverage Record
              </CommonButton>
            </>
          }
        >
          <form id="tea-coffee-form" onSubmit={handleSaveTeaCoffee} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <CommonInput
                label="Service Date"
                type="date"
                required
                value={tcDate}
                onChange={(e) => setTcDate(e.target.value)}
              />

              <CommonInput
                label="Service Window"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                placeholder="e.g. 07:00 - 10:30 AM"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CommonInput
                label="Tea Cups Count"
                type="number"
                min="0"
                required
                value={teaCount}
                onChange={(e) => setTeaCount(e.target.value)}
                placeholder="0"
              />

              <CommonInput
                label="Coffee Cups Count"
                type="number"
                min="0"
                required
                value={coffeeCount}
                onChange={(e) => setCoffeeCount(e.target.value)}
                placeholder="0"
              />
            </div>

            <CommonInput
              label="Remarks"
              multiline
              rows={2}
              value={tcRemarks}
              onChange={(e) => setTcRemarks(e.target.value)}
              placeholder="Delivery notes or special customer requests..."
            />
          </form>
        </CommonModal>
      )}

      {/* Record Wastage Modal */}
      {showWastageModal && (
        <CommonModal
          open={showWastageModal}
          onClose={() => setShowWastageModal(false)}
          title="Record Food / Beverage Wastage"
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
                form="fb-wastage-form"
                variant="danger"
                size="md"
              >
                Confirm Wastage Entry
              </CommonButton>
            </>
          }
        >
          <form id="fb-wastage-form" onSubmit={handleSaveWastage} className="space-y-4">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
              <p className="font-bold">Business Rule (Section 20.4):</p>
              <p>Wastage is tracked independently and does not reduce the number of customers served.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CommonInput
                label="Date"
                type="date"
                required
                value={wastageDate}
                onChange={(e) => setWastageDate(e.target.value)}
              />

              <CommonSelect
                label="Meal / Beverage Item"
                required
                value={wastageItem}
                onChange={(e) => setWastageItem(e.target.value)}
                options={[
                  { value: 'Breakfast', label: 'Breakfast (Portions)' },
                  { value: 'Lunch', label: 'Lunch (Portions)' },
                  { value: 'Dinner', label: 'Dinner (Portions)' },
                  { value: 'Tea', label: 'Tea (Cups)' },
                  { value: 'Coffee', label: 'Coffee (Cups)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CommonInput
                label="Quantity"
                type="number"
                min="1"
                required
                value={wastageQty}
                onChange={(e) => setWastageQty(e.target.value)}
              />

              <CommonSelect
                label="Reason"
                required
                value={wastageReason}
                onChange={(e) => setWastageReason(e.target.value)}
                options={FOOD_WASTAGE_REASONS.map((r) => ({ value: r, label: r }))}
              />
            </div>

            <CommonInput
              label="Incident Description / Remarks"
              multiline
              rows={2}
              value={wastageRemarks}
              onChange={(e) => setWastageRemarks(e.target.value)}
              placeholder="e.g. 3 dinner portions unconsumed after buffet hours..."
            />
          </form>
        </CommonModal>
      )}
    </div>
  )
}
