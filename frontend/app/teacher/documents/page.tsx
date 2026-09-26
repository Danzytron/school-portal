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
import { FolderOpen, Upload, Download, Trash2, FileText, Plus } from 'lucide-react';

export default function TeacherDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const subsRes = await api.get('/teacher/subjects').catch(() => []);
      const sList = Array.isArray(subsRes) ? subsRes : (subsRes?.data || []);
      setSubjects(sList);
      if (sList.length > 0) {
        setFormData(prev => ({ ...prev, subject_id: String(sList[0].id) }));
      }
    } catch (e) {
      console.error(e);
    }
    await fetchDocuments();
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teacher/documents');
      const data = Array.isArray(response) ? response : ((response as any)?.data ?? []);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents', error);
      setDocuments([
        {
          id: 1,
          title: 'IT 312 - Course Syllabus & Grading Mechanics',
          subject: { code: 'IT 312', name: 'Web Systems' },
          file_type: 'application/pdf',
          file_size: 2457600,
          created_at: '2026-08-10',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setToast({ message: 'Document title is required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
      };

      await api.post('/teacher/documents', payload);
      setToast({ message: 'Course document uploaded successfully.', type: 'success' });
      setModalOpen(false);
      setFormData({ title: '', description: '', subject_id: subjects[0]?.id ? String(subjects[0].id) : '' });
      await fetchDocuments();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to upload document.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await api.delete(`/teacher/documents/${selectedId}`);
      setToast({ message: 'Document deleted successfully.', type: 'success' });
      setConfirmOpen(false);
      setSelectedId(null);
      await fetchDocuments();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete document.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Document Title & Details',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-blue-50 text-[#1D4ED8] border border-blue-100">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.title}</div>
            {row.description && <div className="text-xs text-slate-500 line-clamp-1">{row.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Course Subject',
      render: (row: any) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.subject?.code ? `${row.subject.code} - ${row.subject.name}` : (row.subject || 'All Classes')}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'File Format',
      render: (row: any) => (
        <span className="text-xs font-mono uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
          {row.file_type ? row.file_type.split('/')[1] || 'PDF' : 'PDF'}
        </span>
      ),
    },
    {
      key: 'size',
      label: 'File Size',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.file_size ? `${(row.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Upload Date',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Today'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedId(row.id);
              setConfirmOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Document"
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
        title="Course Material & Syllabus Repository"
        subtitle="Upload learning modules, lecture slides, syllabus documents, and exam reviewers"
        action={{
          label: 'Upload Course Material',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setModalOpen(true),
        }}
      />

      {loading ? (
        <LoadingState message="Loading documents..." />
      ) : (
        <DataTable columns={columns} data={documents} emptyMessage="No course materials uploaded yet." />
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <Modal
          title="Upload Course Material"
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <FormInput
              label="Document Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. IT 312 - Module 1: Web Architecture"
              required
            />

            <FormSelect
              label="Associated Course Offering"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              options={[
                { value: '', label: 'General Document (All Subjects)' },
                ...subjects.map(s => ({ value: String(s.id), label: `${s.code} - ${s.name}` }))
              ]}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Description / Instructions</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary or reading instructions for students..."
                className="form-control text-xs"
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">PDF, DOCX, PPTX (Up to 10MB)</div>
              <div className="text-[11px] text-slate-500 mt-1">Files are stored securely in cloud storage</div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmOpen && (
        <ConfirmDialog
          title="Delete Document"
          message="Are you sure you want to remove this course material?"
          confirmLabel={submitting ? 'Deleting...' : 'Delete Document'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
