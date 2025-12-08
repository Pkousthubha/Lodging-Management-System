/**
 * Housekeeping Service
 * Handles all housekeeping-related API calls
 */

import api from "./api.js";

/**
 * Get all housekeeping tasks
 * @param {object} filters - { branchId, roomId, status, assignedTo, date }
 * @returns {Promise} Response with tasks list
 */
export const getHousekeepingTasks = async (filters = {}) => {
  const response = await api.get("/api/Housekeeping/Tasks", { params: filters });
  return response.data;
};

/**
 * Get housekeeping task by ID
 * @param {number} taskId - Task ID
 * @returns {Promise} Response with task details
 */
export const getHousekeepingTaskById = async (taskId) => {
  const response = await api.get(`/api/Housekeeping/Tasks/${taskId}`);
  return response.data;
};

/**
 * Create new housekeeping task
 * @param {object} taskData - Task data
 * @returns {Promise} Response with created task
 */
export const createHousekeepingTask = async (taskData) => {
  const response = await api.post("/api/Housekeeping/Tasks", taskData);
  return response.data;
};

/**
 * Update housekeeping task
 * @param {number} taskId - Task ID
 * @param {object} taskData - Updated task data
 * @returns {Promise} Response with updated task
 */
export const updateHousekeepingTask = async (taskId, taskData) => {
  const response = await api.put(`/api/Housekeeping/Tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Update housekeeping task status
 * @param {number} taskId - Task ID
 * @param {object} data - { status, notes, completedBy }
 * @returns {Promise} Response
 */
export const updateHousekeepingTaskStatus = async (taskId, data) => {
  const response = await api.patch(`/api/Housekeeping/Tasks/${taskId}/status`, data);
  return response.data;
};

/**
 * Delete housekeeping task
 * @param {number} taskId - Task ID
 * @returns {Promise} Response
 */
export const deleteHousekeepingTask = async (taskId) => {
  const response = await api.del(`/api/Housekeeping/Tasks/${taskId}`);
  return response.data;
};

/**
 * Get housekeeping board (room status overview)
 * @param {object} filters - { branchId, date, floorId }
 * @returns {Promise} Response with housekeeping board data
 */
export const getHousekeepingBoard = async (filters = {}) => {
  const response = await api.get("/api/Housekeeping/Board", { params: filters });
  return response.data;
};

/**
 * Get room status for housekeeping
 * @param {object} filters - { branchId, date }
 * @returns {Promise} Response with room status data
 */
export const getRoomStatusForHousekeeping = async (filters = {}) => {
  const response = await api.get("/api/Housekeeping/RoomStatus", { params: filters });
  return response.data;
};

