import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import MainLayout from "./components/layout/MainLayout.jsx";
import AppToastContainer from "./components/common/AppToastContainer";
import SessionTimeoutModal from "./components/common/SessionTimeoutModal";
import { SessionTimeoutProvider } from "./context/SessionTimeoutContext";

import LoginPage from "./pages/auth/Login.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPassword.jsx";
import HomePage from "./pages/Home.jsx";

// Masters
import HotelPage from "./pages/masters/Hotel.jsx";
import BranchPage from "./pages/masters/Branch.jsx";
import FloorsRoomsPage from "./pages/masters/FloorsRooms.jsx";
import AmenitiesPage from "./pages/masters/Amenities.jsx";
import RatePlansPage from "./pages/masters/RatePlans.jsx";
import MenuPage from "./pages/masters/Menu.jsx";
import TaxesPaymentsPage from "./pages/masters/TaxesPayments.jsx";
import UsersRolesPage from "./pages/masters/UsersRoles.jsx";

// Front Office
import AvailabilityPage from "./pages/frontoffice/Availability.jsx";
import ReservationsPage from "./pages/frontoffice/Reservations.jsx";
import CheckInOutPage from "./pages/frontoffice/CheckInOut.jsx";
import InHouseGuestsPage from "./pages/frontoffice/InHouseGuests.jsx";
import RoomStatusPage from "./pages/frontoffice/RoomStatus.jsx";

// Boarding
import BoardingMenuPage from "./pages/boarding/BoardingMenu.jsx";
import RoomServiceOrdersPage from "./pages/boarding/RoomServiceOrders.jsx";
import RestaurantOrdersPage from "./pages/boarding/RestaurantOrders.jsx";
import LinkOrdersToFolioPage from "./pages/boarding/LinkOrdersToFolio.jsx";

// Housekeeping
import HousekeepingBoardPage from "./pages/housekeeping/HousekeepingBoard.jsx";
import HousekeepingTasksPage from "./pages/housekeeping/HousekeepingTasks.jsx";

// Billing
import FoliosPage from "./pages/billing/Folios.jsx";
import ChargesPaymentsPage from "./pages/billing/ChargesPayments.jsx";
import InvoiceViewPage from "./pages/billing/InvoiceView.jsx";

// Admin & Reports
import OccupancyReportsPage from "./pages/reports/OccupancyReports.jsx";
import RestaurantSalesReportsPage from "./pages/reports/RestaurantSalesReports.jsx";
import AuditLogsPage from "./pages/reports/AuditLogs.jsx";

// Online booking
import OnlineBookingPage from "./pages/online/OnlineBooking.jsx";
import OnlineBookingRazorpayPage from "./pages/online/OnlineBookingRazorpay.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <SessionTimeoutProvider>
      <>
        {/* Global session timeout modal – only shows when logged in & expired */}
        <SessionTimeoutModal />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />

            {/* Masters */}
            <Route path="masters/hotels" element={<HotelPage />} />
            <Route path="masters/branches" element={<BranchPage />} />
            <Route path="masters/floors-rooms" element={<FloorsRoomsPage />} />
            <Route path="masters/amenities" element={<AmenitiesPage />} />
            <Route path="masters/rate-plans" element={<RatePlansPage />} />
            <Route path="masters/menu" element={<MenuPage />} />
            <Route
              path="masters/taxes-payments"
              element={<TaxesPaymentsPage />}
            />
            <Route path="masters/users-roles" element={<UsersRolesPage />} />

            {/* Front Office */}
            <Route
              path="frontoffice/availability"
              element={<AvailabilityPage />}
            />
            <Route
              path="frontoffice/reservations"
              element={<ReservationsPage />}
            />
            <Route
              path="frontoffice/check-in-out"
              element={<CheckInOutPage />}
            />
            <Route path="frontoffice/in-house" element={<InHouseGuestsPage />} />
            <Route
              path="frontoffice/room-status"
              element={<RoomStatusPage />}
            />

            {/* Boarding */}
            <Route path="boarding/menu" element={<BoardingMenuPage />} />
            <Route
              path="boarding/room-service"
              element={<RoomServiceOrdersPage />}
            />
            <Route
              path="boarding/restaurant-orders"
              element={<RestaurantOrdersPage />}
            />
            <Route
              path="boarding/link-folio"
              element={<LinkOrdersToFolioPage />}
            />

            {/* Housekeeping */}
            <Route
              path="housekeeping/board"
              element={<HousekeepingBoardPage />}
            />
            <Route
              path="housekeeping/tasks"
              element={<HousekeepingTasksPage />}
            />

            {/* Billing & Payments */}
            <Route path="billing/folios" element={<FoliosPage />} />
            <Route
              path="billing/charges-payments"
              element={<ChargesPaymentsPage />}
            />
            <Route path="billing/invoice-view" element={<InvoiceViewPage />} />

            {/* Reports & Admin */}
            <Route
              path="reports/occupancy"
              element={<OccupancyReportsPage />}
            />
            <Route
              path="reports/restaurant-sales"
              element={<RestaurantSalesReportsPage />}
            />
            <Route path="reports/audit-logs" element={<AuditLogsPage />} />

            {/* Online booking */}
            <Route path="online/booking" element={<OnlineBookingPage />} />
            <Route
              path="online/booking-razorpay"
              element={<OnlineBookingRazorpayPage />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global toast container */}
        <AppToastContainer />
      </>
    </SessionTimeoutProvider>
  );
}
