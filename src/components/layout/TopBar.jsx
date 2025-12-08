// src/components/layout/TopBar.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useUi } from "../../context/UiContext.jsx";
import { searchMenu } from "../../config/menuConfig.js";
import {AppName} from "../../utils/url.js";

export default function TopBar({
  onToggleMobileSidebar
}) {
  const { user, logout } = useAuth();
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
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-16 w-full transition-colors duration-300 bg-white border-b border-[#E6E6E6] shadow-sm text-[#1E1E1E]">
      {/* Left: hamburger (mobile) + brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E6E6E6] bg-[#F5F5F2] text-[#6B6B6B] transition-all duration-200 hover:bg-[#F0F0ED] hover:shadow-md"
          onClick={() =>
            onToggleMobileSidebar && onToggleMobileSidebar()
          }
          title="Toggle menu"
        >
          ☰
        </button>
        <span className="text-lg font-bold hidden md:inline text-[#1E1E1E]">{AppName}</span>
      </div>

      {/* Center: search box + grouped dropdown */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div
          className="relative w-full"
          ref={searchWrapperRef}
        >
          <div className="relative flex items-center">
            <span className="absolute left-3 text-lg text-[#9B9B9B]">🔍</span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full outline-none transition-all duration-200 bg-[#F5F5F2] border border-[#E6E6E6] text-[#1E1E1E] placeholder:text-[#9B9B9B] focus:border-[#C8A27A] focus:ring-2 focus:ring-[#C8A27A]/20 focus:bg-white"
              placeholder="Search menu or pages…"
              value={searchText}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {openSearchDropdown && (
            <div className="absolute top-full mt-2 left-0 right-0 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 transition-all duration-200 bg-white border border-[#E6E6E6]">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#6B6B6B]">
                  No menu found for "{searchText.trim()}"
                </div>
              ) : (
                (() => {
                  let runningIndex = -1;
                  return groupedResults.map((group) => (
                    <div key={group.key}>
                      <div className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider flex items-center gap-2 border-b border-[#E6E6E6] text-[#6B6B6B] bg-[#FAFAFA]">
                        {group.section.icon && (
                          <span className="text-sm">
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
                            className={`w-full px-4 py-3 text-left transition-colors duration-150 ${
                              idx === activeIndex 
                                ? "bg-[#F5F5F2] text-[#1E1E1E]" 
                                : "bg-transparent text-[#6B6B6B] hover:bg-[#F0F0ED]"
                            }`}
                            onClick={() => navigateToResult(match)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base opacity-70">
                                {itemIcon}
                              </span>
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {match.item.label}
                                </div>
                                <div className="text-xs mt-0.5 text-[#9B9B9B]">
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
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          type="button"
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-[#F5F5F2] bg-white border border-[#E6E6E6] text-[#6B6B6B]"
          title="Notifications"
        >
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C8A27A] rounded-full border-2 border-white" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 bg-white border border-[#E6E6E6] text-[#1E1E1E] hover:bg-[#F5F5F2]"
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C8A27A] to-[#B98C60] text-white text-xs font-semibold flex items-center justify-center">
              {user?.name ? user.name[0] : "U"}
            </span>
            <span className="hidden sm:inline text-sm font-medium">
              {user?.name || "User"}
            </span>
            <span className="text-xs text-[#9B9B9B]">▾</span>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 transition-all duration-200 bg-white border border-[#E6E6E6]">
              <div className="px-4 py-3 text-xs border-b border-[#E6E6E6] text-[#6B6B6B]">
                Signed in as
                <br />
                <strong className="text-[#1E1E1E]">{user?.email || "user@example.com"}</strong>
              </div>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm transition-colors text-[#1E1E1E] hover:bg-[#F5F5F2]"
                onClick={() => setUserMenuOpen(false)}
              >
                My Profile
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm transition-colors text-[#1E1E1E] hover:bg-[#F5F5F2]"
                onClick={() => setUserMenuOpen(false)}
              >
                Settings
              </button>
              <hr className="my-1 border-[#E6E6E6]" />
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm transition-colors text-red-600 hover:bg-red-50"
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