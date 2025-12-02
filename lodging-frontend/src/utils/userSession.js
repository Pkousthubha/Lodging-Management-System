// src/utils/UserSession.js

/**
 * Safely returns the parsed "user" object from localStorage.
 * @returns {object|null}
 */
export function getUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Returns the login_id (PreparedBy / CreatedBy) from the user session.
 * Used in Save/Update API calls for tracking who submitted the record.
 *
 * @returns {string}
 */
export function getPreparedBy() {
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return "";
    const user = JSON.parse(userRaw);
    return user.login_id || "";
  } catch {
    return "";
  }
}

/**
 * Returns the App Version from the user session.
 *
 * @returns {string}
 */
export function getAppVersion() {
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return "1.0";
    const user = JSON.parse(userRaw);
    return user.AppVersionNo || "1.0";
  } catch {
    return "1.0";
  }
}

/**
 * Optional helper (if needed elsewhere):
 * Safely returns employeeID from user object.
 */
export function getEmployeeID() {
  const user = getUser();
  return user?.employeeID || "";
}
