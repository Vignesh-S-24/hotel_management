import { daysAgo, hoursAgo } from '../utils/formatDate'

const base = { location: '', assigneeId: null, startedAt: null, resolvedAt: null, resolution: '', updates: [] }

// Issue texts are taken from the APK's demo repairs.
export const maintenanceSeed = [
  { id: 'm-3001', roomId: 'r-108', title: 'Shower drain blocked', category: 'Plumbing', priority: 'high', status: 'reported', reportedBy: 's-ashok', description: 'Water pools in the shower tray during cleaning.', createdAt: hoursAgo(5) },
  { id: 'm-3002', roomId: 'r-205', title: 'Wash basin leaking', category: 'Plumbing', priority: 'high', status: 'in_progress', reportedBy: 's-ashok', assigneeId: 's-murali', description: 'Leak under the wash basin. Floor wet.', createdAt: daysAgo(1, 15, 0), startedAt: hoursAgo(3), updates: [{ at: hoursAgo(3), text: 'Plumber Murali on site. Replacing P-trap.' }] },
  { id: 'm-3003', roomId: 'r-301', title: 'AC not cooling', category: 'AC / Cooling', priority: 'critical', status: 'reported', reportedBy: 's-priya', description: 'Unit runs but air is warm. Guest complained last night.', createdAt: hoursAgo(2) },
  { id: 'm-3004', roomId: 'r-207', title: 'TV not powering on', category: 'TV / Media', priority: 'normal', status: 'completed', reportedBy: 's-kavya', assigneeId: 's-murali', description: 'No signal on TV.', createdAt: daysAgo(2, 19, 0), startedAt: daysAgo(1, 10, 0), resolvedAt: daysAgo(1, 10, 45), resolution: 'Power cable reseated and set-top box reset. Repaired while occupied.' },
  { id: 'm-3005', roomId: 'r-110', title: 'Bedside lamp not working', category: 'Electrical', priority: 'low', status: 'completed', reportedBy: 's-bala', assigneeId: 's-murali', description: 'Left bedside lamp does not switch on.', createdAt: daysAgo(4, 11, 0), startedAt: daysAgo(4, 14, 0), resolvedAt: daysAgo(4, 14, 30), resolution: 'Bulb holder replaced.' },
  { id: 'm-3006', roomId: null, location: 'Reception Area', title: 'Key card reader slow', category: 'Door Lock', priority: 'normal', status: 'in_progress', reportedBy: 's-kavya', assigneeId: 's-murali', description: 'Encoder takes several attempts to write key cards.', createdAt: daysAgo(1, 20, 0), startedAt: hoursAgo(20) },
  { id: 'm-3007', roomId: 'r-306', title: 'Low hot water pressure', category: 'Plumbing', priority: 'normal', status: 'completed', reportedBy: 's-priya', assigneeId: 's-murali', description: 'Guest reported weak hot water flow in the shower.', createdAt: daysAgo(6, 9, 0), startedAt: daysAgo(6, 12, 0), resolvedAt: daysAgo(6, 13, 10), resolution: 'Aerator descaled; pressure normal.' },
  { id: 'm-3008', roomId: 'r-202', title: 'Wardrobe hinge broken', category: 'Furniture', priority: 'low', status: 'completed', reportedBy: 's-arun', assigneeId: 's-murali', description: 'Right wardrobe door hangs loose.', createdAt: daysAgo(9, 10, 0), startedAt: daysAgo(8, 11, 0), resolvedAt: daysAgo(8, 11, 40), resolution: 'Hinge replaced.' },
].map((r) => ({ ...base, ...r }))
