import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerAPI } from "../../services/authService.js";
import { validateValues } from "../../utils/Validation.js";
import { buildRules } from "../../utils/ValidationHelper.js";
import { useFieldErrors } from "../../hooks/useFieldErrors";
import { AppName } from "../../utils/url.js";
import {
  showSuccessToast,
  showErrorToast,
  TOAST_POSITIONS,
} from "../../utils/toast";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { errors, setErrors, bindField } = useFieldErrors();

  // Validation Rules
  const rules = buildRules({
    name: { required: "Enter your full name." },
    email: { required: "Enter your Email ID.", type: "email" },
    pwd: { required: "Enter your Password.", minLength: { value: 6, message: "Password must be at least 6 characters." } },
    confirmPwd: { required: "Confirm your password." },
  });

  const runValidation = () => {
    const values = {
      name,
      email,
      pwd: password,
      confirmPwd: confirmPassword,
    };

    const newErrors = validateValues(values, rules);
    
    // Custom validation for password match
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPwd = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!runValidation()) return;

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        userId: 0, // 0 for new user
        email: email.trim().toLowerCase(),
        password: password,
        fullName: name.trim(),
        roleId: null // or set a default role ID if needed
      };

      // Call the API
      await registerAPI(registrationData);

      // Show success message
      showSuccessToast(
        "Registration successful! Please login to continue.",
        { position: TOAST_POSITIONS.TOP_CENTER }
      );

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      // Error is already handled by axios interceptors, but we can add field-level errors
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Registration failed. Please try again.";
      
      // Check if email already exists
      if (errorMessage.toLowerCase().includes("email") || 
          errorMessage.toLowerCase().includes("already exists")) {
        setErrors((prev) => ({ ...prev, email: "Email already registered" }));
      }
      
      showErrorToast(errorMessage, {
        position: TOAST_POSITIONS.TOP_CENTER,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f7fa] p-4 py-8 login-page">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 space-y-5 border border-gray-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
            {AppName}
          </h1>
          <h2 className="text-xl font-semibold text-[#1e293b]">
            Create your account
          </h2>
          <p className="text-sm text-[#64748b] mt-2">
            Sign up to book rooms and manage your reservations.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent ${
                errors.name 
                  ? "border-red-300 bg-red-50" 
                  : "border-[#e2e8f0] bg-white hover:border-gray-300"
              }`}
              placeholder="Enter your full name"
              value={name}
              onChange={bindField("name", setName)}
              disabled={loading}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent ${
                  errors.confirmPwd 
                    ? "border-red-300 bg-red-50" 
                    : "border-[#e2e8f0] bg-white hover:border-gray-300"
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={bindField("confirmPwd", setConfirmPassword)}
                disabled={loading}
                aria-invalid={!!errors.confirmPwd}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => !loading && setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPwd && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPwd}</p>
            )}
          </div>

          {/* Register Button */}
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
                Creating account…
              </>
            ) : (
              <>
                Create Account
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-[#64748b]">
              Already have an account?{" "}
              <Link 
                to="/public/login" 
                className="text-[#d97706] hover:text-[#b45309] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

