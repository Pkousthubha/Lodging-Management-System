/**
 * Payment Service
 * Handles all payment-related API calls, including Razorpay integration
 */

import api from "./api.js";

/**
 * Create Razorpay order
 * @param {object} data - { reservationId, amount, currency }
 * @returns {Promise} Response with Razorpay order details
 */
export const createRazorpayOrder = async (data) => {
  const response = await api.post("/api/Payments/Razorpay/Order", data);
  return response.data;
};

/**
 * Verify Razorpay payment
 * @param {object} data - { paymentId, orderId, signature }
 * @returns {Promise} Response with verification result
 */
export const verifyRazorpayPayment = async (data) => {
  const response = await api.post("/api/Payments/Razorpay/Verify", data);
  return response.data;
};

/**
 * Get payment by ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise} Response with payment details
 */
export const getPaymentById = async (paymentId) => {
  const response = await api.get(`/api/Payments/${paymentId}`);
  return response.data;
};

/**
 * Get payments by reservation
 * @param {number} reservationId - Reservation ID
 * @returns {Promise} Response with payments list
 */
export const getPaymentsByReservation = async (reservationId) => {
  const response = await api.get(`/api/Payments/Reservation/${reservationId}`);
  return response.data;
};

/**
 * Get payments by folio
 * @param {number} folioId - Folio ID
 * @returns {Promise} Response with payments list
 */
export const getPaymentsByFolio = async (folioId) => {
  const response = await api.get(`/api/Payments/Folio/${folioId}`);
  return response.data;
};

/**
 * Public: Create Razorpay order (for public booking site)
 * @param {object} data - { reservationId, amount }
 * @returns {Promise} Response with Razorpay order details
 */
export const createPublicRazorpayOrder = async (data) => {
  const response = await api.post("/api/Public/Payments/Razorpay/Order", data);
  return response.data;
};

