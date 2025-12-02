import React from "react";
import { Link, useLocation } from "react-router-dom";
import { findMenuMatch } from "../../config/menuConfig.js";

export default function Breadcrumb() {
  const { pathname } = useLocation();

  // Dashboard route – simple breadcrumb
  if (pathname === "/") {
    return (
      <nav className="app-breadcrumb small mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item active" aria-current="page">
            Dashboard
          </li>
        </ol>
      </nav>
    );
  }

  const match = findMenuMatch(pathname);

  return (
    <nav className="app-breadcrumb small mb-2" aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/">Dashboard</Link>
        </li>
        {match ? (
          <>
            <li className="breadcrumb-item">
              {match.section?.icon && (
                <span className="breadcrumb-section-icon me-1">
                  {match.section.icon}
                </span>
              )}
              {match.section.title}
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {match.item?.icon && (
                <span className="breadcrumb-section-icon me-1">
                  {match.item.icon}
                </span>
              )}
              {match.item.label}
            </li>
          </>
        ) : (
          <li className="breadcrumb-item active" aria-current="page">
            {pathname}
          </li>
        )}
      </ol>
    </nav>
  );
}
