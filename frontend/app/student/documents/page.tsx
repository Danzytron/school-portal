'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Document, Subject } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, Download, Send, Plus } from 'lucide-react';

interface DocumentRequest {
  id: string;
  type: string;
  purpose: string;
  dateFiled: string;
  status: 'pending' | 'assessing' | 'ready' | 'released';
  copies: number;
}

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('Official Transcript of Records (OTR)');
  const [requestPurpose, setRequestPurpose] = useState('Employment / Scholarship');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const [requests, setRequests] = useState<DocumentRequest[]>([
    { id: 'DOC-2026-0814', type: 'Official Transcript of Records (OTR)', purpose: 'Board Examination Evaluation', dateFiled: 'Aug 14, 2026', status: 'ready', copies: 2 },
    { id: 'DOC-2026-0902', type: 'Certificate of Good Moral Character', purpose: 'Company Internship Clearance', dateFiled: 'Sep 02, 2026', status: 'released', copies: 1 },
    { id: 'DOC-2026-0925', type: 'Certificate of Enrollment & GWA', purpose: 'Scholarship Grant Renewal', dateFiled: 'Sep 25, 2026', status: 'assessing', copies: 1 }
  ]);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await api.get<Document[]>('/student/documents');
        const data = (response as any).data || response;
        setDocuments(data);
        
        const uniqueSubjects = new Map();
        data.forEach((doc: Document) => {
          if ((doc as any).subject) {
            uniqueSubjects.set(doc.subject_id, (doc as any).subject);
          }
        });
        setSubjects(Array.from(uniqueSubjects.values()));
      } catch (err: any) {
        setError(err.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: DocumentRequest = {
      id: `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type: requestType,
      purpose: requestPurpose,
      dateFiled: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending',
      copies: 1
    };
    setRequests([newReq, ...requests]);
    setIsRequestModalOpen(false);
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 4000);
  };

  const getStatusText = (status: DocumentRequest['status']) => {
    const map: Record<string, string> = { released: 'Released', ready: 'Ready', assessing: 'Processing', pending: 'Pending' };
    return map[status] || status;
  };

  const filteredDocs = selectedSubject === 'all' 
    ? documents 
    : documents.filter(d => d.subject_id?.toString() === selectedSubject);

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div className="space-y-4">
      
      <PageHeader 
        title="Documents" 
        subtitle="Document requests and course materials."
        actions={[{
          label: "Request Document",
          onClick: () => setIsRequestModalOpen(true),
          variant: "primary" as const,
          icon: Plus
        }]}
      />

      {requestSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded text-xs">
          Document request submitted successfully.
        </div>
      )}

      {/* Document Requests Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
          Document Requests
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Document</th>
                <th className="px-3 py-2">Purpose</th>
                <th className="px-3 py-2">Date Filed</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">{req.id}</td>
                  <td className="px-3 py-2 text-gray-900">{req.type}</td>
                  <td className="px-3 py-2 text-gray-600 text-[11px]">{req.purpose}</td>
                  <td className="px-3 py-2 text-gray-500 tabular-nums text-[11px]">{req.dateFiled}</td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={getStatusText(req.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Documents Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Course Materials</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-control text-xs py-1 px-2 w-auto min-w-[160px]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id.toString()}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{doc.title}</td>
                    <td className="px-3 py-2 text-gray-600 text-[11px]">{(doc as any).subject ? `${(doc as any).subject.code}` : '—'}</td>
                    <td className="px-3 py-2 font-mono uppercase text-[10px] text-gray-500">{doc.file_type || 'PDF'}</td>
                    <td className="px-3 py-2 text-gray-500 text-[11px]">2.4 MB</td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-[#1D4ED8] hover:underline text-[11px] font-medium cursor-pointer inline-flex items-center gap-1" onClick={() => alert(`Downloading: ${doc.title}`)}>
                        <Download size={11} /> Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">Advanced Database Systems Syllabus</td>
                    <td className="px-3 py-2 text-gray-600 text-[11px]">IT 311</td>
                    <td className="px-3 py-2 font-mono uppercase text-[10px] text-gray-500">PDF</td>
                    <td className="px-3 py-2 text-gray-500 text-[11px]">1.8 MB</td>
                    <td className="px-3 py-2 text-right"><button className="text-[#1D4ED8] hover:underline text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"><Download size={11} /> Download</button></td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">Web Systems Lab Manual</td>
                    <td className="px-3 py-2 text-gray-600 text-[11px]">IT 312</td>
                    <td className="px-3 py-2 font-mono uppercase text-[10px] text-gray-500">PDF</td>
                    <td className="px-3 py-2 text-gray-500 text-[11px]">3.2 MB</td>
                    <td className="px-3 py-2 text-right"><button className="text-[#1D4ED8] hover:underline text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"><Download size={11} /> Download</button></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <Modal isOpen={true} onClose={() => setIsRequestModalOpen(false)} title="Request Document">
          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Document Type</label>
              <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="form-control">
                <option value="Official Transcript of Records (OTR)">Official Transcript of Records (OTR)</option>
                <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
                <option value="Certificate of Enrollment & GWA">Certificate of Enrollment & GWA</option>
                <option value="Certified True Copy of Grades">Certified True Copy of Grades</option>
                <option value="Honorable Dismissal / Transfer Credential">Honorable Dismissal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
              <input type="text" value={requestPurpose} onChange={(e) => setRequestPurpose(e.target.value)} className="form-control" placeholder="e.g. Employment, Scholarship" required />
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsRequestModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Submit Request</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
