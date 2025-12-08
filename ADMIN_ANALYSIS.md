## Admin System Analysis – Hotel / Lodging

---

### 1. Overview & Purpose

- **Goal**: Provide a central Admin console for hotel/lodge operations: configuration, reservations, stays, billing, housekeeping, restaurant/room service, reporting, and audits.
- **Scope**:
  - Multi-hotel / multi-branch properties.
  - Staff-facing React SPA backed by .NET 8 Web API and SQL Server.
  - Online payments via Razorpay; offline payments (cash/card) recorded in the same folio/payment model.

---

### 2. Admin Roles & Permissions (short)

| Role        | Core Actions                                               | Notes                               |
|------------|-------------------------------------------------------------|-------------------------------------|
| Admin      | Configure masters, users/roles, system settings, audits    | Full access across all modules      |
| Front-Desk | Manage reservations, check-in/out, folios, payments        | No access to global configuration   |
| Housekeeping | Update room/HK status, manage cleaning tasks             | Read-only on reservations           |
| F&B        | Create/update room/restaurant orders, KOT, post to folios  | No access to room inventory config  |
| Accountant | Manage payments/refunds, tax config, finance reports       | Limited edit on rates/taxes         |
| Manager    | Approvals, overrides, high-level reporting                  | Read-all; selective write/approve   |

Authorization is enforced via JWT roles/claims and per-endpoint policies.

---

### 3. Admin Modules Summary

- **Masters**
  - Hotels, Branches, Floors, Rooms, RoomTypes.
  - Amenities; RatePlans & SeasonalRates.
  - MenuCategories & MenuItems for F&B.
  - Taxes, PaymentMethods, Users & Roles.
- **Reservations & Stays**
  - Availability search by dates/room type/rate plan.
  - Create/modify/cancel reservations, group bookings.
  - Check-in/check-out flows, no-show & hold expiry rules.
- **Folios & Billing**
  - Folio per stay; charges/payments, invoices, refunds.
- **Housekeeping**
  - Room status board, cleaning tasks, status history.
- **Restaurant / Room Service**
  - Order capture, KOT workflow, posting to folios.
- **Reports & Audit**
  - Operational/financial reports, full audit trail.

---

### 4. Reservation Workflow (short)

- Staff searches availability for a hotel/branch, date range, room type, and rate plan.
- System calculates availability (room-type level, with per-room checks and blocks/out-of-order).
- Staff creates reservation:
  - Guest details, dates, occupancy, rate plan, optional specific room.
  - Optional deposit (cash) or payment link (Razorpay).
- Rules:
  - Prevent overlapping bookings per room by default; optional room-type overbooking flag.
  - Holds without payment auto-expire after configured minutes (per rate plan or hotel).
  - Cancellation and no-show policies determine penalties and state transitions.

---

### 5. Folio & Billing Workflow (short)

- At confirmation or check-in, system opens an **OPEN** folio linked to reservation/guest.
- All monetary activity posted as **folio entries**:
  - Room nights, packages, extras, F&B orders, taxes, adjustments, deposits.
- Payments (cash/card/Razorpay) reduce folio balance; refunds are negative entries.
- Check-out requires zero balance or manager override.
- On closure: folio marked **CLOSED**, invoice number assigned, snapshot stored for reprint and reporting.

---

### 6. Housekeeping Workflow (short)

- Each room tracks:
  - **Occupancy**: VACANT, OCCUPIED, STAYOVER, DUE_OUT.
  - **HK status**: CLEAN, DIRTY, INSPECTED, OUT_OF_SERVICE.
- Events:
  - Check-in → OCCUPIED/STAYOVER.
  - Check-out → VACANT/DIRTY; create cleaning task.
- Housekeeping UI:
  - Filterable board by floor/area/status.
  - Tasks assigned to attendants; completion updates HK status and history.
- Check-in validation requires HK status CLEAN/INSPECTED or explicit override.

---

### 7. Restaurant/Room Service Workflow

- Menu masters: categories and items with prices, tax rules, and active flags.
- Order sources:
  - **ROOM_SERVICE** (linked to room/reservation/folio).
  - **RESTAURANT** (linked to table; optional folio if in-house).
- Order lifecycle: PLACED → IN_KITCHEN → READY → SERVED → (POSTED_TO_FOLIO or CANCELLED).
- KOT (Kitchen Order Ticket) views/prints drive kitchen operations.
- For in-house guests, closing an order posts summarized charge (with taxes) to the guest folio.

---

### 8. Reports & Audit

- **Reports (examples)**:
  - Daily occupancy & ADR (per hotel/branch, per room type).
  - Revenue by department (Rooms, F&B, Other) and by payment method.
  - Tax summaries by code/rate; settlement reports for Razorpay vs offline methods.
  - Housekeeping productivity; F&B item/category sales.
- **Audit**:
  - Logs critical changes: masters, users/roles, reservations, folios/payments, HK status.
  - Stores who/when/what (before/after JSON) for each action.
  - Read-only UI with filters by date, user, entity type.

---

### 9. Database Summary (short)

- **Inventory & Configuration**
  - `Hotel`, `Branch`, `Floor`, `Room`, `RoomType`, `Amenity`, `RoomAmenity`, `RoomBlock`.
