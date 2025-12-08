import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { login as loginAPI } from "../../services/authService.js";
import { validateValues } from "../../utils/Validation.js";
import { buildRules } from "../../utils/ValidationHelper.js";
import { useFieldErrors } from "../../hooks/useFieldErrors";
import { LoginRequest } from "../../models/auth/Login";
import { AppName } from "../../utils/url.js";
import {
  showSuccessToast,
  showErrorToast,
  TOAST_POSITIONS,
} from "../../utils/toast";

export default function Login() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError,setAuthError]=useState("");

  // ❗ field-level validation hook
  const { errors, setErrors, bindField } = useFieldErrors();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // --------------------------
  // Load saved email
  // --------------------------
  useEffect(() => {
    const saved = localStorage.getItem("savedRemember") === "true";
    if (saved) {
      setRememberMe(true);
      setEmail(localStorage.getItem("savedEmail") || "");
    }
  }, []);

  // --------------------------
  // Validation Rules
  // --------------------------
  /** @type {FieldRule[]} */
  const rules = buildRules({
    email: { required: "Enter your Email ID.", type: "email" },
    pwd: { required: "Enter your Password." },
  });

  /** Validate login fields */
  const runValidation = () => {
    /** @type {LoginFormValues} */
    const values = {
      email,
      pwd: password,
    };

    const newErrors = validateValues(values, rules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------
  // Submit Handler
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setAuthError("");
    setErrors({});
    
    if (!runValidation()) return;

    setLoading(true);

    try {
      // Prepare login request
      const request = LoginRequest(email.trim(), password, rememberMe);
      
      // Call the API - authService will throw error if login fails
      const response = await loginAPI(request);
      
      // Validate response structure - MUST have message === "OK" and USER_LOGIN_DETAILS
      if (!response || response.message !== "OK") {
        throw new Error(response?.message || response?.Message || "Invalid email or password");
      }
      
      if (!response.data || !response.data.USER_LOGIN_DETAILS) {
        throw new Error("Invalid login response: missing user details");
      }
      
      // Extract user data from USER_LOGIN_DETAILS
      const userLoginDetails = response.data.USER_LOGIN_DETAILS;
      // USER_LOGIN_DETAILS is typically an array, get first element
      const userInfo = Array.isArray(userLoginDetails) ? userLoginDetails[0] : userLoginDetails;
      
      if (!userInfo) {
        throw new Error("Invalid login response: user details not found");
      }
      
      // Extract tokens from response
      const accessToken = userInfo.accessToken || userInfo.AccessToken || userInfo.token || userInfo.Token;
      const refreshToken = userInfo.refreshToken || userInfo.RefreshToken;
      
      if (!accessToken) {
        throw new Error("Invalid login response: access token not found");
      }
      
      // Extract user data
      const userData = {
        email: userInfo.email || userInfo.Email || email.trim(),
        name: userInfo.name || userInfo.Name || userInfo.fullName || userInfo.FullName || "User",
        role: userInfo.role || userInfo.Role || userInfo.roleName || userInfo.RoleName || "user"
      };
      
      // Store tokens in localStorage (axiosClient.js interceptors may have already done this, but ensure it)
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Save Remember Me
      if (rememberMe) {
        localStorage.setItem("savedEmail", email.trim());
        localStorage.setItem("savedRemember", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedRemember");
      }

      // Update AuthContext with user data - ONLY after successful validation
      login(userData);

      // Show success message
      showSuccessToast("Login successful!", {
        position: TOAST_POSITIONS.TOP_CENTER,
      });

      // Redirect to dashboard - ONLY after successful login
      navigate("/", { replace: true });
    } catch (error) {
      // Error is already handled by axios interceptors, but we can add field-level errors
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Invalid email or password";
      
      setAuthError(errorMessage);
      setErrors((prev) => ({ 
        ...prev, 
        pwd: errorMessage.includes("password") || errorMessage.includes("credentials") 
          ? "Invalid email or password" 
          : undefined 
      }));
      
      showErrorToast(errorMessage, {
        position: TOAST_POSITIONS.TOP_CENTER,
      });
    } finally {
      setLoading(false);
    }
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
            Sign in to manage reservations, room service, housekeeping, and billing.
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
        </form>

        {/* Register Link */}
        <div className="pt-2 text-center">
          <p className="text-sm text-[#64748b]">
            Don't have an account?{" "}
            <Link 
              to="/public/register" 
              className="text-[#d97706] hover:text-[#b45309] font-medium transition-colors"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Customer Portal Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/public/booking")}
            className="w-full py-3 px-4 bg-white border-2 border-[#e2e8f0] text-[#1e293b] font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Customer Portal
          </button>
        </div>
      </div>
    </div>
  );
}