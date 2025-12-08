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
    <div className="flex h-screen w-full overflow-hidden transition-colors duration-300 bg-[#F8F8F8]">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      {/* Mobile backdrop for slide-in sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={handleCloseMobileSidebar}
        />
      )}

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <TopBar
          onToggleMobileSidebar={handleToggleMobileSidebar}
        />
        <main className="flex-1 overflow-y-auto p-6 transition-colors duration-300 bg-[#F8F8F8]">
          <div className="w-full max-w-7xl mx-auto">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-[#E6E6E6] text-center text-sm py-3 px-6 transition-colors duration-300 bg-white text-[#6B6B6B]">
          © {new Date().getFullYear()} Hotel Lodging &amp; Boarding
        </footer>
      </div>
    </div>
  );
}