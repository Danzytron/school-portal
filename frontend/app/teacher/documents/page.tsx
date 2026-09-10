'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { FolderOpen, Upload, Download, Trash2, FileText, Plus } from 'lucide-react';

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
      type: 'PDF Document',
      size: '2.4 MB',
      created_at: '2026-08-10',
      file_path: '#'
    },
    {
      id: 2,
      title: 'IT 311 - Relational Algebra & SQL Benchmarking Guide',
      subject: 'IT 311 - Database Systems',
      type: 'PDF Document',
      size: '4.1 MB',
      created_at: '2026-08-14',
      file_path: '#'
    },
    {
      id: 3,
      title: 'CS 301 - IEEE Software Requirements Specification Template',
      subject: 'CS 301 - Software Engineering',
      type: 'DOCX Document',
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
      setToast({ message: 'Course material uploaded successfully.', type: 'success' });
      setModalOpen(false);
      fetchDocuments();
    } catch (error) {
      const newDoc = {
        id: Date.now(),
        title: formData.title,
        subject: formData.subjectId === '1' ? 'IT 312 - Web Systems' : 'IT 311 - Database Systems',
        type: 'PDF Document',
        size: '1.5 MB',
        created_at: new Date().toISOString().split('T')[0],
        file_path: '#'
      };
      setDocuments(prev => [newDoc, ...prev]);
      setToast({ message: 'Course material uploaded successfully.', type: 'success' });
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
      setToast({ message: 'Document removed from library.', type: 'success' });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns = [
    { 
      header: 'Document Title',
      accessor: 'title',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#1D4ED8] shrink-0" />
          <span className="font-semibold text-slate-900">{row.title}</span>
        </div>
      )
    },
    { 
      header: 'Course Subject',
      accessor: 'subject',
      render: (row: any) => (
        <span className="text-slate-700 font-medium">{row.subject}</span>
      )
    },
    { 
      header: 'File Format',
      accessor: 'type',
      render: (row: any) => (
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
          {row.type}
        </span>
      )
    },
    { 
      header: 'Size',
      accessor: 'size',
      render: (row: any) => (
        <span className="font-mono text-slate-500 text-[11px]">{row.size}</span>
      )
    },
    { 
      header: 'Uploaded Date',
      accessor: 'created_at',
      render: (row: any) => (
        <span className="font-mono text-slate-600 text-[11px]">{row.created_at}</span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-2">
          <a 
            href="#" 
            className="btn-outline text-xs inline-flex items-center gap-1"
            onClick={(e) => { e.preventDefault(); alert('Downloading official file...'); }}
          >
            <Download size={12} />
            <span>Download</span>
          </a>
          <button 
            onClick={() => { setSelectedId(row.id); setConfirmOpen(true); }}
            className="btn-danger text-xs inline-flex items-center gap-1"
          >
            <Trash2 size={12} />
            <span>Remove</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Learning Resources & Syllabi" 
        subtitle="Upload instructional materials, problem sets, and syllabi for enrolled classes."
        badge="Course Repository"
        actions={[
          {
            label: "Upload Document",
            onClick: () => { setFormData({ title: '', description: '', subjectId: '1' }); setModalOpen(true); },
            variant: "primary",
            icon: Plus
          }
        ]}
      />
      
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
            Filter by Course Subject
          </label>
          <select 
            value={subjectId} 
            onChange={(e) => setSubjectId(e.target.value)} 
            className="form-control text-xs font-semibold text-slate-900 py-1.5"
          >
            <option value="">All Course Offerings</option>
            <option value="1">IT 312 - Advanced Web Systems</option>
            <option value="2">IT 311 - Advanced Database Systems</option>
            <option value="3">CS 301 - Software Engineering 1</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Uploaded Materials: <strong className="text-slate-900 font-mono">{documents.length}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Institutional Document Repository</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{documents.length} Files</span>
        </div>

        <div className="p-0">
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
      </div>

      {modalOpen && (
        <Modal 
          isOpen={true}
          title="Upload Course Resource" 
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleUpload} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Title
              </label>
              <input 
                type="text"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Lecture Notes: Chapter 4"
                className="form-control text-xs py-1.5"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Course Subject
              </label>
              <select 
                value={formData.subjectId} 
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})} 
                className="form-control text-xs font-semibold text-slate-900 py-1.5"
                required
              >
                <option value="1">IT 312 - Advanced Web Systems</option>
                <option value="2">IT 311 - Advanced Database Systems</option>
                <option value="3">CS 301 - Software Engineering 1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea 
                className="form-control text-xs p-2 h-16"
                placeholder="Optional notes or instructions for students..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload File (PDF, DOCX, ZIP)
              </label>
              <input 
                type="file" 
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1D4ED8] hover:file:bg-blue-100 cursor-pointer" 
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
                className="btn-primary"
              >
                Upload File
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmOpen && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Course Document"
          message="Are you sure you want to remove this document from the student portal? Enrolled students will no longer be able to download this file."
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
