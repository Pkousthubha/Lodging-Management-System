// src/utils/authHeaders.js
import { ContentType } from "./url";

/**
 * Read access token from localStorage.
 * Centralized here for consistency across all services.
 */
export const getAccessToken = () => {
  return localStorage.getItem("accessToken") || "";
};

/**
 * Builds Axios headers with optional Bearer token.
 * If no token passed, it automatically picks from storage.
 */
export const buildAuthHeaders = (accessToken) => {
  const token = accessToken || getAccessToken();

  return {
    "Content-Type": ContentType,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Headers WITHOUT Authorization token
 */
export const buildAuthHeadersWithoutAccessToken = () => ({
  "Content-Type": ContentType,
});
