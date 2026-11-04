# APK analysis: `app-release.apk`

## Method

The APK was unzipped and inspected statically. It was not installed or run.

- **Manifest:** package `com.example.thai_residency`, version 1.0.0, launcher `MainActivity`.
  - The manifest requests no `INTERNET` permission. Release Flutter apps need that permission to make network calls, so all data in the app is local mock data.
- **Framework:** Flutter (`libflutter.so`, `libapp.so`). The Dart code is AOT-compiled, so it can't be decompiled back to source.
  - Evidence came from strings embedded in `libapp.so`: source file paths (`package:thai_residency/...`), class and enum names, and every user-facing label.
- **Branding:** the app is called **StayOps** (`admin@stayops.in`) for the hotel **Thai Residency**.
  - Strings such as "Prototype build", "Prototype demo accounts", "Demo guide & switch role" and "Any password works" show it is a clickable prototype, not a production app.

## Source structure found in the binary

```
screens/auth/         login_screen, splash_screen
screens/admin/        admin_dashboard, rooms_screen, room_detail_screen, housekeeping_screen,
                      assign_sheet, inspection_screen, inventory_screen, repairs_screen,
                      staff_screen, reports_screen, report_range, audit_screen,
                      cleaning_history, reception_management_screen, settings_screen
screens/reception/    reception_dashboard, room_board_screen
screens/housekeeper/  hk_dashboard, my_tasks_screen, task_screen, daily_check_screen, stock_usage_screen
screens/common/       notifications_screen, profile_screen, search_screen, stock_requests_screen,
                      inspector_sheet, availability_sheet, room_actions, demo_guide, nav, overlays
state/app_state.dart, models/models.dart, theme/app_theme.dart, widgets/charts.dart
```

## Confirmed roles

| APK role | Evidence | Responsibilities |
|---|---|---|
| **Super Admin** (`admin@stayops.in`, `SO-001`) | "Super Admin", `screens/admin/*` | Assigns and reassigns cleaning, approves repairs ("Super Admin to review and start the repair"), manages rooms, inventory, staff and reports, and approves stock requests |
| **Reception / Receptionist** (Priya Sharma, Kavya Nair) | `screens/reception/*`, "Front desk", "Receptionists" | Room board; **Check Out** (room becomes Cleaning Required and the Super Admin is notified); **Mark Occupied** for ready rooms; inspects rooms ("Inspections approved by receptionist"); reports repairs; front-desk handover |
| **Housekeeper** (Arun, Ashok, Bala, Kumar) | `screens/housekeeper/*` | My Tasks, Start Cleaning, checklist, Submit for Inspection, daily common-area check, stock usage and requests. "Housekeepers cannot inspect rooms." |
| Inspector | `inspector_sheet.dart`, "Assign inspector" | Not a separate role. It is a responsibility given to a receptionist or the Super Admin. |

**There is no "client", guest, or hotel-owner role in the APK.** There is no booking, billing, or guest-facing screen.

## Confirmed domain rules

- **Room statuses** (enum): vacant, occupied, cleaningRequired, cleaningAssigned, cleaningInProgress, inspectionPending, inspectionFailed, readyToUse, repairRequired, underRepair. Rooms can also be activated or deactivated.
- **Room types:** Standard, Deluxe, Double, Family. Rooms are on floors 1–3.
- **Cleaning flow:** checkout → Cleaning Required → Super Admin assigns a housekeeper → housekeeper starts cleaning → required checklist items are ticked → Submit for Inspection → the inspector approves (room becomes Ready to Use) or rejects with flagged items (room goes back to the housekeeper).
- **Reassignment:** cleaning tasks and inspections can be reassigned, and a reason is required.
- **Checklist items:** bed cleaned, bedsheet changed, towels replaced, toilet/sink/mirror cleaned, soap, water bottles, door lock checked, and so on.
- **Rejection reasons:** bathroom not clean, dust remaining, amenities missing, and others.
- **Repairs:**
  - A reported repair blocks a vacant room from allocation.
  - The Super Admin starts the repair, and on completion the room moves to Cleaning Required.
  - Occupied rooms can be "repaired while occupied".
- **Inventory:**
  - Central stock is issued to housekeepers.
  - Housekeepers request stock again only when their own balance reaches 0.
  - Adjustments need a reason.
  - Each item has a minimum stock level with low and out-of-stock alerts.
  - Suppliers and invoice numbers are recorded.
- **Reports:** Room, Housekeeper, Inspection, Inventory, Repair, Reception, Reassignment and Daily Staff reports, with date ranges and Export PDF.
- **Other:** notifications, audit logs, staff availability (On duty / Unavailable / On Leave) and working hours.

## How this web app maps the requirements

| Requirement in the brief | Decision |
|---|---|
| Admin panel | Maps to the APK's **Super Admin**. All listed modules exist in the APK; "Maintenance" is the APK's "Repairs". |
| Client panel | **Mapped to the Reception (front-desk) role**, the only non-admin role with a desk-based workflow. Panel route: `/client`. |
| Client "Housekeeping Requests" | **Assumption.** The APK only has Check Out, which raises a cleaning need. Daily-cleaning, complaint and amenities request types were added on top. |
| Client "Inspections" (added to the sidebar) | Confirmed. Receptionists inspect rooms in the APK. |
| Client "Maintenance Requests" | Confirmed ("Repair reported"). |
| Client "My Reports" | Confirmed ("Reception Report"), limited to the user's own activity. |
| Housekeeper role | **Not a web panel.** The brief asks for two panels and the APK treats housekeeping as a mobile workflow. The housekeeper's Start and Submit steps are simulated from Admin → Housekeeping. |

## APK features not implemented

Audit log screen, front-desk duty handover, the housekeeper's own stock balances and stock-request approval flow, the common-area daily check sheet, working-hours configuration, checklist configuration, and PIN/biometric security.

## Assumptions without APK evidence

- Maintenance Technician staff role (the APK only mentions "Plumber Murali").
- A "Low" priority level.
- Room bed configuration and max-occupancy fields.
- CSV export (the APK only offers PDF; Export PDF uses the browser's print dialog).
- Light/dark theme.
