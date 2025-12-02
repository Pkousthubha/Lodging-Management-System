import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MENU_SECTIONS } from "../../config/menuConfig.js";
import {AppName} from "../../utils/url.js";

function buildInitialOpenSections(pathname) {
  const map = {};
  MENU_SECTIONS.forEach((section) => {
    const hasMatch =
      section.children &&
      section.children.some((item) =>
        pathname ? pathname.startsWith(item.to) : false
      );
    map[section.key] = !!hasMatch;
  });
  return map;
}

export default function Sidebar({
  collapsed: collapsedProp,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) {
  const { pathname } = useLocation();

  // Local fallback for collapsed if parent doesn't control it
  const [collapsedInternal, setCollapsedInternal] = useState(false);
  const collapsed =
    typeof collapsedProp === "boolean" ? collapsedProp : collapsedInternal;

  const [openSections, setOpenSections] = useState(() =>
    buildInitialOpenSections(pathname)
  );

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setCollapsedInternal((c) => !c);
    }
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavClick = () => {
    // On mobile, close sidebar after navigation
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={
        "app-sidebar" +
        (collapsed ? " collapsed" : "") +
        (mobileOpen ? " mobile-open" : "")
      }
    >
      <div className="app-sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
        <span className="fw-semibold small sidebar-logo-text">
          {AppName}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-light sidebar-collapse-btn d-none d-md-inline-flex"
          onClick={handleToggleCollapse}
          title={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="app-sidebar-scroll">
        {MENU_SECTIONS.map((section) => {
          const routeMatch =
            section.children &&
            section.children.some((item) => pathname.startsWith(item.to));

          // Section is open if user toggled it open OR current URL belongs to it
          const isOpen = !!openSections[section.key] || !!routeMatch;

          return (
            <div key={section.key} className="app-sidebar-section">
              <button
                type="button"
                className="app-sidebar-section-title btn btn-link p-0 d-flex align-items-center justify-content-between w-100"
                onClick={() => toggleSection(section.key)}
                title={section.title}
              >
                <span className="d-flex align-items-center gap-2">
                  <span className="app-sidebar-main-icon">
                    {section.icon}
                  </span>
                  <span className="app-sidebar-main-text">
                    {section.title}
                  </span>
                </span>
                <span className="app-sidebar-chevron">
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>

              {isOpen && (
                <nav className="nav flex-column mt-1">
                  {section.children.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        "app-sidebar-link nav-link d-flex align-items-center" +
                        (isActive ? " active" : "")
                      }
                      title={item.label}
                      onClick={handleNavClick}
                    >
                      <span className="app-sidebar-bullet">
                        {item.icon || "•"}
                      </span>
                      <span className="app-sidebar-link-text">
                        {item.label}
                      </span>
                    </NavLink>
                  ))}
                </nav>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
