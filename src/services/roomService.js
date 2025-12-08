/**
 * Room Service
 * Handles all room and room type-related API calls
 */

import api from "./api.js";

/**
 * Get all rooms
 * @param {object} filters - { branchId, floorId, roomTypeId, status }
 * @returns {Promise} Response with rooms list
 */
export const getRooms = async (filters = {}) => {
  const response = await api.get("/api/Rooms", { params: filters });
  return response.data;
};

/**
 * Get room by ID
 * @param {number} roomId - Room ID
 * @returns {Promise} Response with room details
 */
export const getRoomById = async (roomId) => {
  const response = await api.get(`/api/Rooms/${roomId}`);
  return response.data;
};

/**
 * Create new room
 * @param {object} roomData - Room data
 * @returns {Promise} Response with created room
 */
export const createRoom = async (roomData) => {
  const response = await api.post("/api/Rooms", roomData);
  return response.data;
};

/**
 * Update room
 * @param {number} roomId - Room ID
 * @param {object} roomData - Updated room data
 * @returns {Promise} Response with updated room
 */
export const updateRoom = async (roomId, roomData) => {
  const response = await api.put(`/api/Rooms/${roomId}`, roomData);
  return response.data;
};

/**
 * Delete room
 * @param {number} roomId - Room ID
 * @returns {Promise} Response
 */
export const deleteRoom = async (roomId) => {
  const response = await api.del(`/api/Rooms/${roomId}`);
  return response.data;
};

/**
 * Update room status
 * @param {number} roomId - Room ID
 * @param {object} data - { status, notes }
 * @returns {Promise} Response
 */
export const updateRoomStatus = async (roomId, data) => {
  const response = await api.patch(`/api/Rooms/${roomId}/status`, data);
  return response.data;
};

/**
 * Get room status board
 * @param {object} filters - { branchId, date }
 * @returns {Promise} Response with room status data
 */
export const getRoomStatusBoard = async (filters = {}) => {
  const response = await api.get("/api/Rooms/Status", { params: filters });
  return response.data;
};

// ----------------------
// Room Types
// ----------------------

/**
 * Get all room types
 * @param {object} filters - { branchId, isActive }
 * @returns {Promise} Response with room types list
 */
export const getRoomTypes = async (filters = {}) => {
  const response = await api.get("/api/RoomTypes", { params: filters });
  return response.data;
};

/**
 * Get room type by ID
 * @param {number} roomTypeId - Room Type ID
 * @returns {Promise} Response with room type details
 */
export const getRoomTypeById = async (roomTypeId) => {
  const response = await api.get(`/api/RoomTypes/${roomTypeId}`);
  return response.data;
};

/**
 * Create new room type
 * @param {object} roomTypeData - Room type data
 * @returns {Promise} Response with created room type
 */
export const createRoomType = async (roomTypeData) => {
  const response = await api.post("/api/RoomTypes", roomTypeData);
  return response.data;
};

/**
 * Update room type
 * @param {number} roomTypeId - Room Type ID
 * @param {object} roomTypeData - Updated room type data
 * @returns {Promise} Response with updated room type
 */
export const updateRoomType = async (roomTypeId, roomTypeData) => {
  const response = await api.put(`/api/RoomTypes/${roomTypeId}`, roomTypeData);
  return response.data;
};

/**
 * Delete room type
 * @param {number} roomTypeId - Room Type ID
 * @returns {Promise} Response
 */
export const deleteRoomType = async (roomTypeId) => {
  const response = await api.del(`/api/RoomTypes/${roomTypeId}`);
  return response.data;
};

/**
 * Toggle room type active status
 * @param {number} roomTypeId - Room Type ID
 * @param {boolean} isActive - Active status
 * @returns {Promise} Response
 */
export const toggleRoomTypeActive = async (roomTypeId, isActive) => {
  const response = await api.patch(`/api/RoomTypes/${roomTypeId}/status`, { isActive });
  return response.data;
};

/**
 * Public: Get room type details (for public booking site)
 * @param {number} roomTypeId - Room Type ID
 * @returns {Promise} Response with room type details
 */
export const getPublicRoomTypeDetails = async (roomTypeId) => {
  const response = await api.get(`/api/Public/Rooms/${roomTypeId}`);
  return response.data;
};

