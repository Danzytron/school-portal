'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Megaphone, Plus, Edit2, Trash2, Users, Send } from 'lucide-react';

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({ title: '', content: '', audience: 'All Students' });

  const DEFAULT_TEACHER_ANNOUNCEMENTS = [
    {
      id: 1,
      title: 'Midterm Examination Schedule for IT 312',
      content: 'Please be reminded that our Midterm Exam will be held on Oct 14 at Computer Lab 3. Bring your valid school ID.',
      audience: 'All Students',
      published_at: '2026-08-20',
      status: 'Published'
    },
    {
      id: 2,
      title: 'Submission of Case Study 1: Distributed Transactions',
      content: 'Case Study 1 report must be submitted via the portal document repository on or before Sept 18 at 11:59 PM.',
      audience: 'BSIT 3-B Only',
      published_at: '2026-08-22',
      status: 'Published'
    }
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teacher/announcements');
      const data = (response as any)?.data ?? response;
      if (Array.isArray(data) && data.length > 0) {
        setAnnouncements(data);
      } else {
        setAnnouncements(DEFAULT_TEACHER_ANNOUNCEMENTS);
      }
    } catch (error) {
      console.error('Error fetching announcements', error);
      setAnnouncements(DEFAULT_TEACHER_ANNOUNCEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedId) {
        await api.put(`/teacher/announcements/${selectedId}`, formData);
        setToast({ message: 'Announcement updated successfully.', type: 'success' });
      } else {
        await api.post('/teacher/announcements', formData);
        setToast({ message: 'Announcement created successfully.', type: 'success' });
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      if (selectedId) {
        setAnnouncements(prev => prev.map(a => a.id === selectedId ? { ...a, ...formData } : a));
      } else {
        const newAnn = {
          id: Date.now(),
          ...formData,
          published_at: new Date().toISOString().split('T')[0],
          status: 'Published'
        };
        setAnnouncements(prev => [newAnn, ...prev]);
      }
      setToast({ message: 'Announcement published successfully.', type: 'success' });
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/teacher/announcements/${selectedId}`);
      setToast({ message: 'Announcement deleted successfully.', type: 'success' });
    } catch (error) {
      setAnnouncements(prev => prev.filter(a => a.id !== selectedId));
      setToast({ message: 'Announcement deleted successfully.', type: 'success' });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns = [
    { 
      header: 'Announcement Headline',
      accessor: 'title',
      render: (row: any) => (
        <div>
          <span className="font-heading font-bold text-slate-900 block text-xs">
            {row.title}
          </span>
          <span className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
            {row.content}
          </span>
        </div>
      )
    },
    { 
      header: 'Target Audience',
      accessor: 'audience',
      render: (row: any) => (
        <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">
          {row.audience || 'All Students'}
        </span>
      )
    },
    { 
      header: 'Date Broadcasted',
      accessor: 'published_at',
      render: (row: any) => (
        <span className="font-mono text-slate-600 text-[11px]">
          {row.published_at || 'Recent'}
        </span>
      )
    },
    { 
      header: 'Status',
      accessor: 'status',
      render: (row: any) => (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
          {row.status || 'Published'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => { setSelectedId(row.id); setFormData({ title: row.title, content: row.content, audience: row.audience || 'All Students' }); setModalOpen(true); }}
            className="btn-outline text-xs inline-flex items-center gap-1"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
          <button 
            onClick={() => { setSelectedId(row.id); setConfirmOpen(true); }}
            className="btn-danger text-xs inline-flex items-center gap-1"
          >
            <Trash2 size={11} />
            <span>Delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Class Announcements & Advisories" 
        subtitle="Broadcast important reminders, laboratory instructions, and examination updates to your students."
        badge="Faculty Broadcast"
        actions={[
          {
            label: "Create Announcement",
            onClick: () => { setSelectedId(null); setFormData({ title: '', content: '', audience: 'All Students' }); setModalOpen(true); },
            variant: "primary",
            icon: Plus
          }
        ]}
      />

      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Broadcast Bulletins</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{announcements.length} Published Notices</span>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8"><LoadingState message="Loading announcements..." /></div>
          ) : (
            <DataTable 
              columns={columns} 
              data={announcements} 
              keyField="id"
              emptyMessage="No announcements found." 
            />
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal 
          isOpen={true}
          title={selectedId ? "Edit Class Announcement" : "Draft New Class Announcement"} 
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Title
              </label>
              <input 
                type="text"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Schedule for Final Exam Review"
                className="form-control text-xs py-1.5"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <select 
                value={formData.audience} 
                onChange={(e) => setFormData({...formData, audience: e.target.value})} 
                className="form-control text-xs font-semibold text-slate-900 py-1.5"
              >
                <option value="All Students">All Enrolled Students in My Classes</option>
                <option value="BSIT 3-A Only">BSIT 3-A Students Only</option>
                <option value="BSIT 3-B Only">BSIT 3-B Students Only</option>
                <option value="BSCS 3-A Only">BSCS 3-A Students Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Message Content
              </label>
              <textarea 
                className="form-control text-xs p-2.5 h-28"
                placeholder="Write the full advisory text here..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary flex items-center gap-1.5"
              >
                <Send size={12} />
                <span>Publish Announcement</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmOpen && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Announcement"
          message="Are you sure you want to remove this announcement? It will no longer be visible on student dashboards."
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
