'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';

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
        setError(err.message || 'Failed to load announcements');
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

  if (loading && announcements.length === 0) return <LoadingState message="Loading announcements..." />;

  return (
    <div className="space-y-4">
      
      <PageHeader 
        title="Announcements" 
        subtitle="Administrative announcements and advisories."
      />

      {error ? (
        <EmptyState title="Error" description={error} icon={<Bell size={40} />} />
      ) : announcements.length === 0 ? (
        <EmptyState 
          title="No Announcements" 
          description="No announcements at this time." 
          icon={<Bell size={40} className="text-gray-300" />} 
        />
      ) : (
        <div className="space-y-2">
          {announcements.map((ann) => {
            const isExpanded = expandedId === ann.id;
            const isUnread = ann.isRead === false || ann.isRead === undefined; 
            
            return (
              <div 
                key={ann.id} 
                className={`bg-white border border-gray-200 rounded overflow-hidden ${isUnread ? 'border-l-2 border-l-[#1D4ED8]' : ''}`}
              >
                <div 
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex justify-between items-start gap-3"
                  onClick={() => toggleExpand(ann.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-0.5">
                      <span className="tabular-nums">
                        {new Date(ann.published_at || ann.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                      {isUnread && (
                        <span className="bg-[#1D4ED8] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">New</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 m-0 leading-snug">
                      {ann.title}
                    </h3>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {ann.author?.name || 'Office of Academic Affairs'}
                    </div>
                    {!isExpanded && (
                      <p className="text-xs text-gray-600 m-0 mt-1.5 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                    )}
                  </div>
                  <div className="text-gray-400 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap mt-3">
                      {ann.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
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
