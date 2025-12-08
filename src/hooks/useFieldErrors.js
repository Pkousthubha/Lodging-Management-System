// src/hooks/useFieldErrors.js
import { useState, useCallback } from "react";

/**
 * A simple hook to manage and auto-clear field-level errors.
 * Returns:
 *   errors: Record<string, string> (current errors)
 *   setFieldError: (key, message) => void
 *   clearFieldError: (key) => void
 *   bindField: (key, setter) => onChange handler with auto-clear
 *   setErrors: direct setter (for validateValues output)
 */
export function useFieldErrors() {
  const [errors, setErrors] = useState({});

  // Set a specific error message
  const setFieldError = useCallback((key, message) => {
    setErrors((prev) => ({ ...prev, [key]: message }));
  }, []);

  // Clear a specific field's error
  const clearFieldError = useCallback((key) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _omit, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Returns an onChange handler for an input field that
   * updates the setter and auto-clears its error.
   */
  const bindField = useCallback(
    (key, setter) => {
      return (e) => {
        setter(e.target.value);
        clearFieldError(key);
      };
    },
    [clearFieldError]
  );

  return { errors, setErrors, setFieldError, clearFieldError, bindField };
}
