'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { CheckCircle2, XCircle, Clock, UserCheck, Search } from 'lucide-react';

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [rejectDialog, setRejectDialog] = useState<any>(null);
  const [rejectRemarks, setRejectRemarks] = useState('Incomplete prerequisites or documentary requirements.');

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/enrollments', params);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setEnrollments(list);
    } catch (err: any) {
      console.error('Failed to fetch enrollments', err);
      setToast({ message: 'Failed to load enrollment applications from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollment: any) => {
    setSubmitting(true);
    try {
      await api.put(`/admin/enrollments/${enrollment.id}/approve`);
      setToast({
        message: `Enrollment application for ${enrollment.student?.user?.name || 'student'} has been APPROVED.`,
        type: 'success',
      });
      await fetchEnrollments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to approve enrollment.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setSubmitting(true);
    try {
      await api.put(`/admin/enrollments/${rejectDialog.id}/reject`, {
        remarks: rejectRemarks,
      });
      setToast({
        message: `Enrollment application for ${rejectDialog.student?.user?.name || 'student'} has been REJECTED.`,
        type: 'success',
      });
      setRejectDialog(null);
      await fetchEnrollments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reject enrollment.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEnrollments = enrollments.filter(item => {
    const q = search.toLowerCase();
    const sName = (item.student?.user?.name || '').toLowerCase();
    const sId = (item.student?.student_id_number || '').toLowerCase();
    const course = (item.student?.course?.code || '').toLowerCase();
    return sName.includes(q) || sId.includes(q) || course.includes(q);
  });

  const columns = [
    {
      key: 'studentId',
      label: 'Student ID',
      render: (row: any) => (
        <span className="font-mono text-xs font-bold text-brand-primary bg-slate-100 px-2 py-0.5 rounded">
          {row.student?.student_id_number || `STU-${row.student_id}`}
        </span>
      ),
    },
    {
      key: 'studentName',
      label: 'Student Name',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-slate-900">{row.student?.user?.name || 'Enrolled Student'}</div>
          <div className="text-xs text-slate-500">{row.student?.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Degree Course',
      render: (row: any) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.student?.course?.code || 'BSIT'}
        </span>
      ),
    },
    {
      key: 'semester',
      label: 'Academic Term',
      render: (row: any) => (
        <span className="text-xs text-slate-700">
          {row.semester?.name || '1st Semester SY 2025-2026'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Filing Date',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.enrolled_at ? new Date(row.enrolled_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.status || 'Pending'} />,
    },
    {
      key: 'actions',
      label: 'Decision Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          {row.status !== 'approved' && (
            <button
              onClick={() => handleApprove(row)}
              disabled={submitting}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
              title="Approve Enrollment"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}
          {row.status !== 'rejected' && (
            <button
              onClick={() => {
                setRejectDialog(row);
                setRejectRemarks('Incomplete prerequisites or documentary requirements.');
              }}
              disabled={submitting}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-semibold transition-colors disabled:opacity-50"
              title="Reject Enrollment"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Student Registration & Enrollment Approval"
        subtitle="Review, approve, and finalize student academic enrollment applications in real-time"
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by student name, ID number, or course..." />
          <FormSelect
            label=""
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Enrollment Applications' },
              { value: 'pending', label: 'Pending Review Only' },
              { value: 'approved', label: 'Approved Students Only' },
              { value: 'rejected', label: 'Rejected Applications Only' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading enrollment applications from database..." />
      ) : (
        <DataTable columns={columns} data={filteredEnrollments} emptyMessage="No enrollment applications found." />
      )}

      {/* Reject Remarks Confirmation Dialog */}
      {rejectDialog && (
        <ConfirmDialog
          title="Reject Student Enrollment Application"
          message={`Are you sure you want to reject the enrollment application for ${rejectDialog.student?.user?.name || 'this student'}?`}
          confirmLabel={submitting ? 'Rejecting...' : 'Confirm Rejection'}
          variant="danger"
          onConfirm={handleReject}
          onCancel={() => setRejectDialog(null)}
        />
      )}
    </div>
  );
}
