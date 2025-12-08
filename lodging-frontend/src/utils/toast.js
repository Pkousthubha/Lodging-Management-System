// src/utils/toast.js
import { toast } from "react-toastify";

/** Default Toastify positions + Custom CENTER-CENTER */
export const TOAST_POSITIONS = {
  TOP_LEFT: "top-left",
  TOP_RIGHT: "top-right",
  TOP_CENTER: "top-center",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_CENTER: "bottom-center",

  // ⭐ Custom Position
  CENTER_CENTER: "center-center",
};

/** Common default options */
const defaultOptions = {
  position: TOAST_POSITIONS.TOP_RIGHT,
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

/** Merge helper */
const buildOptions = (options) => {
  const merged = { ...defaultOptions, ...(options || {}) };

  // If custom center-center position is chosen → override with CSS class
  if (merged.position === TOAST_POSITIONS.CENTER_CENTER) {
    merged.position = toast.POSITION.TOP_CENTER; // use Toastify container
    merged.className = "toast-center-center"; // custom CSS position
  }

  return merged;
};

export const showSuccessToast = (message, options) =>
  toast.success(message, buildOptions(options));

export const showErrorToast = (message, options) =>
  toast.error(message, buildOptions(options));

export const showWarningToast = (message, options) =>
  toast.warn(message, buildOptions(options));

export const showInfoToast = (message, options) =>
  toast.info(message, buildOptions(options));
