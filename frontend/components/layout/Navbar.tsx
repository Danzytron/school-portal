"use client";

import { useAuth } from "@/lib/auth";
import { 
  Bell, 
  Menu, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  ChevronDown,
  X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

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
          Faculty Member
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
      <header className="bg-white text-slate-800 h-[56px] flex items-center justify-between px-3 sm:px-6 fixed top-0 left-0 lg:left-[240px] right-0 z-20 border-b border-slate-200 font-sans">
        
        {/* Left: Mobile Toggle & Institutional Term Context */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <button 
            onClick={onMenuToggle} 
            className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 -ml-1 rounded hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Academic Context Breadcrumb / Label */}
          <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
            <span className="font-semibold text-slate-900 truncate">
              Cebu Eastern College
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 font-medium hidden sm:inline truncate">
              Academic Year 2026–2027 (1st Semester)
            </span>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)} 
              className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shrink-0"
              title="Official Notices & Memoranda"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#1D4ED8] rounded-full"></span>
            </button>

            {notificationOpen && (
              <div className="fixed sm:absolute top-[60px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 sm:mt-1.5 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[#1D4ED8]" />
                    <span className="font-semibold text-slate-900">Institutional Notices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                      2 Unread
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
                  <div className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-900">Midterm Examination Schedule Released</span>
                      <span className="text-slate-400 font-mono text-[10px]">Today</span>
                    </div>
                    <p className="text-slate-600 m-0 leading-relaxed text-[11px]">
                      The official timetable for Midterm Examinations is now viewable in your Class Schedule module.
                    </p>
                  </div>

                  <div className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-900">Treasury Assessment Receipt Cleared</span>
                      <span className="text-slate-400 font-mono text-[10px]">Yesterday</span>
                    </div>
                    <p className="text-slate-600 m-0 leading-relaxed text-[11px]">
                      Official payment verification has been validated. Statement of Account is clear of arrears.
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                  <Link 
                    href="/student/announcements" 
                    onClick={() => setNotificationOpen(false)}
                    className="text-[#1D4ED8] hover:underline font-medium text-[11px]"
                  >
                    View All Memoranda & Notices
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-0.5"></div>

          {/* User Profile Avatar Capsule */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center gap-2 p-1 sm:px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded bg-[#1E3A8A] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>

              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name ? user.name.split(' ')[0] : 'Student'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-none">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Faculty' : 'SN: 2026-00001'}
                </div>
              </div>

              <ChevronDown size={14} className="text-slate-400 hidden sm:block shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <div className="font-semibold text-slate-900 truncate">
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
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon size={14} className="text-slate-400 shrink-0" />
                    <span>Student Profile & Dossier</span>
                  </Link>

                  <Link
                    href={user?.role === 'teacher' ? '/teacher/settings' : user?.role === 'admin' ? '/admin/settings' : '/student/settings'}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
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
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
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
