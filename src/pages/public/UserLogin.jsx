import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBooking } from "../../context/BookingContext.jsx";

import { validateValues } from "../../utils/Validation.js";
import { buildRules } from "../../utils/ValidationHelper.js";
import { useFieldErrors } from "../../hooks/useFieldErrors";
import { AppName } from "../../utils/url.js";

export default function UserLogin() {
  const { login, isAuthenticated, isPublicUser } = useAuth();
  const { loadSearchState, hasBookingState } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { errors, setErrors, bindField } = useFieldErrors();

  // Redirect if already logged in as public user
  useEffect(() => {
    if (isAuthenticated && isPublicUser) {
      navigate("/public/booking", { replace: true });
    }
  }, [isAuthenticated, isPublicUser, navigate]);

  // Load saved email
  useEffect(() => {
    const saved = localStorage.getItem("public_savedRemember") === "true";
    if (saved) {
      setRememberMe(true);
      setEmail(localStorage.getItem("public_savedEmail") || "");
    }
  }, []);

  // Validation Rules
  const rules = buildRules({
    email: { required: "Enter your Email ID.", type: "email" },
    pwd: { required: "Enter your Password." },
  });

  const runValidation = () => {
    const values = {
      email,
      pwd: password,
    };

    const newErrors = validateValues(values, rules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;
    setAuthError("");
    if (!runValidation()) return;

    setLoading(true);

    // TODO: Replace with actual API call
    // For demo: accept any email/password combination (except admin)
    // In production, this would call the API to authenticate public users
    setTimeout(() => {
      // Simulate API call - in real app, check against backend
      const normalizedEmail = email.trim().toLowerCase();
      
      // Prevent admin login through public login
      if (normalizedEmail === "admin@inspirehotels.com") {
        setErrors((prev) => ({ ...prev, pwd: "Please use admin login page for admin access." }));
        setAuthError("Please use admin login page for admin access.");
        setLoading(false);
        return;
      }

      // Fake API Login (simulate success)
      // In production, get user data from API response
      login({
        name: email.split("@")[0], // Temporary: use email prefix as name
        email: normalizedEmail,
        role: "user"
      });

      // Save Remember Me only after successful login
      if (rememberMe) {
        localStorage.setItem("public_savedEmail", normalizedEmail);
        localStorage.setItem("public_savedRemember", "true");
      } else {
        localStorage.removeItem("public_savedEmail");
        localStorage.removeItem("public_savedRemember");
      }

      // Check for redirect parameter or saved booking state
      const redirectPath = searchParams.get("redirect");
      const hasSavedBooking = hasBookingState || loadSearchState();
      
      // If there's a redirect param or saved booking state, go to booking page
      // Otherwise, go to booking page by default
      if (redirectPath || hasSavedBooking) {
        navigate("/public/booking", { replace: true });
      } else {
        navigate("/public/booking", { replace: true });
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f6f7fa] p-4 login-page">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 space-y-6 border border-gray-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
            {AppName}
          </h1>
          <h2 className="text-xl font-semibold text-[#1e293b]">
            Login to your account
          </h2>
          <p className="text-sm text-[#64748b] mt-2">
            Sign in to book rooms and manage your reservations.
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {authError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
              Email
            </label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent ${
                errors.email 
                  ? "border-red-300 bg-red-50" 
                  : "border-[#e2e8f0] bg-white hover:border-gray-300"
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={bindField("email", setEmail)}
              disabled={loading}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent ${
                  errors.pwd 
                    ? "border-red-300 bg-red-50" 
                    : "border-[#e2e8f0] bg-white hover:border-gray-300"
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={bindField("pwd", setPassword)}
                disabled={loading}
                aria-invalid={!!errors.pwd}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b] transition-colors"
                onClick={() => !loading && setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.pwd && (
              <p className="text-sm text-red-600 mt-1">{errors.pwd}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
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
                Please wait…
              </>
            ) : (
              <>
                Login
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

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-[#64748b]">
              Don't have an account?{" "}
              <Link 
                to="/public/register" 
                className="text-[#d97706] hover:text-[#b45309] font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

