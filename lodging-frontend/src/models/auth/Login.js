/**
 * LoginRequest interface (JSDoc style for JSX compatibility)
 *
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 * @property {boolean} [rememberMe]
 */

/**
 * Builds a LoginRequest object.
 *
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe
 * @returns {LoginRequest}
 */
export function LoginRequest(email, password, rememberMe = false) {
  return {
    email,
    password,
    rememberMe,
  };
}
