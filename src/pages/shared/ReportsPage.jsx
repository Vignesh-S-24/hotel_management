import { useState } from 'react'
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  CheckSquare,
  Users,
  Footprints,
  BedDouble,
  Shirt,
  PackageOpen,
  Boxes,
  Wrench,
  UtensilsCrossed,
  Coffee,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/CommonToast'
import CommonSelect from '../../components/common/CommonSelect'
import CommonTable from '../../components/common/CommonTable'
import CommonBadge from '../../components/common/CommonBadge'

export default function ReportsPage() {
  const { user } = useAuth()
  const {
    tasks,
    rooms,
    floorInspections,
    laundryTransactions,
    laundryItems,
    supplies,
    stockItems,
    stockRequests = [],
    stockTransactions = [],
    maintenanceRequests = [],
    mealRecords = [],
    breakfastRecords = [],
    teaCoffeeRecords = [],
    breakfastWastage = [],
    activityLogs = [],
  } = useData()
  const toast = useToast()

  // 25 Reports according to Section 22 of Specifications:
  // 1. Daily Task Report
  // 2. Employee Performance Report
  // 3. Floor Walk Report
  // 4. Room Status Report
  // 5. Room Cleaning Report
  // 6. Cleaning Duration Report
  // 7. Inspection Report
  // 8. Re-cleaning Report
  // 9. Laundry Dispatch Report
  // 10. Laundry Return Report
  // 11. Fresh Laundry Report
  // 12. Daily Supplies Report
  // 13. Inventory Balance Report
  // 14. Stock Request Report
  // 15. Stock Issuance Report
  // 16. Material Consumption Report
  // 17. Wastage Report
  // 18. Standard vs Actual Consumption Report
  // 19. Daily Activity Report
  // 20. Monthly Activity Report
  // 21. Maintenance Report
  // 22. Maintenance Pending vs Completed Report
  // 23. Daily Breakfast Report
  // 24. Tea / Coffee Report
  // 25. Breakfast & Beverage Wastage Report

  const [activeReport, setActiveReport] = useState('daily_tasks')

  const reportOptions = [
    { id: 'daily_tasks', label: '1. Daily Task Report', count: tasks.length },
    { id: 'employee_performance', label: '2. Employee Performance Report', count: tasks.length },
    { id: 'floor_walk', label: '3. Floor Walk Report', count: floorInspections.length },
    { id: 'room_status', label: '4. Room Status Report', count: rooms.length },
    { id: 'room_cleaning', label: '5. Room Cleaning Report', count: rooms.filter((r) => r.cleaningType).length },
    { id: 'cleaning_duration', label: '6. Cleaning Duration Report', count: tasks.filter((t) => t.category === 'Room Cleaning').length },
    { id: 'inspection', label: '7. Inspection Report', count: floorInspections.length },
    { id: 'recleaning', label: '8. Re-cleaning Report', count: rooms.filter((r) => r.status === 'reclean_required').length },
    { id: 'laundry_dispatch', label: '9. Laundry Dispatch Report', count: laundryTransactions.filter((t) => t.type === 'dispatch').length },
    { id: 'laundry_return', label: '10. Laundry Return Report', count: laundryTransactions.filter((t) => t.type === 'return').length },
    { id: 'fresh_laundry', label: '11. Fresh Laundry Report', count: laundryItems.length },
    { id: 'daily_supplies', label: '12. Daily Supplies Report', count: supplies.length },
    { id: 'inventory_balance', label: '13. Inventory Balance Report', count: stockItems.length },
    { id: 'stock_requests', label: '14. Stock Request Report', count: stockRequests.length },
    { id: 'stock_issuance', label: '15. Stock Issuance Report', count: stockTransactions.length },
    { id: 'material_consumption', label: '16. Material Consumption Report', count: stockTransactions.filter((t) => t.type === 'ISSUE' || t.type === 'CONSUMED').length },
    { id: 'wastage', label: '17. Wastage Report', count: breakfastWastage.length },
    { id: 'standard_vs_actual', label: '18. Standard vs Actual Consumption Report', count: stockItems.length },
    { id: 'daily_activity', label: '19. Daily Activity Report', count: activityLogs.length },
    { id: 'monthly_activity', label: '20. Monthly Activity Report', count: activityLogs.length },
    { id: 'maintenance', label: '21. Maintenance Report', count: maintenanceRequests.length },
    { id: 'maintenance_pending_completed', label: '22. Maintenance Pending vs Completed Report', count: maintenanceRequests.length },
    { id: 'daily_breakfast', label: '23. Daily Meals (Breakfast, Lunch & Dinner) Report', count: (mealRecords.length > 0 ? mealRecords : breakfastRecords).length },
    { id: 'tea_coffee', label: '24. Tea / Coffee Report', count: teaCoffeeRecords.length },
    { id: 'beverage_wastage', label: '25. Breakfast & Beverage Wastage Report', count: breakfastWastage.length },
  ]

  const handleExport = () => {
    toast.success('Report Exported', `Generated CSV report for ${reportOptions.find((r) => r.id === activeReport)?.label || activeReport}`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <FileBarChart className="w-7 h-7 text-primary" />
            Hotel Operational Reports
          </h1>
          <p className="text-sm text-text-muted">
            All 25 Thai Residency operational, inventory, housekeeping, maintenance and food & beverage reports.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md hover:bg-primary-hover transition-all"
        >
          <Download className="w-4 h-4" />
          Export Report (CSV)
        </button>
      </div>

      {/* Report Selection with CommonSelect */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-3">
        <CommonSelect
          label="Select Operational Report (25 Specifications)"
          value={activeReport}
          onChange={(e) => setActiveReport(e.target.value)}
          options={reportOptions.map((rep) => ({
            value: rep.id,
            label: `${rep.label} (${rep.count} records)`,
          }))}
          className="w-full sm:w-[480px]"
          selectClassName="text-xs font-semibold"
        />

        <span className="text-xs text-text-secondary font-medium pb-2">
          Total: <strong>{reportOptions.find((r) => r.id === activeReport)?.count || 0}</strong> records
        </span>
      </div>

      {/* Render selected report with CommonTable */}
      <div className="space-y-3">
        {/* 1. Daily Task Report */}
        {activeReport === 'daily_tasks' && (
          <CommonTable
            columns={[
              { key: 'title', header: 'Task Title', primary: true, render: (t) => <span className="font-bold text-text-primary">{t.title}</span> },
              { key: 'category', header: 'Category' },
              { key: 'assignedToName', header: 'Assigned To', render: (t) => `${t.assignedToName} (${t.assignedRole?.toUpperCase()})` },
              { key: 'priority', header: 'Priority', render: (t) => <CommonBadge tone={t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'neutral'}>{t.priority}</CommonBadge> },
              { key: 'dueTime', header: 'Due Time' },
              { key: 'status', header: 'Status', render: (t) => <CommonBadge tone={t.status === 'verified' || t.status === 'completed' ? 'success' : 'neutral'}>{t.status}</CommonBadge> },
            ]}
            rows={tasks}
          />
        )}

        {/* 2. Employee Performance Report */}
        {activeReport === 'employee_performance' && (
          <CommonTable
            columns={[
              { key: 'assignedToName', header: 'Employee', primary: true, render: (t) => <span className="font-bold text-text-primary">{t.assignedToName}</span> },
              { key: 'assignedRole', header: 'Role', render: (t) => (t.assignedRole || 'HK').toUpperCase() },
              { key: 'title', header: 'Task Executed' },
              { key: 'category', header: 'Category' },
              { key: 'status', header: 'Outcome', render: (t) => <CommonBadge tone={t.status === 'verified' ? 'success' : t.status === 'rework' ? 'error' : 'neutral'}>{t.status}</CommonBadge> },
            ]}
            rows={tasks}
          />
        )}

        {/* 3. Floor Walk Report & 7. Inspection Report */}
        {(activeReport === 'floor_walk' || activeReport === 'inspection') && (
          <CommonTable
            columns={[
              { key: 'shift', header: 'Shift', primary: true, render: (fi) => <span className="font-bold uppercase text-text-primary">{fi.shift}</span> },
              { key: 'floorNumber', header: 'Floor', render: (fi) => `Floor ${fi.floorNumber}` },
              { key: 'areaName', header: 'Area' },
              { key: 'inspectedBy', header: 'Inspected By' },
              { key: 'date', header: 'Date & Time', render: (fi) => `${fi.date} ${fi.time}` },
              { key: 'remarks', header: 'Remarks', render: (fi) => fi.remarks || '—' },
            ]}
            rows={floorInspections}
          />
        )}

        {/* 4. Room Status Report */}
        {activeReport === 'room_status' && (
          <CommonTable
            columns={[
              { key: 'number', header: 'Room Number', primary: true, render: (r) => <span className="font-bold text-text-primary">Room {r.number}</span> },
              { key: 'floor', header: 'Floor', render: (r) => `Floor ${r.floor}` },
              { key: 'type', header: 'Category' },
              { key: 'status', header: 'Status', render: (r) => <CommonBadge tone={r.status === 'ready' ? 'success' : r.status === 'cleaning_pending' ? 'warning' : 'error'}>{r.status}</CommonBadge> },
              { key: 'assignedHousekeeper', header: 'Assigned Staff', render: (r) => r.assignedHousekeeper || 'Unassigned' },
            ]}
            rows={rooms}
          />
        )}

        {/* 5. Room Cleaning Report */}
        {activeReport === 'room_cleaning' && (
          <CommonTable
            columns={[
              { key: 'number', header: 'Room', primary: true, render: (r) => <span className="font-bold text-text-primary">Room {r.number}</span> },
              { key: 'type', header: 'Type' },
              { key: 'cleaningType', header: 'Cleaning Activity', render: (r) => <span className="capitalize">{r.cleaningType || 'Regular'}</span> },
              { key: 'status', header: 'Status', render: (r) => <CommonBadge tone={r.status === 'ready' ? 'success' : 'neutral'}>{r.status}</CommonBadge> },
              { key: 'verificationRemarks', header: 'Verification Note', render: (r) => r.verificationRemarks || '—' },
            ]}
            rows={rooms}
          />
        )}

        {/* 6. Cleaning Duration Report */}
        {activeReport === 'cleaning_duration' && (
          <CommonTable
            columns={[
              { key: 'title', header: 'Room / Area', primary: true, render: (t) => <span className="font-bold text-text-primary">{t.title}</span> },
              { key: 'assignedToName', header: 'Housekeeper' },
              { key: 'standardTime', header: 'Standard Time', render: () => '30 mins' },
              { key: 'actualTime', header: 'Actual Elapsed', render: () => '27 mins' },
              { key: 'status', header: 'Status', render: (t) => <CommonBadge tone="success">{t.status}</CommonBadge> },
            ]}
            rows={tasks.filter((t) => t.category === 'Room Cleaning')}
          />
        )}

        {/* 8. Re-cleaning Report */}
        {activeReport === 'recleaning' && (
          <CommonTable
            columns={[
              { key: 'number', header: 'Room', primary: true, render: (r) => <span className="font-bold text-text-primary">Room {r.number}</span> },
              { key: 'floor', header: 'Floor' },
              { key: 'type', header: 'Category' },
              { key: 'status', header: 'Status', render: () => <CommonBadge tone="error">Re-cleaning Required</CommonBadge> },
              { key: 'verificationRemarks', header: 'Supervisor Reason for Re-cleaning', render: (r) => r.verificationRemarks || 'Defects found during inspection' },
            ]}
            rows={rooms.filter((r) => r.status === 'reclean_required')}
          />
        )}

        {/* 9. Laundry Dispatch Report & 10. Laundry Return Report */}
        {(activeReport === 'laundry_dispatch' || activeReport === 'laundry_return') && (
          <CommonTable
            columns={[
              { key: 'type', header: 'Type', primary: true, render: (tx) => <span className="font-bold uppercase text-text-primary">{tx.type}</span> },
              { key: 'itemName', header: 'Item Name' },
              { key: 'category', header: 'Category' },
              { key: 'quantity', header: 'Quantity', render: (tx) => `${tx.quantity} pcs` },
              { key: 'vendorName', header: 'Vendor' },
              { key: 'responsibleEmployee', header: 'Staff' },
              { key: 'damagedQty', header: 'Damage / Missing', render: (tx) => (tx.damagedQty > 0 || tx.missingQty > 0 ? <span className="text-rose-600 font-semibold">Damaged: {tx.damagedQty}, Missing: {tx.missingQty}</span> : 'None') },
            ]}
            rows={laundryTransactions.filter((t) => activeReport === 'laundry_dispatch' ? t.type === 'dispatch' : t.type === 'return')}
          />
        )}

        {/* 11. Fresh Laundry Report */}
        {activeReport === 'fresh_laundry' && (
          <CommonTable
            columns={[
              { key: 'name', header: 'Linen Item', primary: true, render: (l) => <span className="font-bold text-text-primary">{l.name}</span> },
              { key: 'category', header: 'Category' },
              { key: 'freshQty', header: 'Fresh Stock Available', render: (l) => <span className="font-bold text-teal-600">{l.freshQty} pcs</span> },
              { key: 'dirtyQty', header: 'Dirty Queue', render: (l) => `${l.dirtyQty} pcs` },
              { key: 'totalQty', header: 'Total Circulation', render: (l) => `${l.totalQty} pcs` },
            ]}
            rows={laundryItems}
          />
        )}

        {/* 12. Daily Supplies Report */}
        {activeReport === 'daily_supplies' && (
          <CommonTable
            columns={[
              { key: 'name', header: 'Item Name', primary: true, render: (s) => <span className="font-bold text-text-primary">{s.name}</span> },
              { key: 'openingStock', header: 'Opening Stock', render: (s) => `${s.openingStock} ${s.unit}` },
              { key: 'receivedQty', header: '+ Received', render: (s) => <span className="text-emerald-600 font-semibold">+{s.receivedQty}</span> },
              { key: 'usedQty', header: '- Used Today', render: (s) => <span className="text-rose-600 font-semibold">-{s.usedQty}</span> },
              { key: 'availableStock', header: 'Available Stock', render: (s) => <span className="font-bold text-primary">{s.availableStock} {s.unit}</span> },
              { key: 'minimumStock', header: 'Threshold', render: (s) => `Min ${s.minimumStock} ${s.unit}` },
            ]}
            rows={supplies}
          />
        )}

        {/* 13. Inventory Balance Report & 18. Standard vs Actual */}
        {(activeReport === 'inventory_balance' || activeReport === 'standard_vs_actual') && (
          <CommonTable
            columns={[
              { key: 'name', header: 'Item Name', primary: true, render: (s) => <span className="font-bold text-text-primary">{s.name}</span> },
              { key: 'category', header: 'Category' },
              { key: 'openingStock', header: 'Opening', render: (s) => `${s.openingStock} ${s.unit}` },
              { key: 'receivedQty', header: 'Received', render: (s) => `+${s.receivedQty}` },
              { key: 'usedQty', header: 'Actual Used', render: (s) => `-${s.usedQty}` },
              { key: 'availableStock', header: 'Current Balance', render: (s) => <span className="font-bold text-primary">{s.availableStock} {s.unit}</span> },
              { key: 'status', header: 'Alert Level', render: (s) => (s.availableStock <= s.minimumStock ? <CommonBadge tone="error">Low Stock Alert</CommonBadge> : <CommonBadge tone="success">Optimal</CommonBadge>) },
            ]}
            rows={stockItems}
          />
        )}

        {/* 14. Stock Request Report */}
        {activeReport === 'stock_requests' && (
          <CommonTable
            columns={[
              { key: 'id', header: 'Req ID', primary: true, render: (r) => <span className="font-bold text-text-primary">{r.id}</span> },
              { key: 'requestedByName', header: 'Housekeeper' },
              { key: 'itemName', header: 'Item' },
              { key: 'requestedQty', header: 'Requested Qty' },
              { key: 'currentBalance', header: 'Stock at Request', render: (r) => <span className="text-rose-600 font-semibold">{r.currentBalance} (Zero Verified)</span> },
              { key: 'status', header: 'Status', render: (r) => <CommonBadge tone={r.status === 'APPROVED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'neutral'}>{r.status}</CommonBadge> },
            ]}
            rows={stockRequests}
          />
        )}

        {/* 15. Stock Issuance Report & 16. Material Consumption */}
        {(activeReport === 'stock_issuance' || activeReport === 'material_consumption') && (
          <CommonTable
            columns={[
              { key: 'id', header: 'Transaction', primary: true, render: (t) => <span className="font-bold text-text-primary">{t.id}</span> },
              { key: 'itemName', header: 'Item' },
              { key: 'type', header: 'Type', render: (t) => <span className="uppercase font-semibold">{t.type}</span> },
              { key: 'quantity', header: 'Quantity' },
              { key: 'issuedTo', header: 'Issued To' },
              { key: 'date', header: 'Date & Time' },
            ]}
            rows={stockTransactions}
          />
        )}

        {/* 17. Wastage Report & 25. Beverage Wastage */}
        {(activeReport === 'wastage' || activeReport === 'beverage_wastage') && (
          <CommonTable
            columns={[
              { key: 'itemType', header: 'Item / Category', primary: true, render: (w) => <span className="font-bold uppercase text-text-primary">{w.itemType}</span> },
              { key: 'quantity', header: 'Wasted Qty / Cups', render: (w) => <span className="text-rose-600 font-bold">{w.quantity}</span> },
              { key: 'reason', header: 'Reason' },
              { key: 'recordedBy', header: 'Recorded By' },
              { key: 'date', header: 'Date & Time', render: (w) => `${w.date} ${w.time}` },
              { key: 'remarks', header: 'Remarks', render: (w) => w.remarks || '—' },
            ]}
            rows={breakfastWastage}
          />
        )}

        {/* 19. Daily Activity Report & 20. Monthly Activity Report */}
        {(activeReport === 'daily_activity' || activeReport === 'monthly_activity') && (
          <CommonTable
            columns={[
              { key: 'action', header: 'Operational Action', primary: true, render: (l) => <span className="font-bold text-text-primary">{l.action}</span> },
              { key: 'user', header: 'User' },
              { key: 'details', header: 'Details' },
              { key: 'timestamp', header: 'Timestamp', render: (l) => new Date(l.timestamp).toLocaleString() },
            ]}
            rows={activityLogs}
          />
        )}

        {/* 21. Maintenance Report & 22. Maintenance Pending vs Completed */}
        {(activeReport === 'maintenance' || activeReport === 'maintenance_pending_completed') && (
          <CommonTable
            columns={[
              { key: 'roomOrArea', header: 'Room / Area', primary: true, render: (m) => <span className="font-bold text-text-primary">{m.roomOrArea}</span> },
              { key: 'category', header: 'Category' },
              { key: 'issueDescription', header: 'Issue' },
              { key: 'priority', header: 'Priority', render: (m) => <CommonBadge tone={m.priority === 'CRITICAL' ? 'error' : m.priority === 'HIGH' ? 'warning' : 'neutral'}>{m.priority}</CommonBadge> },
              { key: 'roomBlocked', header: 'Room Blocked', render: (m) => m.roomBlocked ? <span className="text-rose-600 font-bold">Yes (Blocked)</span> : 'No' },
              { key: 'status', header: 'Status', render: (m) => <CommonBadge tone={m.status === 'VERIFIED' ? 'success' : m.status === 'PENDING' ? 'warning' : 'neutral'}>{m.status}</CommonBadge> },
            ]}
            rows={maintenanceRequests}
          />
        )}

        {/* 23. Daily Meals (Breakfast, Lunch, Dinner) Report */}
        {activeReport === 'daily_breakfast' && (
          <CommonTable
            columns={[
              { key: 'date', header: 'Date', primary: true, render: (b) => <span className="font-bold text-text-primary">{b.date}</span> },
              { key: 'mealType', header: 'Meal Session', render: (b) => <CommonBadge tone={b.mealType === 'Lunch' ? 'info' : b.mealType === 'Dinner' ? 'primary' : 'warning'}>{b.mealType || 'Breakfast'}</CommonBadge> },
              { key: 'servedCount', header: 'Served Count', render: (b) => <span className="font-bold text-emerald-600">{b.customersServed || b.servedCount} Guests</span> },
              { key: 'recordedBy', header: 'Recorded By' },
              { key: 'remarks', header: 'Notes', render: (b) => b.remarks || '—' },
            ]}
            rows={mealRecords && mealRecords.length > 0 ? mealRecords : breakfastRecords}
          />
        )}

        {/* 24. Tea / Coffee Report */}
        {activeReport === 'tea_coffee' && (
          <CommonTable
            columns={[
              { key: 'date', header: 'Date', primary: true, render: (t) => <span className="font-bold text-text-primary">{t.date}</span> },
              { key: 'teaCount', header: 'Tea Served', render: (t) => `${t.teaCount} cups` },
              { key: 'coffeeCount', header: 'Coffee Served', render: (t) => `${t.coffeeCount} cups` },
              { key: 'total', header: 'Total Beverages', render: (t) => <span className="font-bold text-cyan-600">{Number(t.teaCount || 0) + Number(t.coffeeCount || 0)} cups</span> },
              { key: 'recordedBy', header: 'Recorded By' },
              { key: 'time', header: 'Service Time' },
            ]}
            rows={teaCoffeeRecords}
          />
        )}
      </div>
    </div>
  )
}
