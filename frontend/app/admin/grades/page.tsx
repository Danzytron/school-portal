'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Award, CheckCircle2, Search, Filter } from 'lucide-react';

export default function GradeReview() {
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchLookups();
    fetchGrades();
  }, []);

  const fetchLookups = async () => {
    try {
      const res = await api.get('/admin/subjects');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSubjects(list);
    } catch (e) {
      console.error('Failed to load subjects', e);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/grades', { per_page: 100 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setGrades(list);
    } catch (err: any) {
      console.error('Failed to fetch grades', err);
      setToast({ message: 'Failed to load grade records from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (grade: any) => {
    setSubmitting(true);
    try {
      await api.put(`/admin/grades/${grade.id}/finalize`);
      setToast({
        message: `Grade for ${grade.student?.user?.name || 'student'} in ${grade.subject?.code || 'subject'} has been finalized.`,
        type: 'success',
      });
      await fetchGrades();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to finalize grade.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGrades = grades.filter(g => {
    const q = search.toLowerCase();
    const sName = (g.student?.user?.name || '').toLowerCase();
    const sId = (g.student?.student_id_number || '').toLowerCase();
    const subCode = (g.subject?.code || '').toLowerCase();
    const teacherName = (g.teacher?.user?.name || '').toLowerCase();

    const matchesSearch = sName.includes(q) || sId.includes(q) || subCode.includes(q) || teacherName.includes(q);
    const matchesSub = !selectedSubject || String(g.subject_id) === selectedSubject;
    return matchesSearch && matchesSub;
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
          <div className="text-xs text-slate-500">{row.student?.course?.code || 'BSIT'}</div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject Offering',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-brand-secondary">{row.subject?.code || 'IT301'}</div>
          <div className="text-xs text-slate-600 truncate max-w-xs">{row.subject?.name || ''}</div>
        </div>
      ),
    },
    {
      key: 'midterm',
      label: 'Prelim / Midterm',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.midterm ? Number(row.midterm).toFixed(2) : (row.prelim ? Number(row.prelim).toFixed(2) : '-')}
        </span>
      ),
    },
    {
      key: 'final',
      label: 'Final Rating',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.final ? Number(row.final).toFixed(2) : '-'}
        </span>
      ),
    },
    {
      key: 'finalGrade',
      label: 'Computed Grade',
      render: (row: any) => {
        const gradeVal = row.final_grade || row.final;
        if (!gradeVal) return <span className="text-slate-400 font-mono text-xs">Pending</span>;
        const num = Number(gradeVal);
        return (
          <span className={`font-mono text-sm font-bold ${num <= 3.0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {num.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (row: any) => {
        const gradeVal = Number(row.final_grade || row.final || 0);
        const rem = row.remarks || (gradeVal > 0 ? (gradeVal <= 3.0 ? 'Passed' : 'Failed') : 'In Progress');
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
            rem === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            rem === 'Failed' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {rem}
          </span>
        );
      },
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (row: any) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.teacher?.user?.name || 'Faculty Member'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.is_submitted ? 'Submitted' : 'Draft'} />,
    },
    {
      key: 'actions',
      label: 'Audit Action',
      render: (row: any) => (
        <button
          onClick={() => handleFinalize(row)}
          disabled={submitting || row.is_finalized}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
            row.is_finalized
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand-primary hover:bg-brand-secondary text-white'
          }`}
          title={row.is_finalized ? 'Grade Finalized' : 'Finalize & Post Grade'}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{row.is_finalized ? 'Finalized' : 'Finalize'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Grade Submission Audit & Review"
        subtitle="Review, audit, and officially post midterm and final academic ratings across all departments"
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by student name, ID number, instructor..." />
          <FormSelect
            label=""
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={[{ value: '', label: 'All Subject Offerings' }, ...subjects.map(s => ({ value: String(s.id), label: `${s.code} - ${s.name}` }))]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading student grades from database..." />
      ) : (
        <DataTable columns={columns} data={filteredGrades} emptyMessage="No grade records found." />
      )}
    </div>
  );
}
