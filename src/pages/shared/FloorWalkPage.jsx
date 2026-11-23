import { useState } from 'react'
import {
  Footprints,
  Sun,
  Moon,
  Plus,
  Calendar,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { FLOOR_WALK_SHIFTS, ROLES } from '../../utils/constants'
import { useToast } from '../../components/common/CommonToast'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonModal from '../../components/common/CommonModal'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'

export default function FloorWalkPage() {
  const { user } = useAuth()
  const { floors, floorInspections, addFloorInspection } = useData()
  const toast = useToast()

  const [activeShiftFilter, setActiveShiftFilter] = useState('all')
  const [showLogModal, setShowLogModal] = useState(false)

  // Form states
  const [shift, setShift] = useState(FLOOR_WALK_SHIFTS.MORNING)
  const [floorNumber, setFloorNumber] = useState(1)
  const [areaName, setAreaName] = useState('1st Floor Main Corridor & Elevator')
  const [inspectionTime, setInspectionTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  const [remarks, setRemarks] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoList, setPhotoList] = useState([])

  const canLog = user.role === ROLES.SUPERVISOR || user.role === ROLES.OWNER

  const filteredInspections = floorInspections.filter((fi) => {
    if (activeShiftFilter === 'all') return true
    return fi.shift === activeShiftFilter
  })

  const handleAddSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500',
    ]
    const chosen = samples[Math.floor(Math.random() * samples.length)]
    setPhotoList([...photoList, chosen])
  }

  const handleManualAddPhoto = () => {
    if (!photoUrl.trim()) return
    setPhotoList([...photoList, photoUrl.trim()])
    setPhotoUrl('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (photoList.length === 0) {
      toast.error('Inspection Photo Required', 'Floor walk inspections must include at least one photo record.')
      return
    }

    addFloorInspection({
      shift,
      floorNumber: Number(floorNumber),
      areaName,
      date: new Date().toISOString().split('T')[0],
      time: inspectionTime,
      remarks,
      photos: photoList,
      status: 'completed',
    })

    toast.success('Floor Walk Submitted', `${shift.toUpperCase()} inspection recorded.`)
    setShowLogModal(false)
    setRemarks('')
    setPhotoList([])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Footprints className="w-7 h-7 text-primary" />
            Daily Floor Walk Inspections
          </h1>
          <p className="text-sm text-text-muted">
            Mandatory two floor walks per day (Morning & Evening) with photo proof and remarks.
          </p>
        </div>

        {canLog && (
          <CommonButton
            variant="primary"
            icon={Plus}
            onClick={() => setShowLogModal(true)}
          >
            Record Floor Walk
          </CommonButton>
        )}
      </div>

      {/* Two Shift Cards Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Morning Inspection
              </div>
              <div className="text-sm font-semibold text-text mt-0.5">
                Between 08:30 AM – 11:30 AM
              </div>
              <div className="text-xs text-text-muted">Corridors, Lobbies, Service Carts</div>
            </div>
          </div>
          <CommonBadge tone="success">Active Shift</CommonBadge>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400">
                Evening Inspection
              </div>
              <div className="text-sm font-semibold text-text mt-0.5">
                Between 05:30 PM – 08:30 PM
              </div>
              <div className="text-xs text-text-muted">Lighting, Noise levels, Dustbins</div>
            </div>
          </div>
          <CommonBadge tone="neutral">Pending / Later</CommonBadge>
        </div>
      </div>

      {/* Filter and Shift Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveShiftFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            activeShiftFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-muted hover:text-text'
          }`}
        >
          All Floor Walks ({floorInspections.length})
        </button>
        <button
          onClick={() => setActiveShiftFilter('morning')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            activeShiftFilter === 'morning'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          Morning Shifts
        </button>
        <button
          onClick={() => setActiveShiftFilter('evening')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            activeShiftFilter === 'evening'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          Evening Shifts
        </button>
      </div>

      {/* Inspection History Timeline Cards */}
      <div className="space-y-4">
        {filteredInspections.map((fi) => (
          <div
            key={fi.id}
            className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-3">
                <CommonBadge
                  tone={fi.shift === 'morning' ? 'warning' : 'violet'}
                  className="uppercase font-bold"
                >
                  {fi.shift === 'morning' ? <Sun className="w-3.5 h-3.5 mr-1 inline" /> : <Moon className="w-3.5 h-3.5 mr-1 inline" />}
                  {fi.shift} Floor Walk
                </CommonBadge>
                <span className="font-bold text-sm text-text">
                  Floor {fi.floorNumber} — {fi.areaName}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {fi.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {fi.time}
                </span>
                <CommonBadge tone="success" dot>
                  Submitted
                </CommonBadge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-text-muted block mb-1">
                  Supervisor Remarks & Observations:
                </span>
                <p className="text-xs text-text bg-surface-subtle p-3 rounded-xl border border-border/70">
                  {fi.remarks}
                </p>
              </div>

              {fi.photos && fi.photos.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-text-muted block mb-1.5">
                    Floor Inspection Photos ({fi.photos.length}):
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {fi.photos.map((img, idx) => (
                      <div key={idx} className="relative group shrink-0">
                        <img
                          src={img}
                          alt="Floor Walk inspection"
                          className="w-28 h-24 object-cover rounded-xl border border-border cursor-pointer hover:opacity-90 shadow-sm"
                          onClick={() => window.open(img, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-text-muted pt-2 border-t border-border flex items-center justify-between">
                <span>Inspected by: <strong className="text-text">{fi.inspectedBy}</strong></span>
                <span>ID: {fi.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Floor Walk Modal with CommonModal */}
      <CommonModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Record Daily Floor Walk"
        description="Submit morning or evening floor inspection record with mandatory proof photos."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <CommonSelect
              label="Shift"
              required
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              options={[
                { value: FLOOR_WALK_SHIFTS.MORNING, label: 'Morning Inspection' },
                { value: FLOOR_WALK_SHIFTS.EVENING, label: 'Evening Inspection' },
              ]}
            />

            <CommonSelect
              label="Select Floor"
              required
              value={floorNumber}
              onChange={(e) => {
                const num = Number(e.target.value)
                setFloorNumber(num)
                const found = floors.find((f) => f.floorNumber === num)
                if (found) setAreaName(found.name)
              }}
              options={floors.map((f) => ({
                value: f.floorNumber,
                label: `Floor ${f.floorNumber} (${f.name})`,
              }))}
            />
          </div>

          <CommonInput
            label="Specific Inspection Area"
            required
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="e.g. Lift lobby, East Wing hallway, emergency exit"
          />

          <CommonInput
            label="Inspection Time"
            value={inspectionTime}
            onChange={(e) => setInspectionTime(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Inspection Remarks & Cleanliness Notes <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State corridor condition, floor polish, lighting, trash clearance, HK carts..."
              className="field-control"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                Inspection Photos <span className="text-error">* (Minimum 1 Required)</span>
              </label>
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="text-xs text-primary hover:underline font-medium"
              >
                + Add Mock Photo
              </button>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste image link..."
                className="field-control flex-1"
              />
              <CommonButton
                variant="secondary"
                size="md"
                onClick={handleManualAddPhoto}
              >
                Attach
              </CommonButton>
            </div>

            {photoList.length > 0 && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-surface-muted rounded-xl border border-border">
                {photoList.map((url, i) => (
                  <div key={i} className="relative shrink-0">
                    <img src={url} alt="Proof" className="w-16 h-16 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setPhotoList(photoList.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <CommonButton
              variant="secondary"
              onClick={() => setShowLogModal(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
            >
              Submit Inspection Report
            </CommonButton>
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
