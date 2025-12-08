import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppName } from "../../utils/url.js";
import { forgotPasswordRequest } from "../../services/authService.js";
import {
  showSuccessToast,
  showErrorToast,
  TOAST_POSITIONS,
} from "../../utils/toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Reset error
    setError("");

    // Validate email
    if (!email.trim()) {
      setError("Enter your registered Email ID.");
      showErrorToast("Enter your registered Email ID.", {
        position: TOAST_POSITIONS.TOP_CENTER,
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      showErrorToast("Please enter a valid email address.", {
        position: TOAST_POSITIONS.TOP_CENTER,
      });
      return;
    }

    setLoading(true);

    try {
      // Call the API
      await forgotPasswordRequest({ email: email.trim() });
      
      // Success message
      showSuccessToast(
        "Password reset link sent to your email.",
        { position: TOAST_POSITIONS.TOP_CENTER }
      );
      
      // Clear email field after success
      setEmail("");
    } catch (err) {
      // Error is already handled by axios interceptors, but we can add local error state
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "Failed to send reset link. Please try again.";
      setError(errorMessage);
      showErrorToast(errorMessage, {
        position: TOAST_POSITIONS.TOP_CENTER,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f6f7fa] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 space-y-6 border border-gray-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
            {AppName}
          </h1>
          <h2 className="text-xl font-semibold text-[#1e293b]">
            Forgot Password
          </h2>
          <p className="text-sm text-[#64748b] mt-2">
            Enter your registered email to receive a reset link.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
              Email
            </label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent ${
                error
                  ? "border-red-300 bg-red-50"
                  : "border-[#e2e8f0] bg-white hover:border-gray-300"
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(""); // Clear error on input
              }}
              disabled={loading}
              aria-invalid={!!error}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-[#b45309] hover:to-[#92400e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Please wait...
              </>
            ) : (
              <>
                Send Reset Link
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="ml-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            to="/"
            className="text-sm text-[#64748b] hover:text-[#1e293b] font-medium transition-colors flex items-center gap-1"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
