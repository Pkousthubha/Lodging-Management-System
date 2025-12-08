# Public User Booking System Analysis

---

## 1. Overview & Purpose

**Purpose**: Public-facing website where guests search for rooms, view availability, book stays, pay online, and receive booking confirmations.

**Connection to Admin Backend**:
- Shares same backend API (`/api/v1/*`) but uses **public-scoped endpoints** (no admin auth required).
- Uses same Reservation, Payment, and Folio models as admin system.
- Admin can view/manage public bookings through admin console.

**Key Difference**: Public site is **read-only** for most data (can't modify rates, rooms, etc.) and **write-only** for reservations/payments.

---

## 2. Public User Flow

```
Home Page
  ↓
Search (dates, occupancy, location)
  ↓
Availability Results (room types, prices, taxes)
  ↓
Room Details (amenities, photos, policies)
  ↓
Booking Form (guest info, special requests)
  ↓
Payment (Razorpay checkout)
  ↓
Confirmation Page + Email
```

**Optional**: View booking status page (by confirmation number + email/phone).

---

## 3. Features Summary

- **Search & Availability**
  - Search by check-in/check-out dates, number of adults/children, location (hotel/branch).
  - Display available room types with base rates, taxes, total price.
  - Show seasonal rates, offers, discounts if applicable.
  - Filter by amenities, price range, room type.

- **Room Details**
  - Photos, description, amenities list, policies (cancellation, check-in/out times).
  - Real-time availability for selected dates.

- **Booking**
  - Guest information form (name, email, phone, address).
  - Special requests field.
  - Terms & conditions acceptance checkbox.
  - Price breakdown (room charges, taxes, total).

- **Payment**
  - Razorpay integration (card, UPI, netbanking, wallets).
  - Secure payment flow with order creation → checkout → webhook confirmation.

- **Confirmation**
  - Success page with confirmation number, booking details, payment receipt link.
  - Email sent with booking summary, cancellation policy, contact info.

- **Booking Status** (optional)
  - Guest can view booking by confirmation number + email/phone verification.
  - Shows current status (CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED).

---

## 4. Frontend (React) Structure

**Public Routes**:
- `/` - Home page (search form)
- `/search` - Availability results page
- `/rooms/:id` - Room type details page
- `/booking` - Booking form (guest info)
- `/payment` - Payment page (Razorpay checkout integration)
- `/success` - Confirmation success page
- `/failed` - Payment failure page
- `/booking-status` - View booking by confirmation number (optional)

**State Management**:
- React Query (TanStack Query) for server state (availability, room details, booking status).
- Local state (React useState) for form inputs, search filters, booking flow.
- Context for global state (selected dates, guest info, booking context).

**Differences from Admin App**:
- No authentication required (public access).
- No sidebar/admin navigation; simple header/footer.
- Optimized for mobile responsiveness.
- SEO-friendly routes and meta tags.
- Separate build/deployment (can be static hosting or same domain as admin).

---

## 5. Public API Usage

**Endpoints Used by Public Site**:

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/v1/public/availability/search` | Search availability by dates/occupancy | None |
| GET | `/api/v1/public/rooms/{id}` | Get room type details | None |
| GET | `/api/v1/public/hotels` | List hotels/branches (for location filter) | None |
| GET | `/api/v1/public/rate-plans` | Get active rate plans for room type | None |
| POST | `/api/v1/public/reservations` | Create reservation (guest booking) | None (rate limited) |
| GET | `/api/v1/public/reservations/{confirmationNumber}` | View booking status | None (verify email/phone) |
| POST | `/api/v1/public/payments/razorpay/order` | Create Razorpay order | None (rate limited) |

**Note**: Webhook endpoint (`POST /api/v1/payments/razorpay/webhook`) is server-to-server only (not called by frontend).

**Request/Response Examples**:

**Search Availability**:
```json
GET /api/v1/public/availability/search?branchId=3&checkIn=2025-12-20&checkOut=2025-12-23&adults=2&children=1

Response:
{
  "availableRoomTypes": [
    {
      "roomTypeId": 5,
      "name": "Deluxe Double",
      "baseRate": 5500.00,
      "taxAmount": 990.00,
      "totalPerNight": 6490.00,
      "totalForStay": 19470.00,
      "availableRooms": 3,
      "amenities": ["WiFi", "AC", "TV"]
    }
  ]
}
```

**Create Public Reservation**:
```json
POST /api/v1/public/reservations
{
  "branchId": 3,
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-23",
  "roomTypeId": 5,
  "ratePlanId": 2,
  "adults": 2,
  "children": 1,
  "guest": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210"
  },
  "source": "WEB_GUEST"
}

