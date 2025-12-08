/**
 * Order Service
 * Handles all room service and restaurant order-related API calls
 */

import api from "./api.js";

/**
 * Get all orders
 * @param {object} filters - { branchId, orderType, status, date }
 * @returns {Promise} Response with orders list
 */
export const getOrders = async (filters = {}) => {
  const response = await api.get("/api/Orders", { params: filters });
  return response.data;
};

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Response with order details
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/Orders/${orderId}`);
  return response.data;
};

/**
 * Create room service order
 * @param {object} orderData - Order data
 * @returns {Promise} Response with created order
 */
export const createRoomServiceOrder = async (orderData) => {
  const response = await api.post("/api/Orders/RoomService", orderData);
  return response.data;
};

/**
 * Create restaurant order
 * @param {object} orderData - Order data
 * @returns {Promise} Response with created order
 */
export const createRestaurantOrder = async (orderData) => {
  const response = await api.post("/api/Orders/Restaurant", orderData);
  return response.data;
};

/**
 * Update order
 * @param {number} orderId - Order ID
 * @param {object} orderData - Updated order data
 * @returns {Promise} Response with updated order
 */
export const updateOrder = async (orderId, orderData) => {
  const response = await api.put(`/api/Orders/${orderId}`, orderData);
  return response.data;
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {object} data - { status, notes }
 * @returns {Promise} Response
 */
export const updateOrderStatus = async (orderId, data) => {
  const response = await api.patch(`/api/Orders/${orderId}/status`, data);
  return response.data;
};

/**
 * Cancel order
 * @param {number} orderId - Order ID
 * @param {object} data - { cancellationReason }
 * @returns {Promise} Response
 */
export const cancelOrder = async (orderId, data) => {
  const response = await api.post(`/api/Orders/${orderId}/cancel`, data);
  return response.data;
};

/**
 * Post order to folio
 * @param {number} orderId - Order ID
 * @param {number} folioId - Folio ID
 * @returns {Promise} Response
 */
export const postOrderToFolio = async (orderId, folioId) => {
  const response = await api.post(`/api/Orders/${orderId}/post-to-folio`, { folioId });
  return response.data;
};

/**
 * Link orders to folio (bulk)
 * @param {object} data - { folioId, orderIds: [] }
 * @returns {Promise} Response
 */
export const linkOrdersToFolio = async (data) => {
  const response = await api.post("/api/Orders/link-to-folio", data);
  return response.data;
};

/**
 * Get restaurant orders
 * @param {object} filters - { branchId, status, date }
 * @returns {Promise} Response with restaurant orders list
 */
export const getRestaurantOrders = async (filters = {}) => {
  const response = await api.get("/api/Orders/Restaurant", { params: filters });
  return response.data;
};

/**
 * Get room service orders
 * @param {object} filters - { branchId, status, date, roomId }
 * @returns {Promise} Response with room service orders list
 */
export const getRoomServiceOrders = async (filters = {}) => {
  const response = await api.get("/api/Orders/RoomService", { params: filters });
  return response.data;
};

