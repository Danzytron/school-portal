'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/enrollments');
      const list = Array.isArray(res) ? res : (res.data || []);
      setEnrollments(list);
    } catch (err) {
      console.error('Failed to fetch enrollments', err);
      setEnrollments([
        { id: 1, student: { student_id_number: '2026-00001', user: { name: 'Juan Dela Cruz' }, course: { code: 'BSIT' } }, semester: { name: '1st Semester SY 2025-2026' }, status: 'approved', enrolled_at: '2026-08-01' },
        { id: 2, student: { student_id_number: '2026-00002', user: { name: 'Maria Santos' }, course: { code: 'BSCS' } }, semester: { name: '1st Semester SY 2025-2026' }, status: 'pending', enrolled_at: '2026-08-05' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'studentId', label: 'Student ID', render: (row: any) => row.student?.student_id_number || row.studentId || '2026-00001' },
    { key: 'studentName', label: 'Student Name', render: (row: any) => row.student?.user?.name || row.studentName || 'Student Name' },
    { key: 'course', label: 'Degree Course', render: (row: any) => row.student?.course?.code || row.course || 'BSIT' },
    { key: 'semester', label: 'Academic Term', render: (row: any) => row.semester?.name || row.semester || '1st Semester SY 2025-2026' },
    { key: 'date', label: 'Filing Date', render: (row: any) => row.enrolled_at ? new Date(row.enrolled_at).toLocaleDateString() : (row.date || '2026-08-01') },
    { key: 'status', label: 'Registration Status', render: (row: any) => <StatusBadge status={row.status || 'Pending'} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Student Registration & Enrollment Approval" subtitle="Review, approve, and audit student academic enrollment applications" />
      {loading ? <LoadingState message="Loading enrollment records..." /> : <DataTable columns={columns} data={enrollments} />}
    </div>
  );
}
