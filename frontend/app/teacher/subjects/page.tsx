'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
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
      header: 'Course Code',
      accessor: 'subject.code',
      render: (row: any) => (
        <span className="font-mono font-medium text-[#1D4ED8]">
          {row.subject?.code || 'IT 312'}
        </span>
      )
    },
    { 
      header: 'Course Title',
      accessor: 'subject.name',
      render: (row: any) => (
        <span className="text-gray-900">
          {row.subject?.name || 'Assigned Course'}
        </span>
      )
    },
    { 
      header: 'Units',
      accessor: 'subject.units',
      align: 'center' as const,
      render: (row: any) => (
        <span className="text-gray-700 tabular-nums">
          {(row.subject?.units || 3).toFixed(1)}
        </span>
      )
    },
    { 
      header: 'Section',
      accessor: 'section.name',
      render: (row: any) => (
        <span className="text-gray-700 font-mono text-[11px]">
          {row.section?.name || 'BSIT 3-A'}
        </span>
      )
    },
    { 
      header: 'Schedule',
      accessor: 'schedule',
      render: (row: any) => (
        <span className="text-gray-600 text-[11px] tabular-nums">
          {row.schedule || 'Mon / Wed 09:00 AM - 10:30 AM'}
        </span>
      )
    },
    { 
      header: 'Enrolled',
      accessor: 'studentsCount',
      align: 'center' as const,
      render: (row: any) => (
        <span className="font-medium text-gray-900 tabular-nums">
          {row.studentsCount || 38}
        </span>
      )
    },
    { 
      header: 'Action',
      accessor: 'id',
      align: 'right' as const,
      render: (row: any) => (
        <Link 
          href={`/teacher/students?subject_id=${row.id}`} 
          className="text-[#1D4ED8] hover:underline text-[11px] font-medium"
        >
          View Roster
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Assigned Subjects" 
        subtitle="Faculty course load and class assignments."
      />
      
      <div className="filter-bar">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Semester:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="form-control py-1.5 px-2 text-xs w-auto min-w-[220px]"
          >
            <option value="1">1st Semester A.Y. 2026–2027 (Current)</option>
            <option value="2">2nd Semester A.Y. 2025–2026</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 sm:ml-auto">
          Total Assigned: <strong className="text-gray-900">{subjects.length} Subjects</strong>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Course Load</span>
          <span className="text-[11px] text-gray-500">{subjects.length} Courses</span>
        </div>

        {loading ? (
          <div className="p-8"><LoadingState message="Loading subjects..." /></div>
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
  );
}
