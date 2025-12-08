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
        "flex flex-col h-screen fixed left-0 top-0 border-r border-[#E6E6E6] bg-[#FAFAFA] text-[#1E1E1E] transition-all duration-300 ease-in-out z-50 overflow-hidden shadow-sm " +
        (collapsed ? "w-16" : "w-64") +
        (mobileOpen ? " translate-x-0" : " -translate-x-full md:translate-x-0")
      }
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#E6E6E6] flex-shrink-0 bg-[#FAFAFA]">
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-tight text-[#1E1E1E]">
            {AppName}
          </h1>
        )}
        <button
          type="button"
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E6E6E6] bg-white text-[#6B6B6B] transition-all duration-200 text-sm font-medium hover:bg-[#F5F5F2] hover:border-gray-300"
          onClick={handleToggleCollapse}
          title={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6 space-y-6 scrollbar-thin min-h-0">
        {MENU_SECTIONS.map((section) => {
          const routeMatch =
            section.children &&
            section.children.some((item) => pathname.startsWith(item.to));

          // Section is open if user toggled it open OR current URL belongs to it
          const isOpen = !!openSections[section.key] || !!routeMatch;

          return (
            <div key={section.key} className="space-y-3">
              <button
                type="button"
                className="flex items-center justify-between w-full px-3 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] rounded-lg transition-all duration-200 group border-b border-[#E6E6E6] pb-3 text-[#6B6B6B] hover:text-[#1E1E1E] hover:bg-[#F0F0ED]"
                onClick={() => toggleSection(section.key)}
                title={section.title}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base opacity-75 group-hover:opacity-100 transition-opacity">
                    {section.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-[0.7rem] font-semibold">
                      {section.title}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span className="text-[0.6rem] text-[#9B9B9B] group-hover:text-[#6B6B6B] transition-colors">
                    {isOpen ? "▼" : "▶"}
                  </span>
                )}
              </button>

              {isOpen && (
                <nav className="flex flex-col space-y-1.5 mt-3 pl-1">
                  {section.children.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group " +
                        (isActive 
                          ? "font-semibold bg-[#F5F5F2] text-[#1E1E1E] shadow-sm" 
                          : "text-[#6B6B6B] hover:bg-[#F0F0ED] hover:text-[#1E1E1E]")
                      }
                      title={item.label}
                      onClick={handleNavClick}
                    >
                      {!collapsed && (
                        <span
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full transition-all duration-200 bg-[#C8A27A] ${
                            pathname.startsWith(item.to) ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      )}
                      <span
                        className={
                          "text-base transition-all duration-200 flex items-center justify-center w-5 " +
                          (pathname.startsWith(item.to)
                            ? "opacity-100"
                            : "opacity-75 group-hover:opacity-100")
                        }
                      >
                        {item.icon || "•"}
                      </span>
                      {!collapsed && (
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                      )}
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