- **Pricing & Menus**
  - `RatePlan`, `SeasonalRate`, `Tax`, `PaymentMethod`, `MenuCategory`, `MenuItem`.
- **Operations**
  - `Reservation`, optional `GroupReservation`/`ReservationRoom` for multi-room, `Guest` (if normalized).
  - `Folio`, `FolioEntry`, `Payment` (with gateway refs), `Invoice` (or attributes on Folio).
  - `Order`, `OrderItem` for room/restaurant service.
  - `HousekeepingTask`, `RoomStatusHistory`.
- **Security & Audit**
  - `User`, `Role`, `UserRole`, `AuditLog`.

Keys/relations follow standard PMS patterns: Hotel 1–N Branch; Branch 1–N Room; Reservation links to Hotel/Branch/RoomType/Room/RatePlan; Folio 1–N FolioEntries; Order 1–N OrderItems; many modules reference User and AuditLog.

---

### 10. API Summary (important endpoints only)

> Base prefix: `/api/v1`

- **Auth**
  - `POST /auth/login` – login, returns JWT + refresh token.
  - `POST /auth/refresh` – rotate tokens.
- **Masters**
  - `GET/POST/PUT/DELETE /hotels`, `/branches`, `/rooms`, `/roomtypes`.
  - `GET/POST/PUT/DELETE /rateplans`, `/seasonal-rates`.
  - `GET/POST/PUT/DELETE /menu/categories`, `/menu/items`.
  - `GET/POST/PUT/DELETE /taxes`, `/payment-methods`.
  - `GET/POST/PUT/DELETE /users`, `/roles`.
- **Reservations & Availability**
  - `GET /availability` – per branch, date range, room type.
  - `GET /reservations` – list + filters; `GET /reservations/{id}` – details.
  - `POST /reservations` – create; `PUT /reservations/{id}` – modify.
  - `POST /reservations/{id}/cancel` – cancel with reason.
  - `POST /reservations/{id}/checkin`, `/checkout` – change stay state.
- **Folios & Payments**
  - `GET /folios/{id}` – header + entries.
  - `POST /folios/{id}/charge` – add charge.
  - `POST /folios/{id}/payment` – add payment/refund.
  - `POST /payments/razorpay/order` – create Razorpay order for client checkout.
  - `POST /payments/razorpay/webhook` – handle Razorpay webhook (idempotent, signature-verified).
- **Housekeeping**
  - `GET /rooms/status` – occupancy + HK summary.
  - `GET /housekeeping/tasks`, `POST /housekeeping/tasks`, `PUT /housekeeping/tasks/{id}/status`.
- **Orders**
  - `GET /orders`, `GET /orders/{id}`.
  - `POST /orders/roomservice` – create room-service order.
  - `POST /orders/{id}/post-to-folio` – push to folio.
- **Reports & Audit**
  - `GET /reports/occupancy`, `/reports/revenue`, `/reports/payments` (parameterized).
  - `GET /audit-logs` – filtered query for audits.

---

### 11. Architecture Summary (React → API → SQL → Razorpay)

- **Client**: React SPA (Admin) using React Router, context for Auth/Theme, and data fetching via React Query/REST.
- **API**: ASP.NET Core .NET 8 Web API, layered as Controllers → Services → Repositories/EF Core, with DTOs and validation.
- **Database**: SQL Server schema with tables, views, and stored procedures for hot paths (availability, reservation create, folio posting).
- **Payments**: Razorpay integration:
  - Server-side order creation and payment verification.
  - Webhook endpoint for asynchronous success/failure events.
- **Background Jobs**: .NET worker/Hangfire/Quartz for hold expiry, no-show marking, nightly room charges, and scheduled reports.
- **Observability**: Structured logging (e.g., Serilog), metrics, and error tracking (e.g., App Insights or Sentry).

---

### 12. Assumptions

- Deployment serves **multiple hotels/branches** within one logical tenant.
- All persisted datetimes are in **UTC**; hotel-local dates used for stay calculations and reports.
- Online guest booking (public site) uses the same reservation & payment APIs but with separate clients/scopes.
- One primary currency per hotel; multi-currency settlement handled outside v1 (if needed later).
- Seasonal rates override base rate plans by date and (optionally) day-of-week; no advanced revenue management in v1.
- Reports are generated directly from the OLTP DB initially; a warehouse/BI layer can be added later.
- RBAC is role-based only (no per-user custom permissions) for the first release.

---

### 13. Pending Clarifications

- Detailed **cancellation & no-show policies** (cutoff windows, penalty formulas, channel-specific rules).  
- Expected **scale** (number of hotels, branches, rooms, and concurrent users) to tune caching and background jobs.  
- Whether to maintain a full **guest profile** (loyalty, preferences) or keep guest data inline per reservation in v1.  
- Required **regulatory data fields** (ID documents, GST/Tax IDs, nationality) and retention/anonymization rules.  
- How much **overbooking** is allowed (per room type vs property-level) and what approval workflow is required.  
- Exact **reporting formats** (statutory, management, exports) and whether PDFs/Excel exports are mandatory in v1.  
- Need for **multi-tenant separation** beyond hotel/branch (e.g., separate corporate groups in one deployment).  


