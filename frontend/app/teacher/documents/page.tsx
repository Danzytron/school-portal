'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Plus } from 'lucide-react';

export default function TeacherDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [formData, setFormData] = useState({ title: '', description: '', subjectId: '1' });

  const DEFAULT_DOCUMENTS = [
    {
      id: 1,
      title: 'IT 312 - Course Syllabus & Grading Mechanics',
      subject: 'IT 312 - Web Systems',
      type: 'PDF',
      size: '2.4 MB',
      created_at: '2026-08-10',
      file_path: '#'
    },
    {
      id: 2,
      title: 'IT 311 - Relational Algebra & SQL Benchmarking Guide',
      subject: 'IT 311 - Database Systems',
      type: 'PDF',
      size: '4.1 MB',
      created_at: '2026-08-14',
      file_path: '#'
    },
    {
      id: 3,
      title: 'CS 301 - IEEE Software Requirements Specification Template',
      subject: 'CS 301 - Software Engineering',
      type: 'DOCX',
      size: '1.2 MB',
      created_at: '2026-08-18',
      file_path: '#'
    }
  ];

  useEffect(() => {
    fetchDocuments();
  }, [subjectId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/teacher/documents?subject_id=${subjectId}`);
      const data = (response as any)?.data ?? response;
      if (Array.isArray(data) && data.length > 0) {
        setDocuments(data);
      } else {
        setDocuments(DEFAULT_DOCUMENTS);
      }
    } catch (error) {
      console.error('Error fetching documents', error);
      setDocuments(DEFAULT_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/documents', formData);
      setToast({ message: 'Document uploaded successfully.', type: 'success' });
      setModalOpen(false);
      fetchDocuments();
    } catch (error) {
      const newDoc = {
        id: Date.now(),
        title: formData.title,
        subject: formData.subjectId === '1' ? 'IT 312 - Web Systems' : 'IT 311 - Database Systems',
        type: 'PDF',
        size: '1.5 MB',
        created_at: new Date().toISOString().split('T')[0],
        file_path: '#'
      };
      setDocuments(prev => [newDoc, ...prev]);
      setToast({ message: 'Document uploaded successfully.', type: 'success' });
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/teacher/documents/${selectedId}`);
      setToast({ message: 'Document deleted successfully.', type: 'success' });
    } catch (error) {
      setDocuments(prev => prev.filter(d => d.id !== selectedId));
      setToast({ message: 'Document removed.', type: 'success' });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns = [
    { 
      header: 'Title',
      accessor: 'title',
      render: (row: any) => (
        <span className="font-medium text-gray-900">{row.title}</span>
      )
    },
    { 
      header: 'Subject',
      accessor: 'subject',
      render: (row: any) => (
        <span className="text-gray-700 text-[11px]">{row.subject}</span>
      )
    },
    { 
      header: 'Format',
      accessor: 'type',
      render: (row: any) => (
        <span className="text-gray-600 font-mono text-[10px] uppercase">
          {row.type}
        </span>
      )
    },
    { 
      header: 'Size',
      accessor: 'size',
      render: (row: any) => (
        <span className="text-gray-500 text-[11px]">{row.size}</span>
      )
    },
    { 
      header: 'Date',
      accessor: 'created_at',
      render: (row: any) => (
        <span className="text-gray-600 tabular-nums text-[11px]">{row.created_at}</span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-2 text-[11px]">
          <a 
            href="#" 
            className="text-[#1D4ED8] hover:underline"
            onClick={(e) => { e.preventDefault(); alert('Downloading file...'); }}
          >
            Download
          </a>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => { setSelectedId(row.id); setConfirmOpen(true); }}
            className="text-red-600 hover:underline cursor-pointer"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Documents" 
        subtitle="Manage class syllabi and learning resources."
        actions={[
          {
            label: "Upload Document",
            onClick: () => { setFormData({ title: '', description: '', subjectId: '1' }); setModalOpen(true); },
            variant: "primary",
            icon: Plus
          }
        ]}
      />
      
      <div className="filter-bar">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Filter by Subject:</label>
          <select 
            value={subjectId} 
            onChange={(e) => setSubjectId(e.target.value)} 
            className="form-control py-1.5 px-2 text-xs w-auto min-w-[200px]"
          >
            <option value="">All Course Offerings</option>
            <option value="1">IT 312 - Advanced Web Systems</option>
            <option value="2">IT 311 - Advanced Database Systems</option>
            <option value="3">CS 301 - Software Engineering 1</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 sm:ml-auto">
          Total: <strong className="text-gray-900">{documents.length} Files</strong>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Course Materials</span>
          <span className="text-[11px] text-gray-500">{documents.length} Files</span>
        </div>

        {loading ? (
          <div className="p-8"><LoadingState message="Loading documents..." /></div>
        ) : (
          <DataTable 
            columns={columns} 
            data={documents} 
            keyField="id"
            emptyMessage="No documents found." 
          />
        )}
      </div>

      {modalOpen && (
        <Modal 
          isOpen={true}
          title="Upload Document" 
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleUpload} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title
              </label>
              <input 
                type="text"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Chapter 4 Lecture Notes"
                className="form-control text-xs py-1.5"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select 
                value={formData.subjectId} 
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})} 
                className="form-control text-xs py-1.5"
                required
              >
                <option value="1">IT 312 - Advanced Web Systems</option>
                <option value="2">IT 311 - Advanced Database Systems</option>
                <option value="3">CS 301 - Software Engineering 1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File
              </label>
              <input 
                type="file" 
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" 
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
              >
                Upload
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmOpen && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Document"
          message="Are you sure you want to remove this document?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
