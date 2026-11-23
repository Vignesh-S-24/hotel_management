import { useState, useEffect } from 'react'
import {
  Timer,
  Play,
  Square,
  CheckSquare,
  Camera,
  Package,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { DIGITAL_CHECKLIST_SECTIONS, ROOM_STATUS } from '../../utils/constants'
import CommonButton from '../../components/common/CommonButton'
import CommonBadge from '../../components/common/CommonBadge'
import CommonInput from '../../components/common/CommonInput'
import CommonSelect from '../../components/common/CommonSelect'
import { useToast } from '../../components/common/CommonToast'

export default function CleaningTimerChecklist() {
  const { user } = useAuth()
  const {
    rooms,
    submitRoomCleaning,
    housekeeperStock,
    recordRoomMaterialConsumption,
    recordWastage,
  } = useData()
  const toast = useToast()

  // Find room assigned to HK currently in progress or assigned
  const myAssignedRooms = (rooms || []).filter(
    (r) =>
      r.assignedHkId === user?.staffId ||
      r.status === ROOM_STATUS.CLEANING_ASSIGNED ||
      r.status === ROOM_STATUS.CLEANING_IN_PROGRESS ||
      r.status === ROOM_STATUS.RE_CLEANING_REQUIRED
  )

  const [selectedRoomId, setSelectedRoomId] = useState(
    myAssignedRooms[0]?.id || (rooms && rooms[0]?.id) || null
  )

  const activeRoom = (rooms || []).find((r) => r.id === selectedRoomId)

  // Cleaning Timer State (Persists across reloads via localStorage using stored timestamps)
  const timerStorageKey = `tr.timer.${selectedRoomId}`
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Digital Checklist State
  const [checkedItems, setCheckedItems] = useState({})
  const [photos, setPhotos] = useState([])
  const [remarks, setRemarks] = useState('')
  const [consumedItems, setConsumedItems] = useState([])

  // Daily facility times (Section 9.5)
  const [facilityTimes, setFacilityTimes] = useState({
    carParkingTime: '10:00 AM',
    receptionAreaTime: '08:30 AM',
    floorCleaningTime: '11:00 AM',
    stepsCleaningTime: '02:00 PM',
    kitchenWasteDone: true,
  })

  // Timer interval setup based on stored timestamp
  useEffect(() => {
    const storedStart = localStorage.getItem(timerStorageKey)
    if (storedStart) {
      setTimerRunning(true)
      const startMs = Number(storedStart)
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)))
    } else {
      setTimerRunning(false)
      setElapsedSeconds(0)
    }
  }, [selectedRoomId, timerStorageKey])

  useEffect(() => {
    let interval = null
    if (timerRunning) {
      interval = setInterval(() => {
        const storedStart = localStorage.getItem(timerStorageKey)
        if (storedStart) {
          setElapsedSeconds(Math.floor((Date.now() - Number(storedStart)) / 1000))
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerStorageKey])

  const handleStartTimer = () => {
    const now = Date.now()
    localStorage.setItem(timerStorageKey, String(now))
    setTimerRunning(true)
    toast.info('Cleaning Timer Started', `Room ${activeRoom?.number} cleaning timer is ticking.`)
  }

  const handleStopTimer = () => {
    localStorage.removeItem(timerStorageKey)
    setTimerRunning(false)
    toast.info('Timer Paused', `Elapsed cleaning time recorded: ${formatTimer(elapsedSeconds)}`)
  }

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Checklist completion calculation
  const allSections = [
    ...DIGITAL_CHECKLIST_SECTIONS.bedroom,
    ...DIGITAL_CHECKLIST_SECTIONS.bathroom,
    ...DIGITAL_CHECKLIST_SECTIONS.amenities,
    ...DIGITAL_CHECKLIST_SECTIONS.general,
  ]
  const totalCount = allSections.length
  const completedCount = allSections.filter((item) => checkedItems[item.id]).length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
    ]
    const nextPhoto = samplePhotos[photos.length % samplePhotos.length]
    setPhotos([...photos, nextPhoto])
    toast.success('Photo Attached', 'Cleaning completion proof photo added.')
  }

  const handleSubmitCleaning = () => {
    // Validate mandatory items
    const mandatoryMissing = allSections.filter((i) => i.mandatory && !checkedItems[i.id])
    if (mandatoryMissing.length > 0) {
      toast.error('Checklist Incomplete', `Please check all mandatory items (${mandatoryMissing.length} remaining).`)
      return
    }

    if (!selectedRoomId) return

    submitRoomCleaning(selectedRoomId, {
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500'],
      remarks: remarks || `Cleaned in ${formatTimer(elapsedSeconds)}. Checklist completed 100%.`,
    })

    localStorage.removeItem(timerStorageKey)
    setTimerRunning(false)
    setElapsedSeconds(0)
    setCheckedItems({})
    toast.success('Submitted for FO Verification', `Room ${activeRoom?.number} moved to INSPECTION_PENDING for Front Office.`)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner & Room Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Digital Cleaning Checklist & Cleaning Timer
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Live cleaning execution, real-time stopwatch, material consumption and 4-tier digital verification.
          </p>
        </div>

        {/* Room Switcher */}
        <div className="w-full sm:w-72">
          <CommonSelect
            label="Select Room"
            value={selectedRoomId || ''}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            options={(rooms || []).map((r) => ({
              value: r.id,
              label: `Room ${r.number} (${r.type}) — ${r.status}`,
            }))}
          />
        </div>
      </div>

      {/* Timer Bar & Status Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-blue-200">Room Cleaning Stopwatch</span>
            <CommonBadge tone={timerRunning ? 'success' : 'neutral'}>
              {timerRunning ? 'Running' : 'Paused / Ready'}
            </CommonBadge>
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-white">
            {formatTimer(elapsedSeconds)}
          </div>
          <p className="text-[11px] text-blue-200 mt-1">
            Persists automatically across browser reloads using stored timestamps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!timerRunning ? (
            <CommonButton
              onClick={handleStartTimer}
              variant="success"
              icon={Play}
              size="md"
            >
              Start Cleaning
            </CommonButton>
          ) : (
            <CommonButton
              onClick={handleStopTimer}
              variant="secondary"
              icon={Square}
              size="md"
            >
              Pause Timer
            </CommonButton>
          )}

          <CommonButton
            onClick={handleSubmitCleaning}
            icon={Send}
            size="md"
          >
            Submit for FO Verification
          </CommonButton>
        </div>
      </div>

      {/* Progress Metric */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-text-secondary">Digital Checklist Progress</div>
          <div className="text-lg font-black text-text-primary">
            {completedCount} / {totalCount} Items Completed ({progressPercent}%)
          </div>
        </div>
        <div className="w-full sm:w-64 bg-surface-muted h-3 rounded-full overflow-hidden border border-border">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4-Part Digital Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bedroom */}
        <div className="bg-surface rounded-lg border border-border p-4 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center justify-between">
            <span>9.1 Bedroom</span>
            <span className="text-[10px] text-text-secondary font-normal">5 Items</span>
          </h2>
          <div className="space-y-2">
            {DIGITAL_CHECKLIST_SECTIONS.bedroom.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer hover:bg-surface-muted/50 p-1.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.id])}
                  onChange={() => toggleCheck(item.id)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className={checkedItems[item.id] ? 'line-through text-text-secondary' : 'font-medium'}>
                  {item.label} {item.mandatory && <span className="text-rose-500">*</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Bathroom */}
        <div className="bg-surface rounded-lg border border-border p-4 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center justify-between">
            <span>9.2 Bathroom</span>
            <span className="text-[10px] text-text-secondary font-normal">5 Items</span>
          </h2>
          <div className="space-y-2">
            {DIGITAL_CHECKLIST_SECTIONS.bathroom.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer hover:bg-surface-muted/50 p-1.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.id])}
                  onChange={() => toggleCheck(item.id)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className={checkedItems[item.id] ? 'line-through text-text-secondary' : 'font-medium'}>
                  {item.label} {item.mandatory && <span className="text-rose-500">*</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-surface rounded-lg border border-border p-4 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center justify-between">
            <span>9.3 Amenities</span>
            <span className="text-[10px] text-text-secondary font-normal">7 Items</span>
          </h2>
          <div className="space-y-2">
            {DIGITAL_CHECKLIST_SECTIONS.amenities.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer hover:bg-surface-muted/50 p-1.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.id])}
                  onChange={() => toggleCheck(item.id)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className={checkedItems[item.id] ? 'line-through text-text-secondary' : 'font-medium'}>
                  {item.label} {item.mandatory && <span className="text-rose-500">*</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* General */}
        <div className="bg-surface rounded-lg border border-border p-4 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center justify-between">
            <span>9.4 General</span>
            <span className="text-[10px] text-text-secondary font-normal">5 Items</span>
          </h2>
          <div className="space-y-2">
            {DIGITAL_CHECKLIST_SECTIONS.general.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer hover:bg-surface-muted/50 p-1.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.id])}
                  onChange={() => toggleCheck(item.id)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className={checkedItems[item.id] ? 'line-through text-text-secondary' : 'font-medium'}>
                  {item.label} {item.mandatory && <span className="text-rose-500">*</span>}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Proof Photos & Housekeeper Remarks */}
      <div className="bg-surface rounded-lg border border-border p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-primary">Cleaning Completion Photos</span>
            <CommonButton
              variant="ghost"
              size="sm"
              icon={Camera}
              onClick={handleAddSamplePhoto}
            >
              Attach Photo Proof
            </CommonButton>
          </div>
          {photos.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-border text-center text-xs text-text-secondary">
              No photos attached yet. Click above to attach mandatory inspection photos.
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  alt={`Proof ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <CommonInput
            label="Housekeeper Remarks & Material Consumption Note"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. 50ml R2 used, linen replaced, suite smelling fresh..."
          />
        </div>
      </div>
    </div>
  )
}
