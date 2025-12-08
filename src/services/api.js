/**
 * Base API Configuration
 * 
 * This file provides a centralized axios instance for making API calls to the .NET backend.
 * The axios instance automatically uses interceptors configured in src/lib/axiosClient.js
 * for authentication, error handling, and token refresh.
 * 
 * IMPORTANT: Update the baseURL below with your actual .NET API URL.
 * You can also set it via environment variable VITE_API_BASE_URL in your .env file.
 */

// Import axiosClient to initialize interceptors
import "../lib/axiosClient.js";
import axios from "axios";
import { baseUrl } from "../utils/url";

// Base URL for the .NET API
// TODO: Replace with your actual .NET backend URL
// Example: "https://localhost:44309" or "https://api.yourdomain.com"
const API_BASE_URL = baseUrl || "https://localhost:44309";

/**
 * Create axios instance with base configuration
 * This instance will automatically use interceptors from axiosClient.js
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Generic GET request helper
 * @param {string} url - API endpoint (e.g., "/api/Auth/Login")
 * @param {object} config - Optional axios config (params, headers, etc.)
 * @returns {Promise} Axios response
 */
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic POST request helper
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} config - Optional axios config
 * @returns {Promise} Axios response
 */
export const post = async (url, data, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic PUT request helper
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} config - Optional axios config
 * @returns {Promise} Axios response
 */
export const put = async (url, data, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic PATCH request helper
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} config - Optional axios config
 * @returns {Promise} Axios response
 */
export const patch = async (url, data, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic DELETE request helper
 * @param {string} url - API endpoint
 * @param {object} config - Optional axios config
 * @returns {Promise} Axios response
 */
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// Export the axios instance for advanced use cases
export default api;

