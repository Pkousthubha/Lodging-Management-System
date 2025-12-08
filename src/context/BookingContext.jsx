import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const BookingContext = createContext();

const BOOKING_STORAGE_KEY = "hotel_booking_state";

/**
 * BookingContext - Manages booking state persistence across login flow
 * 
 * Stores:
 * - checkInDate
 * - checkOutDate
 * - adults
 * - children
 * - roomTypeId
 * - roomName
 * - room imageUrl
 * - amenities
 * - rate plan id
 * - price per night
 * - total price
 */
export function BookingProvider({ children }) {
  const [bookingState, setBookingState] = useState(null);

  // Load booking state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(BOOKING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookingState(parsed);
      } catch (error) {
        console.error("Failed to parse saved booking state:", error);
        sessionStorage.removeItem(BOOKING_STORAGE_KEY);
      }
    }
  }, []);

  /**
   * Save booking state to sessionStorage
   * @param {Object} state - Booking state object
   * @param {string} state.checkInDate - Check-in date (YYYY-MM-DD)
   * @param {string} state.checkOutDate - Check-out date (YYYY-MM-DD)
   * @param {number} state.adults - Number of adults
   * @param {number} state.children - Number of children
   * @param {Object} state.room - Room object with id, name, imageUrl, amenities, etc.
   * @param {number} state.ratePlanId - Rate plan ID (optional)
   * @param {number} state.pricePerNight - Price per night
   * @param {number} state.totalPrice - Total price for the stay
   * @param {number} state.nights - Number of nights
   */
  const saveSearchState = useCallback((state) => {
    try {
      const stateToSave = {
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        adults: state.adults || state.guests || 2,
        children: state.children || 0,
        room: {
          id: state.room?.id,
          name: state.room?.name,
          imageUrl: state.room?.imageUrl,
          amenities: state.room?.amenities || [],
          type: state.room?.type,
          description: state.room?.description,
        },
        ratePlanId: state.ratePlanId || null,
        pricePerNight: state.pricePerNight || state.room?.price || 0,
        totalPrice: state.totalPrice || 0,
        nights: state.nights || 1,
        savedAt: new Date().toISOString(),
      };
      
      sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(stateToSave));
      setBookingState(stateToSave);
      return true;
    } catch (error) {
      console.error("Failed to save booking state:", error);
      return false;
    }
  }, []);

  /**
   * Load booking state from sessionStorage
   * @returns {Object|null} Booking state or null if not found
   */
  const loadSearchState = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBookingState(parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Failed to load booking state:", error);
      sessionStorage.removeItem(BOOKING_STORAGE_KEY);
      setBookingState(null);
      return null;
    }
  }, []);

  /**
   * Clear booking state from sessionStorage
   */
  const clearSearchState = useCallback(() => {
    try {
      sessionStorage.removeItem(BOOKING_STORAGE_KEY);
      setBookingState(null);
      return true;
    } catch (error) {
      console.error("Failed to clear booking state:", error);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      bookingState,
      saveSearchState,
      loadSearchState,
      clearSearchState,
      hasBookingState: !!bookingState,
    }),
    [bookingState, saveSearchState, loadSearchState, clearSearchState]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return ctx;
}

