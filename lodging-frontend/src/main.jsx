
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UiProvider } from "./context/UiContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";
import "./styles/layout.css";
import './styles/common.css';
import './styles/AppToastContainer.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <UiProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UiProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
