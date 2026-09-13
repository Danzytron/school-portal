"use client";

import { useAuth } from "@/lib/auth";
import { 
  Bell, 
  Menu, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Search, 
  MessageSquare,
  HelpCircle,
  X,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getRoleBadge = (role?: string) => {
    if (role === 'admin') {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
          Administrator
        </span>
      );
    }
    if (role === 'teacher') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
          Faculty
        </span>
      );
    }
    return (
      <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
        Student
      </span>
    );
  };

  return (
    <>
      <header className="bg-white text-slate-800 h-[60px] flex items-center justify-between px-3 sm:px-6 fixed top-0 left-0 lg:left-[240px] right-0 z-20 shadow-2xs border-b border-slate-200">
        
        {/* Left: Mobile Toggle + Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md min-w-0">
          <button 
            onClick={onMenuToggle} 
            className="lg:hidden text-slate-600 hover:text-slate-900 p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Pill Input (Responsive: hidden on narrow screens, expanded on sm+) */}
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, exams, announcements..."
              className="w-full bg-[#F1F5F9] hover:bg-slate-100/90 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 pl-9 pr-3 py-2 rounded-full border border-transparent focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 focus:outline-none transition-all font-sans"
            />
          </div>

          {/* Mobile title on small screens where search input is hidden */}
          <div className="sm:hidden font-heading font-bold text-xs text-slate-900 truncate">
            Cebu Eastern College
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          
          {/* Direct Messages Icon Button */}
          <Link
            href="/student/announcements?filter=notices"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shrink-0"
            title="Institutional Messages & Advisories"
          >
            <MessageSquare size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full ring-2 ring-white"></span>
          </Link>

          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)} 
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shrink-0"
              title="Official Notices"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            {notificationOpen && (
              <div className="fixed sm:absolute top-[64px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs font-sans">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[#1D4ED8]" />
                    <span className="font-heading font-bold text-slate-900">Notifications Center</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-[#1D4ED8] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                    <button 
                      onClick={() => setNotificationOpen(false)}
                      className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-900 font-heading">Midterm Exam Schedule Posted</span>
                      <span className="text-slate-400 font-mono text-[10px]">10m ago</span>
                    </div>
                    <p className="text-slate-600 m-0 leading-relaxed text-[11px]">
                      The official timetable for Midterm Examinations is now viewable under your Schedule tab.
                    </p>
                  </div>

                  <div className="p-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-900 font-heading">Treasury Assessment Cleared</span>
                      <span className="text-slate-400 font-mono text-[10px]">2h ago</span>
                    </div>
                    <p className="text-slate-600 m-0 leading-relaxed text-[11px]">
                      Official Receipt OR-2026-09012 has been posted. Your account is clear of balances.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <Link 
                    href="/student/announcements" 
                    onClick={() => setNotificationOpen(false)}
                    className="text-[#1D4ED8] hover:underline font-semibold text-[11px]"
                  >
                    View All University Memoranda →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-0.5 sm:mx-1"></div>

          {/* User Profile Avatar Capsule */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center gap-2 p-1 sm:px-2 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-heading font-bold text-xs shadow-2xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>

              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name ? user.name.split(' ')[0] : 'Roldan'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-none">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Faculty' : 'Student'}
                </div>
              </div>

              <ChevronDown size={14} className="text-slate-400 hidden sm:block shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden text-xs font-sans">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200">
                  <div className="font-heading font-bold text-slate-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                    {user?.email}
                  </div>
                  <div className="mt-2">
                    {getRoleBadge(user?.role)}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href={user?.role === 'teacher' ? '/teacher/profile' : '/student/profile'}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon size={14} className="text-slate-400 shrink-0" />
                    <span>My Profile & Records</span>
                  </Link>

                  <Link
                    href={user?.role === 'teacher' ? '/teacher/settings' : user?.role === 'admin' ? '/admin/settings' : '/student/settings'}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={14} className="text-slate-400 shrink-0" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
                  >
                    <LogOut size={14} className="text-rose-500 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* Backdrop for open dropdowns on mobile */}
      {(dropdownOpen || notificationOpen) && (
        <div 
          className="fixed inset-0 z-15 bg-transparent"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}
    </>
  );
}

export default Navbar;
