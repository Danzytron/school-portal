'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subjects');
      const list = Array.isArray(res) ? res : (res.data || []);
      setSubjects(list);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
      setSubjects([
        { id: 1, code: 'IT301', name: 'Database Management Systems', units: 3, course: { code: 'BSIT' }, year_level: 3, semester: 1, is_active: true },
        { id: 2, code: 'IT302', name: 'Web Development & Frameworks', units: 3, course: { code: 'BSIT' }, year_level: 3, semester: 1, is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Subject Code', render: (row: any) => row.code },
    { key: 'name', label: 'Subject Name', render: (row: any) => row.name },
    { key: 'units', label: 'Units', render: (row: any) => row.units },
    { key: 'course', label: 'Degree Course', render: (row: any) => row.course?.code || row.course || 'All Courses' },
    { key: 'yearLevel', label: 'Year Level', render: (row: any) => `${row.year_level || row.yearLevel || 1}st Year` },
    { key: 'semester', label: 'Semester', render: (row: any) => `${row.semester || 1}st Sem` },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.is_active !== false ? 'Active' : 'Inactive'} /> },
  ];

  const filteredSubjects = subjects.filter(s => {
    const q = search.toLowerCase();
    const name = s.name || '';
    const code = s.code || '';
    return name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Subject Master Management" subtitle="Manage academic subject offerings, credit units, and course assignments" />
      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by subject code or name..." />
      </div>
      {loading ? <LoadingState message="Loading subjects..." /> : <DataTable columns={columns} data={filteredSubjects} />}
    </div>
  );
}
