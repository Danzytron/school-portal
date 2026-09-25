'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  RefreshCw, 
  AlertCircle, 
  Tag, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

import { formatTimeAgo } from '@/lib/utils';

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  target_audience?: string;
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  isRead?: boolean;
  is_read?: boolean;
  author?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'teachers' | 'campus'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const fetchAnnouncements = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await api.get('/teacher/announcements');
      const data = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data) ? response.data : []);
      setAnnouncements(data);
    } catch (err: any) {
      console.error('Error fetching teacher announcements:', err);
      if (!silent) {
        setError('Unable to load announcements. Please try again.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAnnouncements(false);

    // Real-time synchronization
    const interval = setInterval(() => {
      fetchAnnouncements(true);
    }, 4000);

    const handleFocus = () => fetchAnnouncements(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAnnouncements(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    const handleCustomSync = () => fetchAnnouncements(true);
    window.addEventListener('cec:announcement-sync', handleCustomSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('cec-announcements-channel');
      bc.onmessage = () => {
        fetchAnnouncements(true);
      };
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('cec:announcement-sync', handleCustomSync);
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, []);

  const toggleExpand = async (id: number) => {
    const isNowExpanded = !expandedIds[id];
    setExpandedIds(prev => ({
      ...prev,
      [id]: isNowExpanded
    }));

    // If expanding and unread, mark as read in PostgreSQL and notify navbar
    const ann = announcements.find(a => a.id === id);
    if (isNowExpanded && ann && ann.isRead !== true && ann.is_read !== true) {
      try {
        await api.post(`/announcements/${id}/read`, {});
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isRead: true, is_read: true } : a));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cec:announcement-sync'));
          try {
            const bc = new BroadcastChannel('cec-announcements-channel');
            bc.postMessage({ type: 'ANNOUNCEMENT_READ', announcementId: id, time: Date.now() });
            bc.close();
          } catch {}
        }
      } catch {
        // silent catch
      }
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(item => {
      // Search query filter (title and content)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.title.toLowerCase().includes(q) || 
        item.content.toLowerCase().includes(q) ||
        (item.author?.name && item.author.name.toLowerCase().includes(q));

      // Audience filter
      if (!matchSearch) return false;
      if (audienceFilter === 'teachers') {
        return item.target_audience === 'teachers' || item.target_audience === 'teacher';
      }
      if (audienceFilter === 'campus') {
        return item.target_audience === 'all';
      }
      return true;
    });
  }, [announcements, searchQuery, audienceFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getAudienceBadge = (target?: string) => {
    const t = (target || 'all').toLowerCase();
    if (t === 'teachers' || t === 'teacher') {
      return {
        label: 'Faculty Notice',
        color: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    if (t === 'students' || t === 'student') {
      return {
        label: 'Student Bulletin',
        color: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }
    return {
      label: 'All Campus',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Faculty Announcements & Bulletins"
        subtitle="Official institutional memorandums, academic guidelines, and administrative updates."
        badge="Faculty Portal"
      />

      {/* Control bar: Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search announcements by title, keyword, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] text-slate-800 placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => fetchAnnouncements(false)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition disabled:opacity-50 cursor-pointer"
            title="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1D4ED8]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setAudienceFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              audienceFilter === 'all'
                ? 'bg-[#1D4ED8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Bulletins ({announcements.length})
          </button>
          <button
            onClick={() => setAudienceFilter('teachers')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              audienceFilter === 'teachers'
                ? 'bg-[#1D4ED8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Faculty Only
          </button>
          <button
            onClick={() => setAudienceFilter('campus')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              audienceFilter === 'campus'
                ? 'bg-[#1D4ED8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            General Campus
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Loading announcements..." />
      ) : error ? (
        /* Error State with required text and Retry button */
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-red-900">
              {error}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Could not communicate with the institutional bulletin service. Please verify your connection and retry.
            </p>
          </div>
          <button
            onClick={() => fetchAnnouncements(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg text-sm font-medium transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        /* Empty State with required exact text: "No announcements available." */
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-700">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              No announcements available.
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? 'No announcements match your search query. Try clearing the search filter.'
                : 'There are currently no active bulletins or memorandums posted for faculty members.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setAudienceFilter('all');
              }}
              className="text-xs text-[#1D4ED8] font-semibold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        /* Announcements list */
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const isExpanded = expandedIds[ann.id] ?? true;
            const badge = getAudienceBadge(ann.target_audience);
            const dateStr = formatDate(ann.published_at || ann.created_at);
            const timeStr = formatTime(ann.published_at || ann.created_at);
            const authorName = ann.author?.name || 'Institutional Administration';

            return (
              <article
                key={ann.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition overflow-hidden border-l-4 border-l-[#1D4ED8]"
              >
                {/* Header row */}
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {(!ann.isRead && !ann.is_read) && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          New
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{formatTimeAgo(ann.published_at || ann.created_at)}</span>
                        <span className="text-slate-300">•</span>
                        <Calendar className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                        <span>{dateStr}</span>
                        {timeStr && ` • ${timeStr}`}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleExpand(ann.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium transition"
                      aria-label={isExpanded ? 'Collapse announcement' : 'Expand announcement'}
                    >
                      {isExpanded ? (
                        <>
                          <span>Collapse</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Read full</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {ann.title}
                  </h3>

                  {/* Author / Department Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                      <User className="w-3 h-3" />
                    </div>
                    <span>
                      Posted by: <strong className="font-semibold text-slate-800">{authorName}</strong>
                    </span>
                    {ann.author?.role && (
                      <span className="capitalize text-slate-400">({ann.author.role})</span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                      {ann.content}
                    </div>

                    {/* Bottom Metadata verification notice */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Official Cebu Eastern College Notice
                      </span>
                      <span>Reference ID: CEC-ANN-{ann.id}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
