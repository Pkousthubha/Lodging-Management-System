import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/Login.css";

import { validateValues } from "../../utils/Validation.js";
import { buildRules } from "../../utils/ValidationHelper.js";
import { useFieldErrors } from "../../hooks/useFieldErrors";
import { LoginRequest } from "../../models/auth/Login";
import {AppName} from "../../utils/url.js";

const ADMIN_CREDENTIALS = {
  email: "admin@inspirehotels.com",
  password: "Welcome@123",
  name: "Hotel Admin",
}
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError,setAuthError]=useState("");

  // ❗ field-level validation hook
  const { errors, setErrors, bindField } = useFieldErrors();

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
  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;
    setAuthError("");
    if (!runValidation()) return;
const normalizedEmail=email.trim().toLowerCase();
const isAdmin=
normalizedEmail===ADMIN_CREDENTIALS.email && 
password===ADMIN_CREDENTIALS.password;
if(!isAdmin){
  setErrors((prev)=>({...prev,pwd:"Invalid email or password"}))
  setAuthError("Invalid email or password");
  return;
  setLoading(true);
}

    /** @type {import("../../models/Login").LoginRequest} */
    const request = LoginRequest(email, password, rememberMe);
    // TODO: use `request` with real API call
    console.log("LoginRequest payload:", request);

    // Save Remember Me
    if (rememberMe) {
      localStorage.setItem("savedEmail", email);
      localStorage.setItem("savedRemember", "true");
    } else {
      localStorage.removeItem("savedEmail");
      localStorage.removeItem("savedRemember");
    }

    // Fake API Login (simulate success)
    setTimeout(() => {
      login({ name: ADMIN_CREDENTIALS.name, email:ADMIN_CREDENTIALS.email });
      navigate("/");
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h6 className="login-title">{AppName}</h6>
        <h5 className="login-subtitle">Login to your account</h5>

        <p className="login-desc">
          Sign in to manage reservations, room service, housekeeping, and billing.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          
          <div className="floating-group">
            <input
              type="email"
              placeholder=" "
              className={`floating-input ${errors.email ? "is-invalid" : ""}`}
              value={email}
              onChange={bindField("email", setEmail)}
              disabled={loading}
              aria-invalid={!!errors.email}
            />
            <label>Email</label>
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="floating-group password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              className={`floating-input ${errors.pwd ? "is-invalid" : ""}`}
              value={password}
              onChange={bindField("pwd", setPassword)}
              disabled={loading}
              aria-invalid={!!errors.pwd}
            />
            <label>Password</label>

            <span
              className="password-eye"
              onClick={() => !loading && setShowPassword(!showPassword)}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>

            {errors.pwd && (
              <div className="invalid-feedback">{errors.pwd}</div>
            )}
          </div>

          
          <div className="remember-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="slider round" />
            </label>

            <span className="remember-text">Remember me</span>
            <Link to="/forgot-password" className="forgot-password">
              I forgot password
            </Link>
          </div>

          {/* ================= BUTTON ================= */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                Please wait…
                <span className="login-btn-icon">
                  <svg
                    className="spin-loader"
                    width="20"
                    height="20"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#fff"
                      strokeWidth="10"
                      strokeDasharray="60"
                    />
                  </svg>
                </span>
              </>
            ) : (
              <>
                Login
                <span className="login-btn-icon">
                  <svg
                    width="18"
                    height="18"
                    fill="#fff"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M160 80c0-17.7-14.3-32-32-32H48C21.5 48 0 69.5 0 96v320c0 
                      26.5 21.5 48 48 48h80c17.7 0 32-14.3 
                      32-32s-14.3-32-32-32H64V112h64c17.7 
                      0 32-14.3 32-32zm240.9 161.5L345 185.1c-12.5-10-31-8-41 
                      4.5s-8 31 4.5 41l22.3 17.9H192c-17.7 
                      0-32 14.3-32 32s14.3 32 32 32h138.8l-22.3 
                      17.9c-12.5 10-14.5 28.5-4.5 
                      41s28.5 14.5 41 4.5l55.9-44.4c19.5-15.5 
                      19.5-45.5 0-61z"
                    />
                  </svg>
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
