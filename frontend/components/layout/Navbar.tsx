"use client";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { 
  Bell, 
  Menu, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Search, 
  X, 
  ChevronDown,
  CheckCheck,
  Mail,
  GraduationCap
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "@/lib/utils";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  data?: {
    announcement_id?: number;
    target_audience?: string;
    published_at?: string;
    created_at?: string;
    announcement_timestamp?: string;
  };
}

export function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const announcementsHref = isAdmin 
    ? '/admin/announcements' 
    : isTeacher 
    ? '/teacher/announcements' 
    : '/student/announcements';

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      const items: NotificationItem[] = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) ? res.data : []);
      
      const unread = typeof res?.unread_count === 'number' 
        ? res.unread_count 
        : items.filter(n => !n.is_read).length;

      setNotifications(items);
      setUnreadCount(unread);
    } catch (err) {
      // Keep silent on background polling
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 4000);

    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('cec:announcement-sync', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('cec:announcement-sync', handleFocus);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number, announcementId?: number) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await api.post(`/notifications/${id}/read`);
      setNotificationOpen(false);
      if (announcementId) {
        router.push(`${announcementsHref}?highlight=${announcementId}`);
      } else {
        router.push(announcementsHref);
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await api.post('/notifications/read-all');
    } catch (e) {
      console.error('Failed to mark all notifications read', e);
    }
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrator';
    if (isTeacher) return 'Faculty Member';
    return 'Active Student';
  };

  const getSubTitle = () => {
    if (isAdmin) return 'University Administration';
    if (isTeacher) return 'College of Computer Studies';
    return 'BS Information Technology • Year 3';
  };

  return (
    <>
      <header className="bg-white text-slate-800 h-[64px] flex items-center justify-between px-4 sm:px-7 fixed top-0 left-0 lg:left-[220px] right-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-slate-200/80 max-w-full min-w-0 font-sans">
        
        {/* Left: Mobile Toggle + Modern Search Bar */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 mr-3">
          <button 
            onClick={onMenuToggle} 
            className="lg:hidden text-slate-600 hover:text-slate-900 p-2 -ml-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Pill Input (Matching Reference Proportions) */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, assignments, rooms..."
              className="w-full bg-[#F8FAFC] hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 focus:outline-none transition-all font-sans"
            />
          </div>

          {/* Mobile title on small screens */}
          <div className="sm:hidden font-heading font-extrabold text-xs text-slate-900 truncate min-w-0">
            Cebu Eastern College
          </div>
        </div>

        {/* Right Action Items & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Academic Term Chip (Matching Reference) */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setTermDropdownOpen(!termDropdownOpen)}
              className="bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200/90 text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <GraduationCap size={15} className="text-[#2563EB]" />
              <span>1st Semester A.Y. 2026–2027</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {termDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 text-xs">
                <div className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Academic Sessions
                </div>
                <div className="px-3 py-2 rounded-lg bg-blue-50 text-[#2563EB] font-semibold flex items-center justify-between">
                  <span>1st Sem A.Y. 2026–2027</span>
                  <span className="text-[10px] bg-[#2563EB] text-white px-1.5 py-0.2 rounded font-bold">Active</span>
                </div>
                <div className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  <span>Summer Term 2026</span>
                </div>
                <div className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  <span>2nd Sem A.Y. 2025–2026</span>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)} 
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shadow-2xs"
              title="Official Announcements & Notifications"
              aria-label="Official Announcements & Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs pointer-events-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="fixed sm:absolute top-[66px] sm:top-auto left-2 right-2 sm:left-auto sm:right-0 sm:mt-2 sm:w-96 max-w-[calc(100vw-16px)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs font-sans">
                {/* Notification Dropdown Header */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[#2563EB]" />
                    <span className="font-heading font-bold text-slate-900 text-xs">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#2563EB] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={12} />
                        <span>Mark All Read</span>
                      </button>
                    )}
                    <button 
                      onClick={() => setNotificationOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id, n.data?.announcement_id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          !n.is_read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <span className={`w-2 h-2 rounded-full inline-block ${
                            !n.is_read ? 'bg-[#2563EB]' : 'bg-slate-300'
                          }`} />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">
                            {n.title}
                          </div>
                          <div className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                            {n.message}
                          </div>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            {formatTimeAgo(n.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No notifications at this time.
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link 
                    href={announcementsHref}
                    onClick={() => setNotificationOpen(false)}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline"
                  >
                    View All Campus Announcements →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Messages / Mail Button */}
          <Link
            href={announcementsHref}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative shadow-2xs hidden sm:flex"
            title="Campus Communications"
          >
            <Mail size={17} />
          </Link>

          {/* User Account / Profile Area (Matching Reference) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer text-left"
              aria-label="User Account Menu"
            >
              {/* Profile Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-2xs ring-2 ring-blue-100 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* Name & Role Text */}
              <div className="hidden lg:block min-w-0 text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {user?.name || 'Roldan Jr. Delarmente'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate leading-tight mt-0.5">
                  {getSubTitle()}
                </div>
              </div>

              {/* Active Student Status Badge Pill */}
              <div className="hidden xl:flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-600 shadow-2xs ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse shrink-0" />
                <span>{getRoleLabel()}</span>
              </div>
            </button>

            {/* User Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs font-sans">
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-200">
                  <div className="font-heading font-bold text-slate-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                    {user?.email}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-[#2563EB] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    <span>●</span>
                    <span>{getRoleLabel()}</span>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <Link
                    href={user?.role === 'teacher' ? '/teacher/profile' : '/student/profile'}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon size={15} className="text-slate-400 shrink-0" />
                    <span>My Profile & Records</span>
                  </Link>

                  <Link
                    href={user?.role === 'teacher' ? '/teacher/settings' : user?.role === 'admin' ? '/admin/settings' : '/student/settings'}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={15} className="text-slate-400 shrink-0" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left font-semibold"
                  >
                    <LogOut size={15} className="text-rose-500 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* Backdrop for open dropdowns */}
      {(dropdownOpen || notificationOpen || termDropdownOpen) && (
        <div 
          className="fixed inset-0 z-15 bg-transparent"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationOpen(false);
            setTermDropdownOpen(false);
          }}
        />
      )}
    </>
  );
}

export default Navbar;
