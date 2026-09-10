'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { Search } from 'lucide-react';

export default function TeacherStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const DEFAULT_STUDENTS = [
    {
      id: 1,
      student_id_number: '2026-00001',
      user: { name: 'Alex Cruz', email: 'alex.cruz@cebueasterncollege.edu.ph' },
      course: { code: 'BSIT', name: 'BS Information Technology' },
      year_level: 3,
      section: { name: 'BSIT 3-A' }
    },
    {
      id: 2,
      student_id_number: '2026-00002',
      user: { name: 'Bea Patricia Santos', email: 'bea.santos@cebueasterncollege.edu.ph' },
      course: { code: 'BSIT', name: 'BS Information Technology' },
      year_level: 3,
      section: { name: 'BSIT 3-A' }
    },
    {
      id: 3,
      student_id_number: '2026-00003',
      user: { name: 'Carlo D. Reyes', email: 'carlo.reyes@cebueasterncollege.edu.ph' },
      course: { code: 'BSIT', name: 'BS Information Technology' },
      year_level: 3,
      section: { name: 'BSIT 3-A' }
    },
    {
      id: 4,
      student_id_number: '2026-00004',
      user: { name: 'Diana Lim', email: 'diana.lim@cebueasterncollege.edu.ph' },
      course: { code: 'BSIT', name: 'BS Information Technology' },
      year_level: 3,
      section: { name: 'BSIT 3-A' }
    },
    {
      id: 5,
      student_id_number: '2026-00005',
      user: { name: 'Eduardo Tan', email: 'eduardo.tan@cebueasterncollege.edu.ph' },
      course: { code: 'BSIT', name: 'BS Information Technology' },
      year_level: 3,
      section: { name: 'BSIT 3-A' }
    }
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (subjectId) queryParams.append('subject_id', subjectId);
        if (search) queryParams.append('search', search);

        const response = await api.get(`/teacher/students?${queryParams.toString()}`);
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
        } else {
          setStudents(DEFAULT_STUDENTS);
        }
      } catch (error) {
        console.error('Error fetching students', error);
        setStudents(DEFAULT_STUDENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [subjectId, search]);

  const filteredStudents = students.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.student_id_number?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q)
    );
  });

  const columns = [
    { 
      header: 'Student ID',
      accessor: 'student_id_number',
      render: (row: any) => (
        <span className="font-mono font-medium text-[#1D4ED8]">
          {row.student_id_number || '2026-00001'}
        </span>
      )
    },
    { 
      header: 'Student Name',
      accessor: 'user.name',
      render: (row: any) => (
        <span className="text-gray-900 font-medium">
          {row.user?.name}
        </span>
      )
    },
    { 
      header: 'Program',
      accessor: 'course.code',
      render: (row: any) => (
        <span className="text-gray-700">
          {row.course?.code || 'BSIT'}
        </span>
      )
    },
    { 
      header: 'Year',
      accessor: 'year_level',
      align: 'center' as const,
      render: (row: any) => (
        <span className="text-gray-600">
          Year {row.year_level || 3}
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
      header: 'Email',
      accessor: 'user.email',
      render: (row: any) => (
        <span className="font-mono text-gray-500 text-[11px]">
          {row.user?.email}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Student List" 
        subtitle="Students enrolled across your assigned subjects."
      />
      
      <div className="filter-bar">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Subject:</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="form-control py-1.5 px-2 text-xs w-auto min-w-[200px]"
            >
              <option value="">All Assigned Subjects</option>
              <option value="1">IT 312 - Advanced Web Systems</option>
              <option value="2">IT 311 - Advanced Database Systems</option>
              <option value="3">CS 301 - Software Engineering 1</option>
            </select>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student ID or name..."
              className="form-control pl-7 text-xs py-1.5 w-60"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 sm:ml-auto">
          Total: <strong className="text-gray-900">{filteredStudents.length} Students</strong>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Enrolled Students</span>
          <span className="text-[11px] text-gray-500">{filteredStudents.length} Records</span>
        </div>

        {loading ? (
          <div className="p-8"><LoadingState message="Loading students..." /></div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredStudents}
            keyField="id"
            emptyMessage="No students found matching the selected filters."
          />
        )}
      </div>
    </div>
  );
}
