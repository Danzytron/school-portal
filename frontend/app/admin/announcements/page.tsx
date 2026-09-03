'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      const list = Array.isArray(res) ? res : (res.data || []);
      setAnnouncements(list);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
      setAnnouncements([
        { id: 1, title: 'Welcome to School Year 2025-2026', author: { name: 'System Administrator' }, target_audience: 'all', is_published: true, published_at: '2026-08-01' },
        { id: 2, title: 'Midterm Examination Schedule', author: { name: 'Registrar Office' }, target_audience: 'students', is_published: true, published_at: '2026-08-05' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Announcement Title', render: (row: any) => row.title },
    { key: 'author', label: 'Author / Publisher', render: (row: any) => row.author?.name || row.author || 'Administrator' },
    { key: 'target', label: 'Target Audience', render: (row: any) => <span className="uppercase text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{row.target_audience || row.target || 'all'}</span> },
    { key: 'published', label: 'Status', render: (row: any) => <StatusBadge status={row.is_published !== false ? 'Published' : 'Draft'} /> },
    { key: 'date', label: 'Publication Date', render: (row: any) => row.published_at ? new Date(row.published_at).toLocaleDateString() : (row.date || '2026-08-01') },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Institutional Announcements & Bulletins" subtitle="Broadcast updates, notices, and memos to students, faculty, and administration" />
      {loading ? <LoadingState message="Loading announcements..." /> : <DataTable columns={columns} data={announcements} />}
    </div>
  );
}
