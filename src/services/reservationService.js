/**
 * Reservation Service
 * Handles all reservation and booking-related API calls
 */

import api from "./api.js";

/**
 * Get all reservations with optional filters
 * @param {object} filters - { branchId, status, checkInDate, checkOutDate, etc. }
 * @returns {Promise} Response with reservations list
 */
export const getReservations = async (filters = {}) => {
  const response = await api.get("/api/Reservations", { params: filters });
  return response.data;
};

/**
 * Get reservation by ID
 * @param {number} reservationId - Reservation ID
 * @returns {Promise} Response with reservation details
 */
export const getReservationById = async (reservationId) => {
  const response = await api.get(`/api/Reservations/${reservationId}`);
  return response.data;
};

/**
 * Create new reservation
 * @param {object} reservationData - Reservation data
 * @returns {Promise} Response with created reservation
 */
export const createReservation = async (reservationData) => {
  const response = await api.post("/api/Reservations", reservationData);
  return response.data;
};

/**
 * Update reservation
 * @param {number} reservationId - Reservation ID
 * @param {object} reservationData - Updated reservation data
 * @returns {Promise} Response with updated reservation
 */
export const updateReservation = async (reservationId, reservationData) => {
  const response = await api.put(`/api/Reservations/${reservationId}`, reservationData);
  return response.data;
};

/**
 * Cancel reservation
 * @param {number} reservationId - Reservation ID
 * @param {object} data - { cancellationReason }
 * @returns {Promise} Response
 */
export const cancelReservation = async (reservationId, data) => {
  const response = await api.post(`/api/Reservations/${reservationId}/cancel`, data);
  return response.data;
};

/**
 * Check-in reservation
 * @param {number} reservationId - Reservation ID
 * @param {object} data - Check-in data (optional room assignment, etc.)
 * @returns {Promise} Response
 */
export const checkIn = async (reservationId, data = {}) => {
  const response = await api.post(`/api/Reservations/${reservationId}/checkin`, data);
  return response.data;
};

/**
 * Check-out reservation
 * @param {number} reservationId - Reservation ID
 * @param {object} data - Check-out data (optional)
 * @returns {Promise} Response
 */
export const checkOut = async (reservationId, data = {}) => {
  const response = await api.post(`/api/Reservations/${reservationId}/checkout`, data);
  return response.data;
};

/**
 * Get availability
 * @param {object} filters - { branchId, checkInDate, checkOutDate, roomTypeId, adults, children }
 * @returns {Promise} Response with availability data
 */
export const getAvailability = async (filters) => {
  const response = await api.get("/api/Availability", { params: filters });
  return response.data;
};

/**
 * Get in-house guests
 * @param {object} filters - Optional filters
 * @returns {Promise} Response with in-house guests list
 */
export const getInHouseGuests = async (filters = {}) => {
  const response = await api.get("/api/Reservations/inhouse", { params: filters });
  return response.data;
};

/**
 * Public: Search availability (for public booking site)
 * @param {object} searchParams - { branchId, checkIn, checkOut, adults, children }
 * @returns {Promise} Response with available room types
 */
export const searchPublicAvailability = async (searchParams) => {
  const response = await api.get("/api/Public/Availability/Search", { params: searchParams });
  return response.data;
};

/**
 * Public: Create public reservation
 * @param {object} reservationData - Public reservation data
 * @returns {Promise} Response with reservation details
 */
export const createPublicReservation = async (reservationData) => {
  const response = await api.post("/api/Public/Reservations", reservationData);
  return response.data;
};

/**
 * Public: Get reservation by confirmation number
 * @param {string} confirmationNumber - Confirmation number
 * @param {object} verification - { email, phone } for verification
 * @returns {Promise} Response with reservation details
 */
export const getReservationByConfirmation = async (confirmationNumber, verification = {}) => {
  const response = await api.get(`/api/Public/Reservations/${confirmationNumber}`, {
    params: verification,
  });
  return response.data;
};

