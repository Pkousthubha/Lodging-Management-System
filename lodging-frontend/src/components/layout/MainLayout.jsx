import React, { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import Breadcrumb from "./Breadcrumb.jsx";

export default function MainLayout() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="app-shell d-flex">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      {/* Mobile backdrop for slide-in sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="app-sidebar-backdrop d-md-none"
          onClick={handleCloseMobileSidebar}
        />
      )}

      <div className="app-main flex-grow-1 d-flex flex-column">
        <TopBar
          onToggleMobileSidebar={handleToggleMobileSidebar}
        />
        <main className="app-main-content flex-grow-1">
          <div className="page-inner">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
        <footer className="app-footer text-center small py-2">
          © {new Date().getFullYear()} Hotel Lodging &amp; Boarding
        </footer>
      </div>
    </div>
  );
}
