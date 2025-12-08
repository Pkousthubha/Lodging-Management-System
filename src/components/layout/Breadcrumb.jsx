import React from "react";
import { Link, useLocation } from "react-router-dom";
import { findMenuMatch } from "../../config/menuConfig.js";

export default function Breadcrumb() {
  const { pathname } = useLocation();

  // Dashboard route – simple breadcrumb
  if (pathname === "/") {
    return (
      <nav className="mb-4 text-sm" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2 mb-0">
          <li className="text-[#1E1E1E] font-medium" aria-current="page">
            Dashboard
          </li>
        </ol>
      </nav>
    );
  }

  const match = findMenuMatch(pathname);

  return (
    <nav className="mb-4 text-sm" aria-label="breadcrumb">
      <ol className="flex items-center space-x-2 mb-0">
        <li>
          <Link to="/" className="text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors">
            Dashboard
          </Link>
        </li>
        <li className="text-[#9B9B9B]">/</li>
        {match ? (
          <>
            <li className="flex items-center gap-1 text-[#6B6B6B]">
              {match.section?.icon && (
                <span className="text-xs">
                  {match.section.icon}
                </span>
              )}
              {match.section.title}
            </li>
            <li className="text-[#9B9B9B]">/</li>
            <li className="flex items-center gap-1 text-[#1E1E1E] font-medium" aria-current="page">
              {match.item?.icon && (
                <span className="text-xs">
                  {match.item.icon}
                </span>
              )}
              {match.item.label}
            </li>
          </>
        ) : (
          <>
            <li className="text-[#9B9B9B]">/</li>
            <li className="text-[#1E1E1E] font-medium" aria-current="page">
              {pathname}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
