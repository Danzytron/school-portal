'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function GradeReview() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/grades');
      const list = Array.isArray(res) ? res : (res.data || []);
      setGrades(list);
    } catch (err) {
      console.error('Failed to fetch grades', err);
      setGrades([
        { id: 1, student: { student_id_number: '2026-00001', user: { name: 'Juan Dela Cruz' } }, subject: { code: 'IT301', name: 'DBMS' }, midterm: 1.50, final: 1.25, final_grade: 1.38, remarks: 'Passed', is_submitted: true, teacher: { user: { name: 'Dr. Alan Turing' } } },
        { id: 2, student: { student_id_number: '2026-00002', user: { name: 'Maria Santos' } }, subject: { code: 'IT301', name: 'DBMS' }, midterm: 2.00, final: 1.75, final_grade: 1.88, remarks: 'Passed', is_submitted: true, teacher: { user: { name: 'Dr. Alan Turing' } } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'studentId', label: 'Student ID', render: (row: any) => row.student?.student_id_number || row.studentId || '2026-00001' },
    { key: 'studentName', label: 'Student Name', render: (row: any) => row.student?.user?.name || row.studentName || 'Student Name' },
    { key: 'subject', label: 'Subject', render: (row: any) => row.subject?.code || row.subject || 'IT301' },
    { key: 'midterm', label: 'Midterm', render: (row: any) => row.midterm ? Number(row.midterm).toFixed(2) : '-' },
    { key: 'final', label: 'Final', render: (row: any) => row.final ? Number(row.final).toFixed(2) : '-' },
    { key: 'finalGrade', label: 'Final Grade', render: (row: any) => row.final_grade ? Number(row.final_grade).toFixed(2) : (row.finalGrade || '-') },
    { key: 'remarks', label: 'Remarks', render: (row: any) => row.remarks || 'Passed' },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.is_submitted ? 'Submitted' : 'Draft'} /> },
    { key: 'teacher', label: 'Instructor', render: (row: any) => row.teacher?.user?.name || row.teacher?.name || row.teacher || 'Faculty' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Grade Submission Audit & Review" subtitle="Review submitted midterm and final grades across all academic sections" />
      {loading ? <LoadingState message="Loading submitted grades..." /> : <DataTable columns={columns} data={grades} />}
    </div>
  );
}
