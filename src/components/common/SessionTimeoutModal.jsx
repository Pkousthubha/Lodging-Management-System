// src/components/common/SessionTimeoutModal.jsx
import React from "react";
import { useSessionTimeout } from "../../context/SessionTimeoutContext";

export default function SessionTimeoutModal() {
  const { showModal, handleExpireConfirm } = useSessionTimeout();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex justify-center items-center z-[999999]">
      <div className="bg-white dark:bg-slate-800 p-8 w-80 rounded-xl text-center shadow-2xl border border-gray-200 dark:border-slate-700">
        <h3 className="mb-3 font-semibold text-xl text-slate-900 dark:text-slate-100">Session Expired</h3>
        <p className="mb-5 text-slate-600 dark:text-slate-400">Your session has expired due to inactivity.</p>
        <button 
          className="bg-blue-600 dark:bg-blue-600 text-white border-none px-5 py-2.5 rounded-lg cursor-pointer mt-2 font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors" 
          onClick={handleExpireConfirm}
        >
          Login Again
        </button>
      </div>
    </div>
  );
}
