import axios from "axios";
import { detectNetworkOrCorsError } from "../utils/networkUtils";
import { auth, ContentType, ensureBaseUrl, baseUrl } from "../utils/url";

const AXIOS_GUARD_KEY = "__AXIOS_INTERCEPTORS_INSTALLED__";

// TOKEN STORAGE KEYS
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

let API_BASE_URL = "";
try {
  API_BASE_URL = baseUrl || "";
} catch (e) {
  // Not running under Vite (fallback to relative)
  API_BASE_URL = "";
  void e;
}

const safeShowToast = (message, type = "error") => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    // Fallback – visible in console if ToastProvider not mounted yet
    console[type === "error" ? "error" : "log"](
      `[GLOBAL ${type.toUpperCase()}]`,
      message
    );
  }
};

// REFRESH TOKEN SUPPORT
let isRefreshing = false;
let refreshQueue = [];

const REFRESH_ENDPOINT_PATH = auth.refresh_token;

/**
 * Low-level refresh-token call.
 * Uses fetch instead of axios to avoid interceptor recursion.
 */
const doRefreshTokenRequest = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Build refresh URL
  let refreshUrl = REFRESH_ENDPOINT_PATH;
  if (API_BASE_URL) {
    refreshUrl = API_BASE_URL.replace(/\/+$/, "") + REFRESH_ENDPOINT_PATH;
  }

  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      "Content-Type": ContentType,
    },
    // Body shape must match your .NET API
    body: JSON.stringify({ refreshToken }),
    // credentials: "include", // if needed
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();

  let tokenContainer = data;

  if (
    data &&
    data.data &&
    Array.isArray(data.data.REFRESH_TOKEN_RESPONSE) &&
    data.data.REFRESH_TOKEN_RESPONSE.length > 0
  ) {
    tokenContainer = data.data.REFRESH_TOKEN_RESPONSE[0];
  }

  const newAccessToken =
    tokenContainer.accessToken ||
    tokenContainer.AccessToken ||
    tokenContainer.token ||
    null;

  const newRefreshToken =
    tokenContainer.refreshToken || tokenContainer.RefreshToken || null;

  if (!newAccessToken) {
    throw new Error("No access token in refresh response");
  }

  // Persist tokens
  localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  if (newRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }

  // Update access token expiry based on TokenExpirationInMinutes ---
  try {
    const now = new Date();
    const expMinutes = tokenContainer.TokenExpirationInMinutes;
    if (typeof expMinutes === "number") {
      const accessExpiry = new Date(now.getTime() + expMinutes * 60_000);
      localStorage.setItem(
        "token_expiry_date_time",
        accessExpiry.toISOString()
      );
    }
  } catch (e) {
    void e;
  }

  // Update refresh token expiry based on RefreshTokenExpiresAt (days) ---
  try {
    const now = new Date();
    const refreshDays = tokenContainer.RefreshTokenExpiresAt;
    if (typeof refreshDays === "number") {
      const refreshExpiry = new Date(
        now.getTime() + refreshDays * 24 * 60 * 60_000
      );
      localStorage.setItem(
        "refresh_token_expiry_date_time",
        refreshExpiry.toISOString()
      );
    } else if (tokenContainer.refreshTokenExpiryDateTime) {
      const dt = new Date(tokenContainer.refreshTokenExpiryDateTime);
      if (!Number.isNaN(dt.getTime())) {
        localStorage.setItem(
          "refresh_token_expiry_date_time",
          dt.toISOString()
        );
      }
    }
  } catch (e) {
    void e;
  }

  // Optional: mark session restored
  try {
    window.dispatchEvent(new Event("sessionRestored"));
  } catch (e) {
    void e;
  }

  return newAccessToken;
};

/**
 * Queue wrapper so only ONE refresh request goes out.
 * Other 401s/403s wait for that refresh to complete.
 */
const getOrCreateRefreshPromise = () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  const refreshPromise = doRefreshTokenRequest()
    .then((newAccessToken) => {
      refreshQueue.forEach((p) => p.resolve(newAccessToken));
      refreshQueue = [];
      isRefreshing = false;
      return newAccessToken;
    })
    .catch((err) => {
      refreshQueue.forEach((p) => p.reject(err));
      refreshQueue = [];
      isRefreshing = false;
      throw err;
    });

  return refreshPromise;
};

