"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import { ProtectedRoute } from "@/lib/auth";

export function DashboardLayout({ 
  children, 
  allowedRoles,
  role
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[],
  role?: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const effectiveRoles = allowedRoles || (role ? [role] : undefined);

  // Close sidebar on desktop resize to avoid locked overlay state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ProtectedRoute allowedRoles={effectiveRoles}>
      <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-25 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="pt-[60px] lg:ml-[240px] transition-all duration-200 min-h-screen flex flex-col font-sans w-full lg:w-[calc(100%-240px)] min-w-0">
          <div className="p-3.5 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto flex-1 min-w-0">
            <Breadcrumb />
            <div className="min-w-0">
              {children}
            </div>
          </div>
          
          <footer className="no-print px-4 sm:px-6 py-4 border-t border-slate-200 bg-white text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <span className="font-heading font-semibold text-slate-800">Cebu Eastern College</span>
                <span>•</span>
                <span>Office of the University Registrar</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Cebu City, Philippines</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                University Information System (UIS) • Term 1 A.Y. 2026–2027
              </div>
            </div>
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardLayout;
