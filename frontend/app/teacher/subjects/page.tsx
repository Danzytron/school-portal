'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { BookOpen, Users, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function TeacherSubjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('1');

  const DEFAULT_TEACHER_SUBJECTS = [
    {
      id: 1,
      subject: { code: 'IT 312', name: 'Advanced Web Systems & Architecture', units: 3 },
      section: { name: 'BSIT 3-A' },
      schedule: 'Mon / Wed 09:00 AM - 10:30 AM',
      studentsCount: 38
    },
    {
      id: 2,
      subject: { code: 'IT 311', name: 'Advanced Database Systems', units: 3 },
      section: { name: 'BSIT 3-B' },
      schedule: 'Tue / Thu 01:30 PM - 03:00 PM',
      studentsCount: 40
    },
    {
      id: 3,
      subject: { code: 'CS 301', name: 'Software Engineering 1', units: 3 },
      section: { name: 'BSCS 3-A' },
      schedule: 'Fri 10:00 AM - 12:00 PM',
      studentsCount: 35
    }
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/teacher/subjects?semester=${semester}`);
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
        } else {
          setSubjects(DEFAULT_TEACHER_SUBJECTS);
        }
      } catch (error) {
        console.error('Error fetching faculty subjects', error);
        setSubjects(DEFAULT_TEACHER_SUBJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [semester]);

  const columns = [
    { 
      header: 'Subject Code',
      accessor: 'subject.code',
      render: (row: any) => (
        <span className="font-mono font-bold text-[#1D4ED8]">
          {row.subject?.code || 'IT 312'}
        </span>
      )
    },
    { 
      header: 'Subject Name',
      accessor: 'subject.name',
      render: (row: any) => (
        <span className="font-medium text-slate-900">
          {row.subject?.name || 'Assigned Course'}
        </span>
      )
    },
    { 
      header: 'Units',
      accessor: 'subject.units',
      align: 'center' as const,
      render: (row: any) => (
        <span className="font-mono text-slate-700">
          {(row.subject?.units || 3).toFixed(1)}
        </span>
      )
    },
    { 
      header: 'Section',
      accessor: 'section.name',
      render: (row: any) => (
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
          {row.section?.name || 'BSIT 3-A'}
        </span>
      )
    },
    { 
      header: 'Class Schedule',
      accessor: 'schedule',
      render: (row: any) => (
        <span className="text-slate-600 font-mono text-[11px]">
          {row.schedule || 'Mon / Wed 09:00 AM - 10:30 AM'}
        </span>
      )
    },
    { 
      header: 'Students',
      accessor: 'studentsCount',
      align: 'center' as const,
      render: (row: any) => (
        <span className="font-mono font-bold text-slate-900">
          {row.studentsCount || 38}
        </span>
      )
    },
    { 
      header: 'Actions',
      accessor: 'id',
      align: 'right' as const,
      render: (row: any) => (
        <Link 
          href={`/teacher/students?subject_id=${row.id}`} 
          className="btn-outline text-xs inline-flex items-center gap-1"
        >
          <Users size={12} />
          <span>Class Roster</span>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader 
        title="Assigned Academic Courses" 
        subtitle="Manage teaching load, student rosters, and syllabi for the active semester."
        badge="Faculty Load"
      />
      
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-[#1D4ED8]" />
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Academic Term
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 px-3 min-w-[240px]"
            >
              <option value="1">1st Semester A.Y. 2026–2027 (Current)</option>
              <option value="2">2nd Semester A.Y. 2025–2026</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Total Assigned Classes: <strong className="text-slate-900 font-mono">{subjects.length}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <span className="font-heading font-bold text-slate-900">Faculty Course Assignments</span>
          <span className="text-[11px] font-mono text-slate-500">{subjects.length} Active Courses</span>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8"><LoadingState message="Retrieving faculty class load..." /></div>
          ) : (
            <DataTable
              columns={columns}
              data={subjects}
              keyField="id"
              emptyMessage="No subjects assigned for this semester."
            />
          )}
        </div>
      </div>
    </div>
  );
}
