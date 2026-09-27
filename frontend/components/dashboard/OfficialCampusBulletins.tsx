'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Sparkles, 
  Calendar, 
  User, 
  ExternalLink, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Plus, 
  FileText, 
  X,
  Tag,
  ShieldCheck,
  RefreshCw,
  Bell
} from 'lucide-react';
import { api } from '@/lib/api';
import { Announcement } from '@/types';
import { useAuth } from '@/lib/auth';

interface OfficialCampusBulletinsProps {
  role?: 'student' | 'teacher' | 'admin';
  maxDisplay?: number;
  className?: string;
}

export function OfficialCampusBulletins({
  role = 'student',
  maxDisplay = 4,
  className = '',
}: OfficialCampusBulletinsProps) {
  const { user } = useAuth();
  const [bulletins, setBulletins] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBulletin, setSelectedBulletin] = useState<Announcement | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Determine target API endpoint and "View All" link
  const viewAllHref = useMemo(() => {
    if (role === 'admin') return '/admin/announcements';
    if (role === 'teacher') return '/teacher/announcements';
    return '/student/announcements';
  }, [role]);

  const fetchBulletins = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      // Use role-aware endpoint or shared /announcements
      let endpoint = '/announcements';
      if (role === 'admin') endpoint = '/admin/announcements';
      else if (role === 'teacher') endpoint = '/teacher/announcements';
      else if (role === 'student') endpoint = '/student/announcements';

      const response = await api.get(endpoint);
      const data = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data) ? response.data : []);

      // Filter only published bulletins for students and teachers
      const filtered = role === 'admin' 
        ? data 
        : data.filter((item: any) => item.is_published !== false);

      // Sort: Important/Urgent first, then newest published/created date
      const sorted = [...filtered].sort((a: any, b: any) => {
        const aIsImportant = Boolean(a.is_important || a.priority === 'urgent' || a.priority === 'high');
        const bIsImportant = Boolean(b.is_important || b.priority === 'urgent' || b.priority === 'high');
        if (aIsImportant && !bIsImportant) return -1;
        if (!aIsImportant && bIsImportant) return 1;

        const dateA = new Date(a.published_at || a.created_at || 0).getTime();
        const dateB = new Date(b.published_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setBulletins(sorted);
      setLastSync(new Date());
    } catch (err: any) {
      console.error('Failed to load official campus bulletins:', err);
      if (!silent) {
        setError('Unable to fetch latest bulletins. Will retry automatically.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [role]);

  useEffect(() => {
    fetchBulletins(false);

    // Lightweight automatic background sync every 20 seconds
    const interval = setInterval(() => {
      fetchBulletins(true);
    }, 20000);

    // Cross-tab broadcast & local sync listeners
    const handleSync = () => fetchBulletins(true);
    window.addEventListener('cec:announcement-sync', handleSync);
    window.addEventListener('focus', handleSync);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchBulletins(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('cec-announcements-channel');
      bc.onmessage = () => {
        fetchBulletins(true);
      };
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('cec:announcement-sync', handleSync);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, [fetchBulletins]);

  // Handle opening bulletin modal and mark as read
  const handleOpenBulletin = async (bulletin: Announcement) => {
    setSelectedBulletin(bulletin);

    // Optimistically update read status locally
    setBulletins(prev => prev.map(b => b.id === bulletin.id ? { ...b, is_read: true, isRead: true } : b));

    // Send backend mark as read request
    try {
      await api.post(`/announcements/${bulletin.id}/read`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cec:announcement-sync'));
      }
    } catch {}
  };

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  // Helper to check if a bulletin is "New" (within 48 hours or unread)
  const isNewBulletin = (bulletin: any) => {
    if (bulletin.is_read === false || bulletin.isRead === false) return true;
    if (!bulletin.published_at && !bulletin.created_at) return false;
    const itemDate = new Date(bulletin.published_at || bulletin.created_at).getTime();
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    return itemDate > fortyEightHoursAgo;
  };

  // Helper for Category badge & icon
  const getCategoryConfig = (item: any) => {
    const cat = (item.category || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const target = (item.target_audience || '').toLowerCase();

    if (cat.includes('enroll') || title.includes('enroll')) {
      return {
        label: 'Enrollment',
        icon: '📝',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      };
    }
    if (cat.includes('academic') || title.includes('exam') || title.includes('grade') || title.includes('term')) {
      return {
        label: 'Academic',
        icon: '📚',
        className: 'bg-blue-50 text-blue-800 border-blue-200/80',
      };
    }
    if (cat.includes('affair') || cat.includes('student') || target === 'students') {
      return {
        label: 'Student Affairs',
        icon: '🎓',
        className: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      };
    }
    if (cat.includes('faculty') || cat.includes('teacher') || target === 'teachers') {
      return {
        label: 'Faculty Advisory',
        icon: '👨‍🏫',
        className: 'bg-purple-50 text-purple-800 border-purple-200/80',
      };
    }
    if (cat.includes('event') || title.includes('celebration') || title.includes('ceremony')) {
      return {
        label: 'Campus Event',
        icon: '📅',
        className: 'bg-sky-50 text-sky-800 border-sky-200/80',
      };
    }
    if (cat.includes('important') || item.is_important || item.priority === 'urgent') {
      return {
        label: 'Important Notice',
        icon: '🚨',
        className: 'bg-rose-50 text-rose-800 border-rose-200/80',
      };
    }
    return {
      label: 'General Notice',
      icon: '📢',
      className: 'bg-slate-100 text-slate-800 border-slate-200/80',
    };
  };

  const displayedBulletins = bulletins.slice(0, maxDisplay);

  return (
    <section 
      aria-label="Official Campus Bulletins" 
      className={`space-y-3 font-sans ${className}`}
    >
      {/* ── Section Header ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/70">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Official Campus Bulletins</span>
            </h2>
            {bulletins.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#1D4ED8]">
                {bulletins.length} {bulletins.length === 1 ? 'Bulletin' : 'Bulletins'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Stay updated with the latest official announcements from Cebu Eastern College.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {role === 'admin' && (
            <Link
              href="/admin/announcements"
              className="btn-primary text-xs inline-flex items-center gap-1 px-3 py-1.5"
            >
              <Plus size={13} />
              <span>Post Bulletin</span>
            </Link>
          )}

          <Link
            href={viewAllHref}
            className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-blue-50/80 transition-colors"
          >
            <span>View All Bulletins</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Loading Skeleton ──────────────────────── */}
      {loading && bulletins.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded pt-2" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ───────────────────────────── */}
      {!loading && bulletins.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 text-center shadow-2xs space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-[#1D4ED8] flex items-center justify-center border border-blue-100">
            <Megaphone size={18} />
          </div>
          <h3 className="font-heading text-sm sm:text-base font-bold text-slate-800">
            No new campus bulletins
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You&apos;re all caught up. Official announcements will appear here when available.
          </p>
          {role === 'admin' && (
            <div className="pt-2">
              <Link
                href="/admin/announcements"
                className="btn-primary text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Create First Bulletin</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Bulletins Grid ────────────────────────── */}
      {bulletins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedBulletins.map((item) => {
            const cat = getCategoryConfig(item);
            const isImportant = Boolean(item.is_important || item.priority === 'urgent' || item.priority === 'high');
            const isNew = isNewBulletin(item);

            return (
              <div
                key={item.id}
                className={`group relative bg-white border rounded-xl p-4 sm:p-4.5 transition-all duration-200 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                  isImportant
                    ? 'border-rose-300/80 bg-linear-to-r from-rose-50/30 via-white to-white'
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                <div>
                  {/* Top Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Priority Tag */}
                      {isImportant && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                          <span>Important</span>
                        </span>
                      )}

                      {/* Category Tag */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${cat.className}`}>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>

                      {/* New Tag */}
                      {isNew && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                          New
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 font-sans">
                      {formatDate(item.published_at || item.created_at)}
                    </span>
                  </div>

                  {/* Bulletin Title */}
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors line-clamp-1 leading-snug">
                    {item.title}
                  </h3>

                  {/* Bulletin Content Preview */}
                  <p className="mt-1.5 text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed font-sans">
                    {item.content}
                  </p>
                </div>

                {/* Footer Meta & Action */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                    <User size={12} className="shrink-0 text-slate-400" />
                    <span className="truncate font-medium">
                      {item.author?.name || 'CEC Administration'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBulletin(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] px-2 py-1 rounded bg-blue-50/80 hover:bg-blue-100/80 transition-colors shrink-0 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bulletin Details Modal ────────────────── */}
      {selectedBulletin && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedBulletin(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedBulletin.is_important && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                      Important Notice
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getCategoryConfig(selectedBulletin).className}`}>
                    {getCategoryConfig(selectedBulletin).icon} {getCategoryConfig(selectedBulletin).label}
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    {formatDate(selectedBulletin.published_at || selectedBulletin.created_at)}
                  </span>
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {selectedBulletin.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBulletin(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Publisher:</span>{' '}
                  {selectedBulletin.author?.name || 'Cebu Eastern College Administration'}
                </div>
                <div className="text-[11px] text-blue-700 font-medium">
                  Official Institutional Release
                </div>
              </div>

              <div className="text-slate-800 leading-relaxed font-sans text-sm">
                {selectedBulletin.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Target: <strong className="uppercase">{selectedBulletin.target_audience || 'All'}</strong>
              </span>

              <button
                type="button"
                onClick={() => setSelectedBulletin(null)}
                className="btn-secondary text-xs px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OfficialCampusBulletins;
