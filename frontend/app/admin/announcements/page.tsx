'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Edit2, Trash2, Megaphone, Users, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchAnnouncements = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await api.get('/admin/announcements');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAnnouncements(list);
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err);
      let errorMsg = 'Unable to load announcements from the server.';
      
      if (err.response?.status === 401) {
        errorMsg = 'Your session has expired. Please sign in again.';
      } else if (err.response?.status === 403) {
        errorMsg = 'You are not authorized to manage announcements.';
      } else if (!err.response && err.message) {
        errorMsg = 'Unable to connect to the server. Please check your network connection.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      if (!silent) {
        setError(errorMsg);
      }
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements(false);
  }, [fetchAnnouncements]);

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
    if (submitting) return;

    const trimmedTitle = formData.title.trim();
    const trimmedContent = formData.content.trim();

    if (!trimmedTitle) {
      setToast({ message: 'Announcement title is required.', type: 'error' });
      return;
    }
    if (!trimmedContent) {
      setToast({ message: 'Announcement content is required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        content: trimmedContent,
        target_audience: formData.target_audience,
      };

      if (editingAnnouncement) {
        await api.put(`/admin/announcements/${editingAnnouncement.id}`, payload);
        setToast({ message: 'Announcement updated successfully.', type: 'success' });
      } else {
        await api.post('/admin/announcements', payload);
        setToast({ message: 'Bulletin published successfully.', type: 'success' });
      }

      // Close modal and reset form state
      setShowModal(false);
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        target_audience: 'all',
      });

      // Broadcast real-time sync event across all tabs & roles
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cec:announcement-sync'));
        try {
          const bc = new BroadcastChannel('cec-announcements-channel');
          bc.postMessage({ type: 'ANNOUNCEMENT_SYNC', action: editingAnnouncement ? 'UPDATE' : 'CREATE', timestamp: Date.now() });
          bc.close();
        } catch {}
      }

      // Automatically refresh Admin list in background without full-screen loading spinner
      await fetchAnnouncements(true);
    } catch (err: any) {
      console.error('Failed to save announcement:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save announcement. Please try again.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    const targetId = announcementToDelete.id;
    setSubmitting(true);
    try {
      await api.delete(`/admin/announcements/${targetId}`);
      // Optimistically remove from state immediately without triggering full-page loading state
      setAnnouncements(prev => prev.filter(item => item.id !== targetId));
      setToast({ message: 'Announcement deleted successfully.', type: 'success' });
      setShowDeleteConfirm(false);
      setAnnouncementToDelete(null);

      // Broadcast delete event across all tabs & roles
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cec:announcement-sync'));
        try {
          const bc = new BroadcastChannel('cec-announcements-channel');
          bc.postMessage({ type: 'ANNOUNCEMENT_SYNC', action: 'DELETE', timestamp: Date.now() });
          bc.close();
        } catch {}
      }

      // Silent background fetch to guarantee DB consistency without showing full-page loader
      await fetchAnnouncements(true);
    } catch (err: any) {
      console.error('Failed to delete announcement:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete announcement. Please try again.';
      setToast({ message: msg, type: 'error' });
      setShowDeleteConfirm(false);
      setAnnouncementToDelete(null);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter(item => {
    if (!item) return false;
    const q = search.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const author = (item.author?.name || '').toLowerCase();

    const matchesSearch = title.includes(q) || content.includes(q) || author.includes(q);
    const matchesAudience = !selectedAudience || item.target_audience === selectedAudience;
    return matchesSearch && matchesAudience;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Active';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Active';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Active';
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Bulletin Title',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>{row.title || 'Untitled'}</span>
          </div>
          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.content || ''}</div>
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
        <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(row.published_at || row.created_at)}</span>
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
            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
            title="Edit Bulletin"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setAnnouncementToDelete(row);
              setShowDeleteConfirm(true);
            }}
            disabled={submitting && announcementToDelete?.id === row.id}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
            title="Delete Announcement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Institutional Announcements & Bulletins"
        subtitle="Publish campus news, memos, deadlines, and official announcements across student and faculty portals"
        action={{
          label: 'Create Bulletin',
          icon: Plus,
          onClick: openAddModal,
        }}
      />

      {/* Error state with working Retry button */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-rose-900">Notice</div>
              <div className="text-xs text-rose-700 mt-0.5">{error}</div>
            </div>
          </div>
          <button
            onClick={() => fetchAnnouncements()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 rounded-md text-xs font-semibold shadow-2xs transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search bulletins by title, keyword, or author..." />
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

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Bulletin Content / Message Body <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full announcement details here..."
                className="form-control text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Publishing...' : editingAnnouncement ? 'Save Changes' : 'Publish Bulletin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && announcementToDelete && (
        <ConfirmDialog
          title="Delete Announcement"
          message="Are you sure you want to delete this announcement?"
          confirmLabel={submitting ? 'Deleting...' : 'Delete'}
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