Response:
{
  "reservationId": 1024,
  "confirmationNumber": "HBLR-2025-000123",
  "status": "HOLD",
  "expectedAmount": 19470.00,
  "paymentOrderId": null
}
```

---

## 6. Booking Flow Details

**Step-by-Step**:

1. **User searches availability**
   - Frontend calls `GET /api/v1/public/availability/search`.
   - Backend validates dates, computes availability per room type, applies rate plans/seasonal rates, calculates taxes.
   - Returns available room types with pricing.

2. **User selects room type**
   - Frontend stores selection in state/context.
   - User views room details page (optional).

3. **User fills booking form**
   - Guest info, special requests, terms acceptance.
   - Frontend validates required fields client-side.

4. **Create reservation (HOLD status)**
   - Frontend calls `POST /api/v1/public/reservations`.
   - Backend:
     - Re-validates availability (prevent race conditions).
     - Creates Reservation with status `HOLD`.
     - Returns `reservationId`, `confirmationNumber`, `expectedAmount`.

5. **Create Razorpay order**
   - Frontend calls `POST /api/v1/public/payments/razorpay/order` with `reservationId` and `amount`.
   - Backend creates Razorpay order, stores `orderId` in Payment table linked to reservation.
   - Returns `orderId`, `key`, `amount` to frontend.

6. **Razorpay checkout**
   - Frontend opens Razorpay Checkout modal/redirect.
   - User completes payment.

7. **Webhook confirmation**
   - Razorpay sends webhook to backend `POST /api/v1/payments/razorpay/webhook`.
   - Backend verifies signature, updates Payment status, posts payment to Folio, updates Reservation status to `CONFIRMED`.

8. **User redirect**
   - Razorpay redirects to `/success?payment_id=...` or `/failed?error=...`.
   - Success page shows confirmation details; failure page shows retry option.

**Edge Case Handling**:
- If user closes browser mid-payment: Reservation stays in `HOLD`; can be auto-cancelled after timeout or manually cancelled by admin.
- If webhook arrives before user redirect: Success page still works (fetches latest status).

---

## 7. Razorpay (User Side)

**Flow**:

1. **Order Creation** (server-side)
   - Backend creates Razorpay order with amount (in paise), currency, receipt (confirmation number).
   - Returns `order_id`, `key`, `amount` to frontend.

2. **Checkout** (client-side)
   - Frontend initializes Razorpay Checkout with:
     - `order_id`, `key`, `amount`, `name`, `description`, `prefill` (email, phone), `handler` (success callback), `modal` config.
   - User selects payment method and completes payment.

3. **Success Handler**
   - Razorpay calls success handler with `payment_id`, `order_id`, `signature`.
   - Frontend redirects to `/success?payment_id=...`.

4. **Webhook** (server-side, async)
   - Razorpay sends webhook to backend with payment status.
   - Backend verifies signature, updates Payment and Reservation.
   - Sends confirmation email.

5. **Failure Handling**
   - If payment fails, Razorpay redirects to failure handler.
   - Frontend shows error message, allows retry (creates new order) or cancellation.

**Signature Verification** (backend):
- Compute HMAC SHA256 of `order_id + "|" + payment_id` using `RAZORPAY_KEY_SECRET`.
- Compare with received signature (time-safe comparison).

---

## 8. Data Rules & Validation

**Date Rules**:
- Check-in date must be >= today (hotel local date).
- Check-out date must be > check-in date.
- Minimum stay: enforce `MinLOS` from rate plan if applicable.
- Maximum stay: enforce `MaxLOS` if configured.

**Occupancy**:
- Adults: minimum 1, maximum per room type `MaxOccupancy`.
- Children: 0 or more (may have age limits per hotel policy).
- Total guests (adults + children) <= `MaxOccupancy`.

**Price Consistency**:
- Frontend displays prices from availability API response.
- **Backend always recalculates** on reservation creation (don't trust client-submitted price).
- If price mismatch detected, return error with correct price.

**Required Guest Details**:
- Name (required).
- Email (required, validated format).
- Phone (required, validated format per region).
- Address (optional, may be required for invoicing in some regions).

**Edge Cases**:
- **Browser close mid-payment**: Reservation in `HOLD`; background job cancels after timeout (e.g., 30 minutes).
- **Double payment attempt**: Backend checks if reservation already has successful payment; prevents duplicate orders.
- **Availability changes between search and booking**: Backend re-validates; returns error if no longer available.
- **Price changed between search and booking**: Backend recalculates; returns error with new price if different.

---

## 9. Security Notes

**Rate Limiting**:
- Search endpoints: Limit to ~10 requests/minute per IP.
- Reservation creation: Limit to ~3 requests/minute per IP.
- Payment order creation: Limit to ~5 requests/minute per IP.

**Input Validation**:
- Server-side validation for all inputs (dates, amounts, email, phone).
- Sanitize user inputs to prevent XSS.
- Validate date ranges, occupancy limits, price calculations.

**Price Manipulation Prevention**:
- **Never trust client-submitted price**.
- Backend always recalculates from current rates/availability.
- If submitted price differs from calculated price, reject with correct price.

**Public Endpoint Scopes**:
- Public endpoints only allow:
  - Read: availability, room details, hotels list.
  - Write: create reservations (with validation), create payment orders.
- Public endpoints **cannot**:
  - Modify existing reservations (except via webhook for payment confirmation).
  - Access admin data (users, audit logs, financial reports).
  - Cancel reservations (must contact hotel/admin).

**CSRF Protection**:
- Use CSRF tokens for state-changing operations (reservation creation, payment order).
- Or rely on SameSite cookies if using cookie-based session (if applicable).

**Additional**:
- HTTPS enforced for all public endpoints.
- Validate Razorpay webhook signatures (prevent fake webhooks).
- Log suspicious activity (rapid requests, price mismatches, failed validations).

---

## 10. Assumptions & Pending Clarifications

**Assumptions**:
- Public site and admin site share same backend API (different route prefixes or auth scopes).
- Email confirmation is sent automatically after successful payment webhook.
- Cancellation policy is displayed on booking form and confirmation email.
- Public users cannot modify or cancel bookings online (must contact hotel).
- No guest account/login required for booking (guest info collected per booking).

**Pending Clarifications** (confirm with product team):

- **Email Templates**: Content, branding, attachments (PDF invoice?), sender address.
- **Partial Payments**: Are partial payments allowed (deposit only) or must full amount be paid?
- **Coupons/Discounts**: Are promo codes supported? If yes, validation rules and discount calculation.
- **Multi-room Bookings**: Can public users book multiple rooms in one transaction?
- **Group Bookings**: Special flow for corporate/group bookings with multiple guests?
- **Booking Modifications**: Can guests modify dates/occupancy after booking (with re-pricing)?
- **Cancellation Policy**: Exact rules (free cancellation window, penalty percentages, refund processing time).
- **Guest Profile**: Should system create reusable guest profiles or store guest info per booking only?
- **Payment Methods**: Are all Razorpay methods enabled (UPI, wallets, netbanking) or only cards?
- **Booking Status Page**: Should guests be able to view booking status online, or only via email/phone?
- **Availability Cache**: How long should availability be cached on frontend (if at all)?
- **SEO Requirements**: Do room detail pages need to be indexed by search engines?

---

**Next Steps**:
- Confirm all pending clarifications with product team.
- Design email templates and confirmation page UI.
- Implement rate limiting and security measures.
- Set up Razorpay test environment for development.
- Plan for handling high traffic during peak booking periods.

