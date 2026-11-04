import { daysAgo, hoursAgo } from '../utils/formatDate'

const BEDS = { Standard: 'Queen', Deluxe: 'King', Double: '2 × Single', Family: 'King + Single' }
const OCCUPANCY = { Standard: 2, Deluxe: 2, Double: 2, Family: 4 }

// [number, type, status, active?]
const layout = [
  ['101', 'Standard', 'occupied'],
  ['102', 'Standard', 'cleaningRequired'],
  ['103', 'Deluxe', 'readyToUse'],
  ['104', 'Deluxe', 'occupied'],
  ['105', 'Double', 'cleaningInProgress'],
  ['106', 'Double', 'readyToUse'],
  ['107', 'Family', 'occupied'],
  ['108', 'Standard', 'repairRequired'],
  ['109', 'Standard', 'vacant'],
  ['110', 'Deluxe', 'inspectionFailed'],
  ['201', 'Standard', 'occupied'],
  ['202', 'Deluxe', 'readyToUse'],
  ['203', 'Deluxe', 'cleaningAssigned'],
  ['204', 'Double', 'occupied'],
  ['205', 'Double', 'underRepair'],
  ['206', 'Family', 'readyToUse'],
  ['207', 'Standard', 'occupied'],
  ['208', 'Deluxe', 'inspectionPending'],
  ['209', 'Standard', 'cleaningRequired'],
  ['210', 'Family', 'occupied'],
  ['301', 'Deluxe', 'occupied'],
  ['302', 'Deluxe', 'readyToUse'],
  ['303', 'Standard', 'occupied'],
  ['304', 'Standard', 'cleaningAssigned'],
  ['305', 'Double', 'inspectionPending'],
  ['306', 'Double', 'occupied'],
  ['307', 'Family', 'vacant'],
  ['308', 'Standard', 'readyToUse'],
  ['309', 'Standard', 'vacant', false],
]

export const roomsSeed = layout.map(([number, type, status, active = true], i) => ({
  id: `r-${number}`,
  number,
  floor: Number(number[0]),
  type,
  status,
  active,
  beds: BEDS[type],
  maxOccupancy: OCCUPANCY[type],
  notes: active ? '' : 'Deactivated for refurbishment (mock).',
  lastCleanedAt: daysAgo((i % 3) + 1, 9 + (i % 5)),
  lastInspectedAt: daysAgo((i % 3) + 1, 11 + (i % 5)),
  updatedAt: hoursAgo((i % 9) + 1),
}))
