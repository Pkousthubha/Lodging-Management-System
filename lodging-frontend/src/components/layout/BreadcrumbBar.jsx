// src/components/layout/BreadcrumbBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { findMenuMatch } from "../../config/menuConfig.js";

export default function BreadcrumbBar() {
  const { pathname } = useLocation();
  const match = findMenuMatch(pathname);

  if (!match) {
    // On dashboard or unknown route
    return (
      <nav className="app-breadcrumb" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active">Dashboard</li>
        </ol>
      </nav>
    );
  }

  const { section, item } = match;

  return (
    <nav className="app-breadcrumb" aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item">{section.title}</li>
        <li className="breadcrumb-item active" aria-current="page">
          {item.label}
        </li>
      </ol>
    </nav>
  );
}
