'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Bell, ChevronDown, ChevronUp, User, Calendar, Megaphone, ShieldCheck } from 'lucide-react';

interface DisplayAnnouncement extends Announcement {
  isRead?: boolean;
}

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<DisplayAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await api.get<any>(`/student/announcements?page=${currentPage}&per_page=${perPage}`);
        const data = response.data || response;
        if (data.data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
          setTotalPages(data.meta?.last_page || Math.ceil(data.meta?.total / perPage) || 1);
        } else if (Array.isArray(data)) {
          const start = (currentPage - 1) * perPage;
          const paginatedItems = data.slice(start, start + perPage);
          setAnnouncements(paginatedItems);
          setTotalPages(Math.ceil(data.length / perPage));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load university bulletins');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [currentPage]);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(id);
    
    const ann = announcements.find(a => a.id === id);
    if (ann && ann.isRead !== true) {
      try {
        await api.post(`/announcements/${id}/read`, {});
        setAnnouncements(announcements.map(a => 
          a.id === id ? { ...a, isRead: true } : a
        ));
      } catch (e) {
        // silent catch
      }
    }
  };

  if (loading && announcements.length === 0) return <LoadingState message="Connecting to University Bulletin Archive..." />;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <PageHeader 
        title="University Memoranda & Official Bulletins" 
        subtitle="Important administrative announcements, academic advisories, and student affairs notices."
        badge="Official University Communications"
      />

      {error ? (
        <EmptyState title="Error" description={error} icon={<Bell size={48} />} />
      ) : announcements.length === 0 ? (
        <EmptyState 
          title="No Active University Bulletins" 
          description="There are currently no announcements posted for your academic program." 
          icon={<Bell size={48} className="text-slate-300" />} 
        />
      ) : (
        <div className="space-y-3.5">
          {announcements.map((ann) => {
            const isExpanded = expandedId === ann.id;
            const isUnread = ann.isRead === false || ann.isRead === undefined; 
            
            return (
              <div 
                key={ann.id} 
                className={`bg-white border rounded-lg shadow-2xs overflow-hidden transition-all ${
                  isUnread ? 'border-[#1D4ED8]/60 border-l-4 border-l-[#1D4ED8]' : 'border-slate-200/90'
                }`}
              >
                <div 
                  className={`p-4 sm:p-5 cursor-pointer hover:bg-slate-50/50 flex justify-between items-start gap-4 ${
                    isExpanded ? 'bg-slate-50/40' : ''
                  }`}
                  onClick={() => toggleExpand(ann.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2 py-0.5 rounded uppercase">
                        Official Memorandum
                      </span>
                      {isUnread && (
                        <span className="bg-[#1D4ED8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          New Notice
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar size={11} />
                        <span>
                          {new Date(ann.published_at || ann.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </span>
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-bold text-slate-900 m-0 leading-snug">
                      {ann.title}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">Issued by: {ann.author?.name || 'Office of Academic Affairs'}</span>
                    </div>
                    
                    {!isExpanded && (
                      <p className="text-xs text-slate-600 m-0 mt-2 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                    )}
                  </div>

                  <div className="text-slate-400 p-1 shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 bg-white">
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mt-4 font-sans border-l-2 border-[#1D4ED8] pl-4 py-1">
                      {ann.content}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Office of the University Registrar • Official Record</span>
                      <span>Verified Digital Release</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
