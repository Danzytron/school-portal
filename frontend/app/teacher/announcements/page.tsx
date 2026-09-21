'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import LoadingState from '@/components/ui/LoadingState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import { Megaphone, Plus, Edit2, Trash2, Users } from 'lucide-react';

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'students',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teacher/announcements');
      const data = Array.isArray(response) ? response : ((response as any)?.data ?? []);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements', error);
      setAnnouncements([
        {
          id: 1,
          title: 'Midterm Examination Schedule for IT 312',
          content: 'Please be reminded that our Midterm Exam will be held on Oct 14 at Computer Lab 3.',
          target_audience: 'students',
          published_at: '2026-08-20',
          is_published: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', target_audience: 'students' });
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      target_audience: item.target_audience || 'students',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setToast({ message: 'Title and content are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        target_audience: formData.target_audience,
      };

      if (editingAnnouncement) {
        await api.put(`/teacher/announcements/${editingAnnouncement.id}`, payload);
        setToast({ message: 'Announcement updated successfully.', type: 'success' });
      } else {
        await api.post('/teacher/announcements', payload);
        setToast({ message: 'Announcement published successfully.', type: 'success' });
      }
      setModalOpen(false);
      await fetchAnnouncements();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save announcement.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await api.delete(`/teacher/announcements/${selectedId}`);
      setToast({ message: 'Announcement deleted successfully.', type: 'success' });
      setConfirmOpen(false);
      setSelectedId(null);
      await fetchAnnouncements();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete announcement.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Announcement Title',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-brand-gold" />
            <span>{row.title}</span>
          </div>
          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.content}</div>
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Target Audience',
      render: (row: any) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Users className="w-3 h-3" />
          <span>{row.target_audience || 'students'}</span>
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date Published',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.published_at ? new Date(row.published_at).toLocaleDateString() : 'Today'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-primary hover:bg-slate-100 rounded transition-colors"
            title="Edit Bulletin"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedId(row.id);
              setConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Bulletin"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Class Announcements & Bulletins"
        subtitle="Post assignments, examination reminders, and updates directly to your students"
        action={{
          label: 'Post New Announcement',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAddModal,
        }}
      />

      {loading ? (
        <LoadingState message="Loading announcements..." />
      ) : (
        <DataTable columns={columns} data={announcements} emptyMessage="No class announcements posted yet." />
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingAnnouncement ? 'Edit Class Announcement' : 'Post New Class Announcement'}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormInput
              label="Announcement Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Midterm Examination Schedule for IT 312"
              required
            />

            <FormSelect
              label="Target Audience"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              options={[
                { value: 'students', label: 'Students in My Classes' },
                { value: 'all', label: 'All Campus Community' },
              ]}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Message Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your announcement details here..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-secondary rounded-md font-medium text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : editingAnnouncement ? 'Save Changes' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmOpen && (
        <ConfirmDialog
          title="Delete Announcement"
          message="Are you sure you want to delete this announcement?"
          confirmLabel={submitting ? 'Deleting...' : 'Delete Announcement'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
