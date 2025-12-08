/**
 * Master Data Service
 * Handles all master data-related API calls (hotels, branches, amenities, rate plans, etc.)
 */

import api from "./api.js";

// ----------------------
// Hotels
// ----------------------

/**
 * Get all hotels
 * @param {object} filters - { isActive }
 * @returns {Promise} Response with hotels list
 */
export const getHotels = async (filters = {}) => {
  const response = await api.get("/api/Hotels", { params: filters });
  return response.data;
};

/**
 * Get hotel by ID
 * @param {number} hotelId - Hotel ID
 * @returns {Promise} Response with hotel details
 */
export const getHotelById = async (hotelId) => {
  const response = await api.get(`/api/Hotels/${hotelId}`);
  return response.data;
};

/**
 * Create new hotel
 * @param {object} hotelData - Hotel data
 * @returns {Promise} Response with created hotel
 */
export const createHotel = async (hotelData) => {
  const response = await api.post("/api/Hotels", hotelData);
  return response.data;
};

/**
 * Update hotel
 * @param {number} hotelId - Hotel ID
 * @param {object} hotelData - Updated hotel data
 * @returns {Promise} Response with updated hotel
 */
export const updateHotel = async (hotelId, hotelData) => {
  const response = await api.put(`/api/Hotels/${hotelId}`, hotelData);
  return response.data;
};

/**
 * Delete hotel
 * @param {number} hotelId - Hotel ID
 * @returns {Promise} Response
 */
export const deleteHotel = async (hotelId) => {
  const response = await api.del(`/api/Hotels/${hotelId}`);
  return response.data;
};

/**
 * Toggle hotel active status
 * @param {number} hotelId - Hotel ID
 * @param {boolean} isActive - Active status
 * @returns {Promise} Response
 */
export const toggleHotelActive = async (hotelId, isActive) => {
  const response = await api.patch(`/api/Hotels/${hotelId}/status`, { isActive });
  return response.data;
};

// ----------------------
// Branches
// ----------------------

/**
 * Get all branches
 * @param {object} filters - { hotelId, isActive }
 * @returns {Promise} Response with branches list
 */
export const getBranches = async (filters = {}) => {
  const response = await api.get("/api/Branches", { params: filters });
  return response.data;
};

/**
 * Get branches by hotel
 * @param {number} hotelId - Hotel ID
 * @returns {Promise} Response with branches list
 */
export const getBranchesByHotel = async (hotelId) => {
  const response = await api.get(`/api/Hotels/${hotelId}/branches`);
  return response.data;
};

/**
 * Get branch by ID
 * @param {number} branchId - Branch ID
 * @returns {Promise} Response with branch details
 */
export const getBranchById = async (branchId) => {
  const response = await api.get(`/api/Branches/${branchId}`);
  return response.data;
};

/**
 * Create new branch
 * @param {object} branchData - Branch data
 * @returns {Promise} Response with created branch
 */
export const createBranch = async (branchData) => {
  const response = await api.post("/api/Branches", branchData);
  return response.data;
};

/**
 * Update branch
 * @param {number} branchId - Branch ID
 * @param {object} branchData - Updated branch data
 * @returns {Promise} Response with updated branch
 */
export const updateBranch = async (branchId, branchData) => {
  const response = await api.put(`/api/Branches/${branchId}`, branchData);
  return response.data;
};

/**
 * Delete branch
 * @param {number} branchId - Branch ID
 * @returns {Promise} Response
 */
export const deleteBranch = async (branchId) => {
  const response = await api.del(`/api/Branches/${branchId}`);
  return response.data;
};

/**
 * Toggle branch active status
 * @param {number} branchId - Branch ID
 * @param {boolean} isActive - Active status
 * @returns {Promise} Response
 */
export const toggleBranchActive = async (branchId, isActive) => {
  const response = await api.patch(`/api/Branches/${branchId}/status`, { isActive });
  return response.data;
};

// ----------------------
// Amenities
// ----------------------

/**
 * Get all amenities
 * @param {object} filters - { isActive }
 * @returns {Promise} Response with amenities list
 */
export const getAmenities = async (filters = {}) => {
  const response = await api.get("/api/Amenities", { params: filters });
  return response.data;
};

/**
 * Get amenity by ID
 * @param {number} amenityId - Amenity ID
 * @returns {Promise} Response with amenity details
 */
export const getAmenityById = async (amenityId) => {
  const response = await api.get(`/api/Amenities/${amenityId}`);
  return response.data;
};

/**
 * Create new amenity
 * @param {object} amenityData - Amenity data
 * @returns {Promise} Response with created amenity
 */
export const createAmenity = async (amenityData) => {
  const response = await api.post("/api/Amenities", amenityData);
  return response.data;
};

/**
 * Update amenity
 * @param {number} amenityId - Amenity ID
 * @param {object} amenityData - Updated amenity data
 * @returns {Promise} Response with updated amenity
 */
export const updateAmenity = async (amenityId, amenityData) => {
  const response = await api.put(`/api/Amenities/${amenityId}`, amenityData);
  return response.data;
};

/**
 * Delete amenity
 * @param {number} amenityId - Amenity ID
 * @returns {Promise} Response
 */
export const deleteAmenity = async (amenityId) => {
  const response = await api.del(`/api/Amenities/${amenityId}`);
  return response.data;
};

// ----------------------
// Rate Plans
// ----------------------

