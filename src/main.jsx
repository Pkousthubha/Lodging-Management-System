
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UiProvider } from "./context/UiContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import "./index.css";
// Custom CSS files for special styling (animations, layout, legacy styles)
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/common.css";
import "./styles/dashboard.css";
import "./styles/SmartTable.css";
import "./styles/AppToastContainer.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <UiProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </UiProvider>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
