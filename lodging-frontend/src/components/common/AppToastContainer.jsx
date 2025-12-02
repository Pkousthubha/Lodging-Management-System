// src/components/AppToastContainer.jsx
import React from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Global toast container – mount once (e.g. in App.jsx)
 */
export default function AppToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition={Slide}
    />
  );
}