/**
 * Get all rate plans
 * @param {object} filters - { branchId, roomTypeId, isActive }
 * @returns {Promise} Response with rate plans list
 */
export const getRatePlans = async (filters = {}) => {
  const response = await api.get("/api/RatePlans", { params: filters });
  return response.data;
};

/**
 * Get rate plan by ID
 * @param {number} ratePlanId - Rate Plan ID
 * @returns {Promise} Response with rate plan details
 */
export const getRatePlanById = async (ratePlanId) => {
  const response = await api.get(`/api/RatePlans/${ratePlanId}`);
  return response.data;
};

/**
 * Create new rate plan
 * @param {object} ratePlanData - Rate plan data
 * @returns {Promise} Response with created rate plan
 */
export const createRatePlan = async (ratePlanData) => {
  const response = await api.post("/api/RatePlans", ratePlanData);
  return response.data;
};

/**
 * Update rate plan
 * @param {number} ratePlanId - Rate Plan ID
 * @param {object} ratePlanData - Updated rate plan data
 * @returns {Promise} Response with updated rate plan
 */
export const updateRatePlan = async (ratePlanId, ratePlanData) => {
  const response = await api.put(`/api/RatePlans/${ratePlanId}`, ratePlanData);
  return response.data;
};

/**
 * Delete rate plan
 * @param {number} ratePlanId - Rate Plan ID
 * @returns {Promise} Response
 */
export const deleteRatePlan = async (ratePlanId) => {
  const response = await api.del(`/api/RatePlans/${ratePlanId}`);
  return response.data;
};

// ----------------------
// Menu
// ----------------------

/**
 * Get all menu items
 * @param {object} filters - { categoryId, isActive }
 * @returns {Promise} Response with menu items list
 */
export const getMenuItems = async (filters = {}) => {
  const response = await api.get("/api/Menu/Items", { params: filters });
  return response.data;
};

/**
 * Get menu item by ID
 * @param {number} menuItemId - Menu Item ID
 * @returns {Promise} Response with menu item details
 */
export const getMenuItemById = async (menuItemId) => {
  const response = await api.get(`/api/Menu/Items/${menuItemId}`);
  return response.data;
};

/**
 * Create new menu item
 * @param {object} menuItemData - Menu item data
 * @returns {Promise} Response with created menu item
 */
export const createMenuItem = async (menuItemData) => {
  const response = await api.post("/api/Menu/Items", menuItemData);
  return response.data;
};

/**
 * Update menu item
 * @param {number} menuItemId - Menu Item ID
 * @param {object} menuItemData - Updated menu item data
 * @returns {Promise} Response with updated menu item
 */
export const updateMenuItem = async (menuItemId, menuItemData) => {
  const response = await api.put(`/api/Menu/Items/${menuItemId}`, menuItemData);
  return response.data;
};

/**
 * Delete menu item
 * @param {number} menuItemId - Menu Item ID
 * @returns {Promise} Response
 */
export const deleteMenuItem = async (menuItemId) => {
  const response = await api.del(`/api/Menu/Items/${menuItemId}`);
  return response.data;
};

/**
 * Get menu categories
 * @param {object} filters - { isActive }
 * @returns {Promise} Response with menu categories list
 */
export const getMenuCategories = async (filters = {}) => {
  const response = await api.get("/api/Menu/Categories", { params: filters });
  return response.data;
};

// ----------------------
// Taxes & Payment Methods
// ----------------------

/**
 * Get all taxes
 * @param {object} filters - { isActive }
 * @returns {Promise} Response with taxes list
 */
export const getTaxes = async (filters = {}) => {
  const response = await api.get("/api/Taxes", { params: filters });
  return response.data;
};

/**
 * Get payment methods
 * @param {object} filters - { isActive }
 * @returns {Promise} Response with payment methods list
 */
export const getPaymentMethods = async (filters = {}) => {
  const response = await api.get("/api/PaymentMethods", { params: filters });
  return response.data;
};

// ----------------------
// Users & Roles
// ----------------------

/**
 * Get all users
 * @param {object} filters - { roleId, isActive }
 * @returns {Promise} Response with users list
 */
export const getUsers = async (filters = {}) => {
  const response = await api.get("/api/Users", { params: filters });
  return response.data;
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise} Response with user details
 */
export const getUserById = async (userId) => {
  const response = await api.get(`/api/Users/${userId}`);
  return response.data;
};

/**
 * Create new user
 * @param {object} userData - User data
 * @returns {Promise} Response with created user
 */
export const createUser = async (userData) => {
  const response = await api.post("/api/Users", userData);
  return response.data;
};

/**
 * Update user
 * @param {number} userId - User ID
 * @param {object} userData - Updated user data
 * @returns {Promise} Response with updated user
 */
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/api/Users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user
 * @param {number} userId - User ID
 * @returns {Promise} Response
 */
export const deleteUser = async (userId) => {
  const response = await api.del(`/api/Users/${userId}`);
  return response.data;
};

/**
 * Get all roles
 * @returns {Promise} Response with roles list
 */
export const getRoles = async () => {
  const response = await api.get("/api/Roles");
  return response.data;
};

/**
 * Get dropdown data (common master data)
 * @param {string} entityType - Entity type (e.g., "Hotels", "Branches", "RoomTypes")
 * @returns {Promise} Response with dropdown data
 */
export const getDropdownData = async (entityType) => {
  const response = await api.get("/api/Master/GetDropDownData", {
    params: { entityType },
  });
  return response.data;
};