if (!window[AXIOS_GUARD_KEY]) {
  window[AXIOS_GUARD_KEY] = true;

  /** Attach stored token + ensure base URL */
  const attachAuthHeader = (config) => {
    // Global base URL guard – runs for EVERY axios request
    ensureBaseUrl();

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  /** Global session expiry handler */
  const handle401SessionExpired = () => {
    try {
      window.__SESSION_EXPIRED__ = true;
      window.dispatchEvent(new Event("sessionExpired"));
    } catch (e) {
      void e;
    }
  };

  /**
   * Helper: read access / refresh token expiry flags from localStorage.
   * - Returns { isAccessExpired, isRefreshExpired }
   */
  const getTokenExpiryState = () => {
    const now = Date.now();

    const accessStr = localStorage.getItem("token_expiry_date_time");
    const refreshStr = localStorage.getItem("refresh_token_expiry_date_time");

    let isAccessExpired = false;
    let isRefreshExpired = false;

    if (accessStr) {
      const t = Date.parse(accessStr);
      if (!Number.isNaN(t) && now > t) {
        isAccessExpired = true;
      }
    }

    if (refreshStr) {
      const t = Date.parse(refreshStr);
      if (!Number.isNaN(t) && now > t) {
        isRefreshExpired = true;
      }
    }

    return { isAccessExpired, isRefreshExpired };
  };

  /**
   * GLOBAL ERROR HANDLER (Network + CORS + SSL + 400/403/500 etc. + 401/403 w/ refresh)
   * NOTE: receives the axios instance so retries use the same instance.
   */
  const handleGlobalError = async (error, instance) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    /* NETWORK / CORS / SSL ERROR */
    if (!error.response && error.config) {
      try {
        const baseURL = error.config.baseURL || "";
        const url = error.config.url || "";

        let apiUrl;
        if (/^https?:\/\//i.test(url)) apiUrl = url;
        else if (baseURL)
          apiUrl = baseURL.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
        else apiUrl = url || window.location.origin;

        const result = await detectNetworkOrCorsError(apiUrl);

        const finalMessage =
          result?.message || "Network Error. Please try again.";

        // GLOBAL toast
        safeShowToast(finalMessage, "error");

        // Make axios error readable globally
        error.customMessage = finalMessage;
        error.message = finalMessage;
      } catch (e) {
        void e;
      }

      return Promise.reject(error);
    }

    /** 401/403 – TRY REFRESH TOKEN ONLY IF ACCESS TOKEN EXPIRED */
    if ((status === 401 || status === 403) && originalRequest) {
      const { isAccessExpired, isRefreshExpired } = getTokenExpiryState();

      // Avoid infinite loops
      if (originalRequest._retry) {
        handle401SessionExpired();
        return Promise.reject(error);
      }

      const urlString = String(originalRequest.url || "").toLowerCase();

      // Skip refresh logic for login/refresh endpoints
      // (e.g., /api/Auth/Login, /api/Auth/RefreshToken)
      if (
        urlString.includes("/auth/login") ||
        urlString.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      // If BOTH access and refresh tokens are expired → no refresh call, just session expired.
      if (isAccessExpired && isRefreshExpired) {
        handle401SessionExpired();
        return Promise.reject(error);
      }

      // If access token is NOT expired, do NOT call refresh API.
      // Treat this as a hard auth error (wrong token, revoked, etc.).
      if (!isAccessExpired) {
        handle401SessionExpired();
        return Promise.reject(error);
      }

      // At this point: access expired, refresh NOT expired → allowed to call refresh API.
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        // No refresh token stored → treat as real session expiry
        handle401SessionExpired();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await getOrCreateRefreshPromise();

        // Attach new token and retry the original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshErr) {
        // Refresh failed → clear tokens and treat as session expiry
        try {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem("token_expiry_date_time");
          localStorage.removeItem("refresh_token_expiry_date_time");
        } catch (e) {
          void e;
        }

        safeShowToast(
          "Your session has expired. Please log in again.",
          "error"
        );

        handle401SessionExpired();
        return Promise.reject(refreshErr);
      }
    }

    /** GLOBAL API ERROR RESPONSE (400,403, 404,408,500,503) */
    if ([400, 403, 404, 408, 500, 503].includes(status)) {
      const payload = error?.response?.data;
      // Support both { data: { GLOBAL_ERROR_RESPONSE } } and { GLOBAL_ERROR_RESPONSE }
      const container = payload?.data || payload;
      const globalErr = container?.GLOBAL_ERROR_RESPONSE;

      let detail = null;

      if (Array.isArray(globalErr) && globalErr.length > 0) {
        const first = globalErr[0] || {};
        detail = first.ErrorDetail || first.Title || "Something went wrong.";
      }

      // Fallback specifically for 404 in case GLOBAL_ERROR_RESPONSE is missing or malformed
      if (!detail && status === 404) {
        if (payload && typeof payload === "object") {
          detail = payload.detail || payload.title || null;
        }
        if (!detail) {
          detail = "The Requested Resource Was Not Found.";
        }
      }

      // Generic fallback for other statuses if still nothing
      if (!detail) {
        detail = "Something went wrong.";
      }

      if (detail) {
        // Show global toast (or console fallback)
        safeShowToast(detail, "error");

        // Make axios error readable globally
        error.customMessage = detail;
        error.message = detail;

        // CRITICAL: override backend "message": "OK" and similar fields
        try {
          const resp = error.response;

          if (resp && resp.data && typeof resp.data === "object") {
            const d = resp.data; // ← pure JS

            // Most common ones
            d.message = detail;
            d.Message = detail;

            // Some APIs use errorMessage
            d.errorMessage = detail;
            d.ErrorMessage = detail;

            // Useful alias
            d.userMessage = detail;

            // Normalize Status fields
            if ("Status" in d) d.Status = "Error";
            if ("status" in d && typeof d.status === "string")
              d.status = "Error";
          }
        } catch (e) {
          void e;
        }
      }
    }

    return Promise.reject(error);
  };

  /** Install interceptors into any axios instance */
  const attachInterceptors = (instance) => {
    instance.interceptors.request.use(attachAuthHeader);

    instance.interceptors.response.use(
      (res) => res,
      (err) => handleGlobalError(err, instance)
    );
  };

  // Default axios
  attachInterceptors(axios);

  // Any axios.create()
  const originalCreate = axios.create.bind(axios);
  axios.create = (config) => {
    const instance = originalCreate(config);
    attachInterceptors(instance);
    return instance;
  };
}
