'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Megaphone, Users, Calendar } from 'lucide-react';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
  });

  const audienceOptions = [
    { value: 'all', label: 'All School Community (Students & Faculty)' },
    { value: 'students', label: 'Students Only' },
    { value: 'teachers', label: 'Teachers / Faculty Only' },
    { value: 'admin', label: 'Administration Only' },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAnnouncements(list);
    } catch (err: any) {
      console.error('Failed to fetch announcements', err);
      setToast({ message: 'Failed to load bulletins from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      target_audience: 'all',
    });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      target_audience: item.target_audience || 'all',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setToast({ message: 'Title and bulletin content are required.', type: 'error' });
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
        await api.put(`/admin/announcements/${editingAnnouncement.id}`, payload);
        setToast({ message: 'Institutional bulletin updated successfully.', type: 'success' });
      } else {
        await api.post('/admin/announcements', payload);
        setToast({ message: 'Institutional bulletin published successfully.', type: 'success' });
      }
      setShowModal(false);
      await fetchAnnouncements();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save announcement.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/announcements/${announcementToDelete.id}`);
      setToast({ message: 'Bulletin deleted successfully.', type: 'success' });
      setShowDeleteConfirm(false);
      setAnnouncementToDelete(null);
      await fetchAnnouncements();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete bulletin.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter(item => {
    const q = search.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const author = (item.author?.name || '').toLowerCase();

    const matchesSearch = title.includes(q) || content.includes(q) || author.includes(q);
    const matchesAudience = !selectedAudience || item.target_audience === selectedAudience;
    return matchesSearch && matchesAudience;
  });

  const columns = [
    {
      key: 'title',
      label: 'Bulletin Title',
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
      key: 'author',
      label: 'Publisher',
      render: (row: any) => (
        <span className="text-xs font-medium text-slate-700">
          {row.author?.name || 'Administrator'}
        </span>
      ),
    },
    {
      key: 'target',
      label: 'Target Audience',
      render: (row: any) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase ${
          row.target_audience === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          row.target_audience === 'students' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          row.target_audience === 'teachers' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
          'bg-slate-100 text-slate-700'
        }`}>
          <Users className="w-3 h-3" />
          <span>{row.target_audience || 'all'}</span>
        </span>
      ),
    },
    {
      key: 'published',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.is_published !== false ? 'Published' : 'Draft'} />,
    },
    {
      key: 'date',
      label: 'Publication Date',
      render: (row: any) => (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.published_at ? new Date(row.published_at).toLocaleDateString() : 'Active'}</span>
        </div>
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
              setAnnouncementToDelete(row);
              setShowDeleteConfirm(true);
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
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Institutional Announcements & Bulletins"
        subtitle="Publish campus news, memos, deadlines, and official announcements across student and faculty portals"
        action={{
          label: 'Create Bulletin',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search bulletins by title or keyword..." />
          <FormSelect
            label=""
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            options={[{ value: '', label: 'All Target Audiences' }, ...audienceOptions]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading announcements from database..." />
      ) : (
        <DataTable columns={columns} data={filteredAnnouncements} emptyMessage="No bulletins found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingAnnouncement ? 'Edit Institutional Bulletin' : 'Create New Institutional Bulletin'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Bulletin Title / Headline"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Enrollment Period for 2nd Semester SY 2025-2026"
              required
            />

            <FormSelect
              label="Target Audience"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              options={audienceOptions}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Bulletin Content / Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full announcement details here..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-secondary rounded-md font-medium text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : editingAnnouncement ? 'Save Changes' : 'Publish Bulletin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && announcementToDelete && (
        <ConfirmDialog
          title="Delete Bulletin"
          message={`Are you sure you want to delete "${announcementToDelete.title}"?`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Bulletin'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setAnnouncementToDelete(null);
          }}
        />
      )}
    </div>
  );
}
