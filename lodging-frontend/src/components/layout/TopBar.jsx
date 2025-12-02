// src/components/layout/TopBar.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useUi } from "../../context/UiContext.jsx";
import { searchMenu } from "../../config/menuConfig.js";
import {AppName} from "../../utils/url.js";

export default function TopBar({
  onToggleMobileSidebar
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useUi();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]); // flat array
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openSearchDropdown, setOpenSearchDropdown] = useState(false);

  const searchWrapperRef = useRef(null);
  const userMenuRef = useRef(null); // <- ref for user dropdown

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  // Group results by module (section) for the dropdown
  const groupedResults = useMemo(() => {
    const map = new Map();
    const groups = [];
    results.forEach((match) => {
      let g = map.get(match.section.key);
      if (!g) {
        g = { key: match.section.key, section: match.section, items: [] };
        map.set(match.section.key, g);
        groups.push(g);
      }
      g.items.push(match);
    });
    return groups;
  }, [results]);

  // Run fuzzy search on text change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (!value.trim()) {
      setResults([]);
      setOpenSearchDropdown(false);
      setActiveIndex(-1);
      return;
    }

    const matches = searchMenu(value);
    setResults(matches);
    setOpenSearchDropdown(true);
    setActiveIndex(matches.length > 0 ? 0 : -1);
  };

  // Navigate to a particular match
  const navigateToResult = (match) => {
    if (!match) return;
    navigate(match.item.to);
    showToast(
      "info",
      `Navigated to ${match.item.label} (${match.section.title})`
    );
    setOpenSearchDropdown(false);
  };

  // Keyboard handling for search
  const handleSearchKeyDown = (e) => {
    if (!openSearchDropdown && e.key === "Enter") {
      // fallback: Enter without dropdown (just pick first fuzzy match)
      const matches = searchMenu(searchText);
      if (matches.length === 0) {
        showToast("warning", "No menu found for: " + searchText.trim());
        return;
      }
      navigateToResult(matches[0]);
      return;
    }

    if (!openSearchDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => {
        if (prev < 0) return 0;
        return (prev + 1) % results.length;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => {
        if (prev <= 0) return results.length - 1;
        return prev - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length === 0) return;
      const match = results[activeIndex >= 0 ? activeIndex : 0];
      navigateToResult(match);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpenSearchDropdown(false);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setOpenSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="app-topbar d-flex align-items-center px-3">
      {/* Left: hamburger (mobile) + brand */}
      <div className="d-flex align-items-center gap-2 me-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary topbar-icon-btn d-inline-flex d-md-none"
          onClick={() =>
            onToggleMobileSidebar && onToggleMobileSidebar()
          }
          title="Toggle menu"
        >
          ☰
        </button>
        <span className="fw-semibold">{AppName}</span>
      </div>

      {/* Center: search box + grouped dropdown */}
      <div className="topbar-search d-none d-md-flex flex-grow-1">
        <div
          className="topbar-search-wrapper flex-grow-1"
          ref={searchWrapperRef}
        >
          <div className="input-group input-group-sm topbar-search-group">
            <span className="input-group-text topbar-search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search menu or pages…"
              value={searchText}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {openSearchDropdown && (
            <div className="topbar-search-results">
              {results.length === 0 ? (
                <div className="topbar-search-empty">
                  No menu found for “{searchText.trim()}”
                </div>
              ) : (
                (() => {
                  let runningIndex = -1;
                  return groupedResults.map((group) => (
                    <div key={group.key}>
                      <div className="topbar-search-group-title">
                        {group.section.icon && (
                          <span className="topbar-search-group-icon">
                            {group.section.icon}
                          </span>
                        )}
                        <span>{group.section.title}</span>
                      </div>
                      {group.items.map((match) => {
                        runningIndex += 1;
                        const idx = runningIndex;
                        const itemIcon =
                          match.item.icon || group.section.icon || "•";
                        return (
                          <button
                            type="button"
                            key={group.key + match.item.to}
                            className={
                              "topbar-search-item" +
                              (idx === activeIndex ? " active" : "")
                            }
                            onClick={() => navigateToResult(match)}
                          >
                            <div className="topbar-search-item-main">
                              <span className="topbar-search-item-icon">
                                {itemIcon}
                              </span>
                              <div className="topbar-search-item-text">
                                <div className="topbar-search-item-label">
                                  {match.item.label}
                                </div>
                                <div className="topbar-search-item-section">
                                  {group.section.title}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: icons & user menu */}
      <div className="ms-auto d-flex align-items-center gap-2">
        {/* Dark / light toggle */}
        <button
          type="button"
          className="btn btn-sm topbar-icon-btn"
          onClick={toggleTheme}
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="btn btn-sm topbar-icon-btn position-relative"
          title="Notifications"
        >
          🔔
          <span className="topbar-notif-dot" />
        </button>

        {/* User dropdown */}
        <div className="topbar-user position-relative" ref={userMenuRef}>
          <button
            type="button"
            className="btn btn-sm d-flex align-items-center gap-2 topbar-user-btn"
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            <span className="topbar-user-avatar">
              {user?.name ? user.name[0] : "U"}
            </span>
            <span className="d-none d-sm-inline small">
              {user?.name || "User"}
            </span>
            <span className="topbar-user-caret">▾</span>
          </button>
          {userMenuOpen && (
            <div className="topbar-user-menu shadow-sm">
              <div className="topbar-user-menu-header small">
                Signed in as
                <br />
                <strong>{user?.email || "user@example.com"}</strong>
              </div>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() => setUserMenuOpen(false)}
              >
                My Profile
              </button>
              <button
                type="button"
                className="dropdown-item small"
                onClick={() => setUserMenuOpen(false)}
              >
                Settings
              </button>
              <hr className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item text-danger small"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
