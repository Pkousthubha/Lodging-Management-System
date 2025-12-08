
import React, { createContext, useContext, useMemo, useState } from "react";

const UiContext = createContext();

export function UiProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (variant, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const value = useMemo(
    () => ({
      globalLoading,
      setGlobalLoading,
      showToast
    }),
    [globalLoading]
  );

  return (
    <UiContext.Provider value={value}>
      {children}
      {globalLoading && (
        <div className="global-loader-backdrop">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <div className="toast-container-custom">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-custom alert alert-${t.variant} py-2 px-3 mb-2`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
