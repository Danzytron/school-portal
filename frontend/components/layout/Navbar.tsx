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
  CheckCheck
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  };
}

export function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

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
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  // Initial load and lightweight real-time polling (every 15s + on window focus)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Failed to mark notification as read', e);
      }
    }
    setNotificationOpen(false);
    router.push(announcementsHref);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay}d ago`;
      return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const getRoleBadge = (role?: string) => {
    const r = (role || '').toLowerCase().trim();
    if (r === 'admin' || r === 'administrator') {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
          Administrator
        </span>
      );
    }
    if (r === 'teacher') {
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

          {/* Search Pill Input (Responsive) */}
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

          {/* Mobile title on small screens */}
          <div className="sm:hidden font-heading font-bold text-xs text-slate-900 truncate">
            Cebu Eastern College
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)} 
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shrink-0"
              title="Official Announcements & Bulletins"
              aria-label="Official Announcements & Bulletins"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white font-bold text-[9px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs pointer-events-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="fixed sm:absolute top-[64px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs font-sans">
                {/* Notification Dropdown Header */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[#1D4ED8]" />
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
                        className="text-[11px] font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck size={13} />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button 
                      onClick={() => setNotificationOpen(false)}
                      className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notifications List (Real database records) */}
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Bell size={24} className="mx-auto mb-2 text-slate-300 opacity-60" />
                      <p className="text-xs font-medium text-slate-500 m-0">No notifications available</p>
                      <p className="text-[11px] text-slate-400 m-0 mt-0.5">All official advisories will appear here</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 transition-colors cursor-pointer text-left ${
                          item.is_read ? 'hover:bg-slate-50 bg-white' : 'bg-blue-50/40 hover:bg-blue-50/70 border-l-2 border-l-[#1D4ED8]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!item.is_read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            )}
                            <span className={`font-heading text-xs truncate ${item.is_read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                              {item.title}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono text-[10px] shrink-0 whitespace-nowrap">
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-600 m-0 leading-relaxed text-[11px] line-clamp-2 pl-0.5">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Notification Dropdown Footer */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <Link 
                    href={announcementsHref} 
                    onClick={() => setNotificationOpen(false)}
                    className="text-[#1D4ED8] hover:underline font-semibold text-[11px]"
                  >
                    View All Announcements &rarr;
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
