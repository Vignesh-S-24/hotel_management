# StayOps: Hotel Management Web (demo)

A responsive, frontend-only hotel operations app for **Thai Residency**, built from an analysis of `app-release.apk`. It has two independent panels in one React app:

| Panel | Route | Represents (from the APK) |
|---|---|---|
| Admin | `/admin/*` | Super Admin: rooms, housekeeping, inspections, staff, inventory, maintenance (repairs), reports, settings |
| Client | `/client/*` | **Reception / front desk**: room board, check-out, mark occupied, housekeeping and maintenance requests, assigned inspections, own reports |

> The APK has no guest or owner "client" role. See [docs/APK_ANALYSIS.md](docs/APK_ANALYSIS.md) for the evidence, the role mapping, and which features are confirmed and which are assumptions.

**All data is mock data.** None of it represents real hotel records. There is no backend, and the route guards are for demonstration only: real security requires server-side enforcement.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
npm run lint
```

Requires Node 18 or later.

## Demo accounts

The password for all accounts is **`demo1234`**. You can sign in with either the email or the Employee ID.

| User | Email | ID | Panel |
|---|---|---|---|
| Vikram Rao | admin@stayops.in | SO-001 | Admin |
| Priya Sharma | priya@stayops.in | SO-101 | Client (Reception) |
| Kavya Nair | kavya@stayops.in | SO-102 | Client (Reception) |

- On the login page, tap a demo account to fill the form.
- Use the avatar menu → **Switch to …** to change roles without signing out.
- **Settings → Demo & roles → Reset demo data** restores the original data and passwords.

## Try the end-to-end flow

1. **Reception** (Priya): Rooms → an occupied room → **Check Out**. The room becomes *Cleaning Required* and the admin is notified.
2. **Admin**: Housekeeping → *Waiting* tab → **Assign** a housekeeper → **Start** → **Submit**. Tick the checklist and choose an inspector. The Start and Submit steps simulate the housekeeper's mobile app.
3. **Inspector** (Priya, or the admin under Inspections): **Inspect now** → Approve, or Reject with flagged defects. Approved rooms become *Ready to Use*; rejected rooms go back to the housekeeper with an open corrective action.
4. **Reception**: Rooms → *Ready now* → **Mark Occupied**.
5. **Maintenance:**
   - Reception reports an issue.
   - The admin assigns staff → **Start Repair** → **Mark Repair Complete**, entering the resolution.
   - The room returns to *Cleaning Required*, and the reporter sees the resolution remarks.

## Tech stack

React 18, Vite 5, JavaScript/JSX, Tailwind CSS 3, React Router 6, React Hook Form with Yup, and Lucide icons. No UI kit and no TypeScript.

## Project structure

```
src/
  theme/            colors.js, typography.js, spacing.js, index.js (applyTheme → CSS variables)
  styles/index.css  Tailwind layers + base component classes
  components/
    common/         CommonButton, Input, Select, Modal, Drawer, Table, Pagination, Search,
                    Badge, Card (+ StatCard), Loader (+ skeletons), EmptyState, ConfirmDialog, Toast
    layout/         AdminSidebar, ClientSidebar, AdminHeader, ClientHeader, Breadcrumbs (+ shared shells)
    shared/         Domain pieces used by both panels: status badges, charts, report view,
                    inspection/maintenance forms, notifications view, profile forms
  layouts/          AuthLayout, AdminLayout, ClientLayout
  pages/auth|admin|client/…, NotFound, Unauthorized
  context/          AuthContext (demo auth), DataContext (mock store + workflow), ThemeContext
  routes/           AppRoutes (lazy-loaded), ProtectedRoute, navigation.js (per-panel menus)
  hooks/            useLocalStorage, useDebounce, useTableData, useDialogBehavior, useStaffOptions, …
  data/             Seed mock data (users, rooms, housekeeping, inspections, staff, inventory, …)
  utils/            constants, formatDate, validation, exportCsv
  services/         Placeholder for a future API layer (see README inside)
docs/APK_ANALYSIS.md
```

### Theming

- `src/theme/colors.js` is the single source for the light and dark palettes. Default primary: `#2563EB`.
- `applyTheme()` writes the palette to CSS variables (`--hm-*`). Tailwind maps those variables to utilities such as `bg-primary` and `text-text-secondary`, so changing a hex value re-themes both panels.

### Data and state

- `DataContext` holds all records in React state and persists them to `localStorage` (`hm.data.v1`).
- Actions mirror the APK's workflow: room status transitions, notifications and activity log entries happen automatically.
- Client pages only show the logged-in receptionist's own requests, inspections, reports and notifications.

## Responsive and accessibility notes

- Layouts are tested at 320, 375, 768 and 1440 px with no horizontal page scroll.
- On small screens, tables turn into cards and the sidebar becomes an off-canvas drawer.
- Dialogs trap focus, close on Esc and restore focus afterwards.
- Every form field has a label, and validation errors are announced.

## Known limitations

- **Persistence:** data lives only in the browser's `localStorage`. Clearing site data resets it, and it isn't shared between browsers.
- **Password reset links** are generated in memory and stop working after a page reload.
- **Exports:** "Export PDF" uses the browser's print dialog, and CSV export covers the filtered report data.
- **Not built:** audit log, front-desk handover, housekeeper stock balances and stock-request approval, the common-area daily check sheet, and working-hours configuration (see the analysis document).
# hotel_management
