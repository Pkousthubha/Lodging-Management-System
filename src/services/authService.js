/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api from "./api.js";

/**
 * Login user
 * @param {object} credentials - { email, password, rememberMe }
 * @returns {Promise} Response with access token and refresh token
 * @throws {Error} If login fails or response is invalid
 */
export const login = async (credentials) => {
  const response = await api.post("/api/Auth/Login", credentials);
  const data = response.data;
  
  // Validate response structure - check for success message
  if (!data || data.message !== "OK") {
    const errorMessage = data?.message || data?.Message || "Invalid email or password";
    const error = new Error(errorMessage);
    error.response = {
      status: 401,
      data: { message: errorMessage }
    };
    throw error;
  }
  
  // Validate that USER_LOGIN_DETAILS exists
  if (!data.data || !data.data.USER_LOGIN_DETAILS) {
    const error = new Error("Invalid login response: missing user details");
    error.response = {
      status: 401,
      data: { message: "Invalid email or password" }
    };
    throw error;
  }
  
  return data;
};

/**
 * Logout user
 * @returns {Promise} Response
 */
export const logout = async () => {
  const response = await api.post("/api/Auth/Logout");
  return response.data;
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} Response with new access token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post("/api/Auth/RefreshToken", { refreshToken });
  return response.data;
};

/**
 * Change password
 * @param {object} data - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise} Response
 */
export const changePassword = async (data) => {
  const response = await api.post("/api/Auth/ChangePassword", data);
  return response.data;
};

/**
 * Request password reset (forgot password)
 * @param {object} data - { email }
 * @returns {Promise} Response
 */
export const forgotPasswordRequest = async (data) => {
  const response = await api.post("/api/Auth/ForgotPasswordRequest", data);
  return response.data;
};

/**
 * Reset password with token
 * @param {object} data - { token, email, newPassword, confirmPassword }
 * @returns {Promise} Response
 */
export const resetPassword = async (data) => {
  const response = await api.post("/api/Auth/ResetPassword", data);
  return response.data;
};

/**
 * Register new user
 * @param {object} data - { userId: 0, email, password, fullName, roleId }
 * @returns {Promise} Response with created user
 */
export const register = async (data) => {
  const response = await api.post("/api/UserRegister/SaveAndUpdateUser", data);
  return response.data;
};

