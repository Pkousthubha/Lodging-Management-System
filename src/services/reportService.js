/**
 * Report Service
 * Handles all report-related API calls
 */

import api from "./api.js";

/**
 * Get occupancy report
 * @param {object} filters - { branchId, startDate, endDate, groupBy }
 * @returns {Promise} Response with occupancy report data
 */
export const getOccupancyReport = async (filters) => {
  const response = await api.get("/api/Reports/Occupancy", { params: filters });
  return response.data;
};

/**
 * Get revenue report
 * @param {object} filters - { branchId, startDate, endDate, groupBy }
 * @returns {Promise} Response with revenue report data
 */
export const getRevenueReport = async (filters) => {
  const response = await api.get("/api/Reports/Revenue", { params: filters });
  return response.data;
};

/**
 * Get payments report
 * @param {object} filters - { branchId, startDate, endDate, paymentMethodId }
 * @returns {Promise} Response with payments report data
 */
export const getPaymentsReport = async (filters) => {
  const response = await api.get("/api/Reports/Payments", { params: filters });
  return response.data;
};

/**
 * Get room service sales report
 * @param {object} filters - { branchId, startDate, endDate }
 * @returns {Promise} Response with room service sales data
 */
export const getRoomServiceSalesReport = async (filters) => {
  const response = await api.get("/api/Reports/RoomServiceSales", { params: filters });
  return response.data;
};

/**
 * Get restaurant sales report
 * @param {object} filters - { branchId, startDate, endDate }
 * @returns {Promise} Response with restaurant sales data
 */
export const getRestaurantSalesReport = async (filters) => {
  const response = await api.get("/api/Reports/RestaurantSales", { params: filters });
  return response.data;
};

/**
 * Get audit logs
 * @param {object} filters - { userId, action, startDate, endDate, page, pageSize }
 * @returns {Promise} Response with audit logs
 */
export const getAuditLogs = async (filters = {}) => {
  const response = await api.get("/api/Reports/AuditLogs", { params: filters });
  return response.data;
};

