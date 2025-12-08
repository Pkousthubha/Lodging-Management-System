# API Integration Guide

This guide explains how to use the new service layer for integrating with your .NET Web API backend.

## Overview

All API calls are now organized into service files located in `/src/services/`. Each service file contains functions that correspond to specific API endpoints.

## Service Files

### Base Configuration
- **`api.js`** - Base axios configuration with helper methods (GET, POST, PUT, PATCH, DELETE)

### Feature Services
- **`authService.js`** - Authentication (login, logout, refresh token, password management)
- **`reservationService.js`** - Reservations and bookings
- **`roomService.js`** - Rooms and room types
- **`folioService.js`** - Folios, charges, and payments
- **`housekeepingService.js`** - Housekeeping tasks and room status
- **`orderService.js`** - Room service and restaurant orders
- **`reportService.js`** - Reports (occupancy, revenue, audit logs)
- **`masterService.js`** - Master data (hotels, branches, amenities, rate plans, menu, users)
- **`paymentService.js`** - Payment processing (Razorpay integration)

## Setup Instructions

### 1. Configure API Base URL

Update the base URL in `/src/services/api.js`:

```javascript
// Replace with your actual .NET backend URL
const API_BASE_URL = baseUrl || "https://localhost:44309";
```

Or set it via environment variable in your `.env` file:

```env
VITE_API_BASE_URL=https://localhost:44309
```

### 2. Configure CORS on Backend

Add CORS configuration to your .NET API's `Program.cs` (see `CORS_CONFIGURATION_EXAMPLE.md` for details).

## Usage Examples

### Authentication

```javascript
import { login, logout, changePassword } from "../services/authService.js";

// Login
try {
  const response = await login({
    email: "user@example.com",
    password: "password123"
  });
  // Handle response (tokens are automatically stored by interceptors)
} catch (error) {
  console.error("Login failed:", error);
}

// Logout
await logout();
```

### Reservations

```javascript
import { 
  getReservations, 
  createReservation, 
  checkIn, 
  checkOut 
} from "../services/reservationService.js";

// Get all reservations
const reservations = await getReservations({ 
  branchId: 1, 
  status: "CONFIRMED" 
});

// Create reservation
const newReservation = await createReservation({
  branchId: 1,
  checkInDate: "2025-01-15",
  checkOutDate: "2025-01-20",
  roomTypeId: 5,
  adults: 2,
  children: 1
});

// Check-in
await checkIn(reservationId, { roomId: 101 });
```

### Rooms

```javascript
import { 
  getRooms, 
  getRoomTypes, 
  updateRoomStatus 
} from "../services/roomService.js";

// Get rooms
const rooms = await getRooms({ branchId: 1, status: "OCCUPIED" });

// Get room types
const roomTypes = await getRoomTypes({ branchId: 1 });

// Update room status
await updateRoomStatus(roomId, { 
  status: "CLEAN", 
  notes: "Room cleaned and ready" 
});
```

### Folios and Payments

```javascript
import { 
  getFolioById, 
  addCharge, 
  addPayment 
} from "../services/folioService.js";

// Get folio
const folio = await getFolioById(folioId);

// Add charge
await addCharge(folioId, {
  description: "Room Service",
  quantity: 1,
  unitPrice: 500,
  taxPercent: 18
});

// Add payment
await addPayment(folioId, {
  paymentMethodId: 1,
  amount: 5000,
  referenceNo: "TXN123456"
});
```

### Master Data

```javascript
import { 
  getHotels, 
  getBranches, 
  getRatePlans 
} from "../services/masterService.js";

// Get hotels
const hotels = await getHotels();

// Get branches for a hotel
const branches = await getBranchesByHotel(hotelId);

// Get rate plans
const ratePlans = await getRatePlans({ branchId: 1 });
```

## Error Handling

All service functions use the global error handling configured in `src/lib/axiosClient.js`. Errors are automatically:

- Displayed via toast notifications
- Logged to console
- Handled for network/CORS issues
- Managed for authentication token refresh

You can still use try/catch for custom error handling:

```javascript
try {
  const data = await getReservations();
  // Handle success
} catch (error) {
  // Error is already handled globally, but you can add custom logic
  if (error.response?.status === 404) {
    // Handle 404 specifically
  }
}
```

## Component Integration Example

Here's how to update a component to use the new services:

### Before (using axiosClient directly):

```javascript
import axiosClient from "../../lib/axiosClient.js";

const handleSubmit = async () => {
  try {
    await axiosClient.post("/api/Folio/1/charges", payload);
  } catch (error) {
    console.error(error);
  }
};
```

### After (using service):

```javascript
import { addCharge } from "../../services/folioService.js";

const handleSubmit = async () => {
  try {
    await addCharge(1, payload);
    // Success handling
  } catch (error) {
    // Error is already handled globally
  }
};
```

## Loading States

Always use loading states when making API calls:

```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await getReservations();
    // Update state with data
  } catch (error) {
    // Error handled globally
  } finally {
    setLoading(false);
  }
};
```

## Authentication Token Management

Authentication tokens are automatically managed by the axios interceptors:

- Access tokens are stored in `localStorage` as `accessToken`
- Refresh tokens are stored as `refreshToken`
- Tokens are automatically attached to requests via `Authorization: Bearer <token>` header
- Expired tokens are automatically refreshed
- Session expiry is handled globally

## API Endpoint Naming Convention

The service functions follow your .NET API endpoint structure:

- **Auth**: `/api/Auth/*`
- **Reservations**: `/api/Reservations/*`
- **Rooms**: `/api/Rooms/*`, `/api/RoomTypes/*`
- **Folios**: `/api/Folios/*`
- **Housekeeping**: `/api/Housekeeping/*`
- **Orders**: `/api/Orders/*`
- **Reports**: `/api/Reports/*`
- **Master Data**: `/api/Hotels/*`, `/api/Branches/*`, etc.

## Next Steps

1. Update your `.env` file with the correct API base URL
2. Add CORS configuration to your .NET backend (see `CORS_CONFIGURATION_EXAMPLE.md`)
3. Start updating components to use the new service functions
4. Test each integration point thoroughly

## Notes

- All service functions return the `data` property from the axios response
- Error handling is centralized in `axiosClient.js`
- The existing `hotelService.js` has been updated to use `masterService.js` for backward compatibility
- Components can be gradually migrated to use the new services

