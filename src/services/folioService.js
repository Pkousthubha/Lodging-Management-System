/**
 * Folio Service
 * Handles all folio, billing, charges, and payments-related API calls
 */

import api from "./api.js";

/**
 * Get all folios
 * @param {object} filters - { reservationId, branchId, status }
 * @returns {Promise} Response with folios list
 */
export const getFolios = async (filters = {}) => {
  const response = await api.get("/api/Folios", { params: filters });
  return response.data;
};

/**
 * Get folio by ID
 * @param {number} folioId - Folio ID
 * @returns {Promise} Response with folio details including entries
 */
export const getFolioById = async (folioId) => {
  const response = await api.get(`/api/Folios/${folioId}`);
  return response.data;
};

/**
 * Create new folio
 * @param {object} folioData - Folio data
 * @returns {Promise} Response with created folio
 */
export const createFolio = async (folioData) => {
  const response = await api.post("/api/Folios", folioData);
  return response.data;
};

/**
 * Update folio
 * @param {number} folioId - Folio ID
 * @param {object} folioData - Updated folio data
 * @returns {Promise} Response with updated folio
 */
export const updateFolio = async (folioId, folioData) => {
  const response = await api.put(`/api/Folios/${folioId}`, folioData);
  return response.data;
};

/**
 * Close folio
 * @param {number} folioId - Folio ID
 * @returns {Promise} Response
 */
export const closeFolio = async (folioId) => {
  const response = await api.post(`/api/Folios/${folioId}/close`);
  return response.data;
};

// ----------------------
// Charges
// ----------------------

/**
 * Add charge to folio
 * @param {number} folioId - Folio ID
 * @param {object} chargeData - { description, quantity, unitPrice, taxPercent, sourceModule, sourceRefId }
 * @returns {Promise} Response
 */
export const addCharge = async (folioId, chargeData) => {
  const response = await api.post(`/api/Folios/${folioId}/charges`, chargeData);
  return response.data;
};

/**
 * Update charge
 * @param {number} folioId - Folio ID
 * @param {number} chargeId - Charge entry ID
 * @param {object} chargeData - Updated charge data
 * @returns {Promise} Response
 */
export const updateCharge = async (folioId, chargeId, chargeData) => {
  const response = await api.put(`/api/Folios/${folioId}/charges/${chargeId}`, chargeData);
  return response.data;
};

/**
 * Delete charge
 * @param {number} folioId - Folio ID
 * @param {number} chargeId - Charge entry ID
 * @returns {Promise} Response
 */
export const deleteCharge = async (folioId, chargeId) => {
  const response = await api.del(`/api/Folios/${folioId}/charges/${chargeId}`);
  return response.data;
};

// ----------------------
// Payments
// ----------------------

/**
 * Add payment to folio
 * @param {number} folioId - Folio ID
 * @param {object} paymentData - { paymentMethodId, amount, referenceNo, remarks }
 * @returns {Promise} Response
 */
export const addPayment = async (folioId, paymentData) => {
  const response = await api.post(`/api/Folios/${folioId}/payments`, paymentData);
  return response.data;
};

/**
 * Update payment
 * @param {number} folioId - Folio ID
 * @param {number} paymentId - Payment entry ID
 * @param {object} paymentData - Updated payment data
 * @returns {Promise} Response
 */
export const updatePayment = async (folioId, paymentId, paymentData) => {
  const response = await api.put(`/api/Folios/${folioId}/payments/${paymentId}`, paymentData);
  return response.data;
};

/**
 * Delete payment
 * @param {number} folioId - Folio ID
 * @param {number} paymentId - Payment entry ID
 * @returns {Promise} Response
 */
export const deletePayment = async (folioId, paymentId) => {
  const response = await api.del(`/api/Folios/${folioId}/payments/${paymentId}`);
  return response.data;
};

/**
 * Get invoice/view for folio
 * @param {number} folioId - Folio ID
 * @returns {Promise} Response with invoice data
 */
export const getInvoice = async (folioId) => {
  const response = await api.get(`/api/Folios/${folioId}/invoice`);
  return response.data;
};

