// src/context/SessionTimeoutContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import {SessionTimeoutMinutes} from "../utils/url";

const SessionTimeoutContext = createContext(null);

/**
 * Use env value OR fallback default 15 minutes
 * (handles undefined, empty, or non-number gracefully)
 */
const SESSION_TIMEOUT_MINUTES = Number(SessionTimeoutMinutes) || 15;

/** Convert minutes → seconds */
const SESSION_DURATION_SEC = SESSION_TIMEOUT_MINUTES * 60;

/** localStorage key for cross-tab sync */
const STORAGE_KEY = "session_expires_at"; // epoch ms

export function SessionTimeoutProvider({ children }) {
  const { isAuthenticated, logout } = useAuth();

  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SEC);
  const [showModal, setShowModal] = useState(false);
  const [expiresAt, setExpiresAtState] = useState(null); // epoch ms or null

  const timerRef = useRef(null);
  const expiresAtRef = useRef(null);

  /* -----------------------------------------------------------
     Helpers
  ----------------------------------------------------------- */

  // Keep ref + state + localStorage in sync
  const setAndBroadcastExpiresAt = useCallback((epochMsOrNull) => {
    expiresAtRef.current = epochMsOrNull;
    setExpiresAtState(epochMsOrNull);

    if (epochMsOrNull) {
      localStorage.setItem(STORAGE_KEY, String(epochMsOrNull));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Recompute remaining seconds based on expiresAtRef
  const recomputeRemaining = useCallback(() => {
    const exp = expiresAtRef.current;
    if (!exp) {
      setRemainingSeconds(SESSION_DURATION_SEC);
      return;
    }

    const diffMs = exp - Date.now();
    const secs = Math.max(0, Math.floor(diffMs / 1000));
    setRemainingSeconds(secs);

    if (secs <= 0) {
      clearTimer();
      setShowModal(true); // session really expired
    }
  }, [clearTimer]);

  /* -----------------------------------------------------------
     Effect: when auth state changes
  ----------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out in this tab
      clearTimer();
      setShowModal(false);
      setAndBroadcastExpiresAt(null);
      setRemainingSeconds(SESSION_DURATION_SEC);
      return;
    }

    // User logged in or page refreshed while logged in
    clearTimer();

    // Try to reuse existing expiry from localStorage (cross-tab)
    const stored = localStorage.getItem(STORAGE_KEY);
    let nextExp = Date.now() + SESSION_DURATION_SEC * 1000;

    if (stored) {
      const ts = parseInt(stored, 10);
      if (!Number.isNaN(ts) && ts > Date.now()) {
        nextExp = ts;
      }
    }

    setShowModal(false);
    setAndBroadcastExpiresAt(nextExp);
    recomputeRemaining();

    // Start countdown timer
    timerRef.current = setInterval(() => {
      recomputeRemaining();
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [isAuthenticated, clearTimer, setAndBroadcastExpiresAt, recomputeRemaining]);

  /* -----------------------------------------------------------
     Effect: user activity -> auto "refresh session"
     (extends expiry; you can also plug real token refresh here)
  ----------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      "click",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      const currentExp = expiresAtRef.current;
      if (!currentExp) return;

      // If already expired, ignore activity (modal stays)
      if (currentExp <= Date.now()) return;

      // AUTO-REFRESH SESSION: extend expiry window
      const newExp = Date.now() + SESSION_DURATION_SEC * 1000;
      setAndBroadcastExpiresAt(newExp);
      // Note: timer already running, so next tick will recalc remainingSeconds

      // 🔁 PLACE TO CALL REAL REFRESH TOKEN API (OPTIONAL)
      // Example:
      // await authService.refreshToken();
      // Then update auth token in your AuthContext if needed.
    };

    activityEvents.forEach((ev) =>
      window.addEventListener(ev, handleActivity)
    );

    return () => {
      activityEvents.forEach((ev) =>
        window.removeEventListener(ev, handleActivity)
      );
    };
  }, [isAuthenticated, setAndBroadcastExpiresAt]);

  /* -----------------------------------------------------------
     Effect: listen to localStorage changes (cross-tab sync)
  ----------------------------------------------------------- */

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;

      // Another tab cleared the session expiry (e.g., logout)
      if (event.newValue === null) {
        clearTimer();
        expiresAtRef.current = null;
        setExpiresAtState(null);
        setShowModal(false);
        setRemainingSeconds(SESSION_DURATION_SEC);
        return;
      }

      // Another tab updated expiry or expired
      const ts = parseInt(event.newValue, 10);
      if (Number.isNaN(ts)) return;

      expiresAtRef.current = ts;
      setExpiresAtState(ts);
      recomputeRemaining();

      if (!timerRef.current && isAuthenticated) {
        timerRef.current = setInterval(() => {
          recomputeRemaining();
        }, 1000);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [clearTimer, recomputeRemaining, isAuthenticated]);

  /* -----------------------------------------------------------
     User confirms on modal -> logout (all tabs react via auth)
  ----------------------------------------------------------- */

  const handleExpireConfirm = () => {
    setShowModal(false);
    setAndBroadcastExpiresAt(null);
    logout(); // ProtectedRoute will send them to /login in this tab
  };

  return (
    <SessionTimeoutContext.Provider
      value={{
        remainingSeconds,
        showModal,
        expiresAt,
        handleExpireConfirm,
      }}
    >
      {children}
    </SessionTimeoutContext.Provider>
  );
}

export const useSessionTimeout = () => useContext(SessionTimeoutContext);
