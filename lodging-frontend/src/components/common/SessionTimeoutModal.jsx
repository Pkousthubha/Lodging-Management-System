// src/components/common/SessionTimeoutModal.jsx
import React from "react";
import { useSessionTimeout } from "../../context/SessionTimeoutContext";
import "../../styles/SessionTimeoutModal.css";

export default function SessionTimeoutModal() {
  const { showModal, handleExpireConfirm } = useSessionTimeout();

  if (!showModal) return null;

  return (
    <div className="session-modal-overlay">
      <div className="session-modal">
        <h3>Session Expired</h3>
        <p>Your session has expired due to inactivity.</p>
        <button className="session-stay-btn" onClick={handleExpireConfirm}>
          Login Again
        </button>
      </div>
    </div>
  );
}
