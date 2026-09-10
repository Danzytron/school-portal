'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Document, Subject } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Building2,
  Plus
} from 'lucide-react';

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
    {
      id: 'DOC-2026-0814',
      type: 'Official Transcript of Records (OTR)',
      purpose: 'Board Examination Evaluation',
      dateFiled: 'Aug 14, 2026',
      status: 'ready',
      copies: 2
    },
    {
      id: 'DOC-2026-0902',
      type: 'Certificate of Good Moral Character',
      purpose: 'Company Internship Clearance',
      dateFiled: 'Sep 02, 2026',
      status: 'released',
      copies: 1
    },
    {
      id: 'DOC-2026-0925',
      type: 'Certificate of Enrollment & General Weighted Average',
      purpose: 'Scholarship Grant Renewal',
      dateFiled: 'Sep 25, 2026',
      status: 'assessing',
      copies: 1
    }
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

  const getStatusStepBadge = (status: DocumentRequest['status']) => {
    if (status === 'released') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
          <CheckCircle2 size={11} />
          <span>Released</span>
        </span>
      );
    }
    if (status === 'ready') {
      return (
        <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
          <CheckCircle2 size={11} />
          <span>Ready for Pickup</span>
        </span>
      );
    }
    if (status === 'assessing') {
      return (
        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
          <Clock size={11} />
          <span>Registrar Review</span>
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
        <Clock size={11} />
        <span>Submitted</span>
      </span>
    );
  };

  const filteredDocs = selectedSubject === 'all' 
    ? documents 
    : documents.filter(d => d.subject_id?.toString() === selectedSubject);

  if (loading) return <LoadingState message="Connecting to Registrar Document Archives..." />;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <PageHeader 
        title="Registrar Document Services & Course Archives" 
        subtitle="Official credential request tracker, authentic certification issuance, and course materials."
        badge="Office of the University Registrar"
        actions={[
          {
            label: "Request Official Document",
            onClick: () => setIsRequestModalOpen(true),
            variant: "primary",
            icon: Plus
          }
        ]}
      />

      {requestSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Your official document request has been logged successfully and forwarded to the Office of the University Registrar.</span>
        </div>
      )}

      {/* 1. Official Credential Request Tracker */}
      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Active Credential Request Tracker</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Official Registrar Queue</span>
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                  <th className="px-4 py-3">Request Reference</th>
                  <th className="px-4 py-3">Document Requested</th>
                  <th className="px-4 py-3">Intended Purpose</th>
                  <th className="px-4 py-3">Date Filed</th>
                  <th className="px-4 py-3 text-center">Current Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8] whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {req.type}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px]">
                      {req.purpose}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {req.dateFiled}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusStepBadge(req.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'ready' ? (
                        <span className="text-[11px] font-semibold text-[#1D4ED8] bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          Claim at Window 2
                        </span>
                      ) : req.status === 'released' ? (
                        <span className="text-[11px] text-slate-400">Completed</span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">In Queue</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Downloadable Course Syllabi & Academic Resources */}
      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Curriculum Syllabi & Learning Resources</span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-control text-xs py-1 px-2.5 min-w-[160px]"
            >
              <option value="all">All Enrolled Courses</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                  <th className="px-4 py-3">Resource Title</th>
                  <th className="px-4 py-3">Subject / Department</th>
                  <th className="px-4 py-3">File Format</th>
                  <th className="px-4 py-3 font-mono">Size</th>
                  <th className="px-4 py-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-[#1D4ED8]" />
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        {(doc as any).subject ? `${(doc as any).subject.code} - ${(doc as any).subject.name}` : 'IT Department Offering'}
                      </td>
                      <td className="px-4 py-3 font-mono uppercase text-[10px] text-slate-500">
                        {doc.file_type || 'PDF'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                        2.4 MB
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          className="btn-outline inline-flex items-center gap-1.5"
                          onClick={() => alert(`Downloading official course syllabus: ${doc.title}`)}
                        >
                          <Download size={12} />
                          <span>Download File</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-blue-50/30">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-[#1D4ED8]" />
                          <span>IT 311 - Advanced Database Systems Official Course Syllabus</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">College of Computer Studies</td>
                      <td className="px-4 py-3 font-mono uppercase text-[10px] text-slate-500">PDF Document</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">1.8 MB</td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-outline inline-flex items-center gap-1.5">
                          <Download size={12} />
                          <span>Download File</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-50/30">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-[#1D4ED8]" />
                          <span>IT 312 - Web Systems Laboratory Exercise Manual & Guidelines</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">College of Computer Studies</td>
                      <td className="px-4 py-3 font-mono uppercase text-[10px] text-slate-500">PDF Document</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">3.2 MB</td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-outline inline-flex items-center gap-1.5">
                          <Download size={12} />
                          <span>Download File</span>
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Official Request Modal Dialog */}
      {isRequestModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRequestModalOpen(false)}
          title="Filing of Official Document Request"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-sans">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600 leading-relaxed">
              Requests are processed according to the official Citizen's Charter of the Office of the University Registrar. Regular credential requests require 3–5 working days for verification.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Document Classification
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="form-control"
              >
                <option value="Official Transcript of Records (OTR)">Official Transcript of Records (OTR)</option>
                <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
                <option value="Certificate of Enrollment & General Weighted Average">Certificate of Enrollment & GWA</option>
                <option value="Certified True Copy of Grades">Certified True Copy of Grades</option>
                <option value="Honorable Dismissal / Transfer Credential">Honorable Dismissal / Transfer Credential</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Intended Purpose
              </label>
              <input
                type="text"
                value={requestPurpose}
                onChange={(e) => setRequestPurpose(e.target.value)}
                className="form-control"
                placeholder="e.g. Scholarship Application, Employment, Board Examination"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Submit Official Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
