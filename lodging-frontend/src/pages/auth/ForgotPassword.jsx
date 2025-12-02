import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Login.css";
import { AppName } from "../../utils/url.js";
import {
  showSuccessToast,
  showErrorToast,
  TOAST_POSITIONS,
} from "../../utils/toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const  handleSubmit = async (e) => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
issueOtp(generatedOtp) // comes from AuthContext or a small local store

await fetch("https://send.api.mailtrap.io/api/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_MAILTRAP_TOKEN}`,
  },
  body: JSON.stringify({
    from: { email: "no-reply@lodgingcloud.com", name: "Lodging Cloud" },
    to: [{ email: ADMIN_CREDENTIALS.email }],
    subject: "Reset password code",
    text: `Use OTP ${generatedOtp} to reset your password.`,
  }),
})

// show “check your email” message and render the OTP + new-password form
    e.preventDefault();

    if (loading) return;

    if (!email.trim()) {
      showErrorToast("Enter your registered Email ID.", {
        position: TOAST_POSITIONS.TOP_CENTER,
      });
      return;
    }

    setLoading(true);

    // Simulated API call (replace with real API later)
    setTimeout(() => {
      // success toast (you can change position as needed)
      showSuccessToast(
        "Password reset link has been sent to your email.",
        { position: TOAST_POSITIONS.TOP_CENTER }
      );
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Title */}
        <h6 className="login-title">{AppName}</h6>

        {/* Subtitle */}
        <h5 className="login-subtitle">Forgot password</h5>

        {/* Description */}
        <p className="login-desc">
          Enter your registered email. We'll send you a password reset link.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Floating Input */}
          <div className="floating-group">
            <input
              type="email"
              className="floating-input"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <label>Email ID</label>
          </div>

          {/* BUTTON */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              "Please wait..."
            ) : (
              <>
                Send reset link
                <span className="login-btn-icon">
                  {/* Send icon (white SVG) */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 512 512"
                    fill="#ffffff"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M476 3.2L12.1 270.6c-16.1 9-12.2 33.4 5.7 
                      36.5l111 19.2 30.3 112.1c4.5 16.5 25.4 
                      21.4 36.7 8.4l49.7-56.3 110.5 90c14.2 
                      11.5 35.5 2.8 38.3-15.3L508.9 22.8c3.1-20.5-17.4-35.9-32.9-19.6z"/>
                  </svg>
                </span>
              </>
            )}
          </button>
        </form>

        {/* BACK TO LOGIN */}
        <div style={{ marginTop: "1rem" }}>
          <Link
            to="/"
            className="forgot-password"
            style={{ fontSize: "0.9rem" }}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
