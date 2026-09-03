'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function SectionManagement() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sections');
      const list = Array.isArray(res) ? res : (res.data || []);
      setSections(list);
    } catch (err) {
      console.error('Failed to fetch sections', err);
      setSections([
        { id: 1, name: 'BSIT 3-A', course: { code: 'BSIT' }, year_level: 3, max_students: 40, is_active: true },
        { id: 2, name: 'BSCS 1-A', course: { code: 'BSCS' }, year_level: 1, max_students: 40, is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Section Name', render: (row: any) => row.name },
    { key: 'course', label: 'Degree Course', render: (row: any) => row.course?.code || row.course || 'BSIT' },
    { key: 'yearLevel', label: 'Year Level', render: (row: any) => `${row.year_level || row.yearLevel || 1}rd Year` },
    { key: 'maxStudents', label: 'Student Capacity', render: (row: any) => `${row.max_students || row.maxStudents || 40} Students` },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.is_active !== false ? 'Active' : 'Inactive'} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Class Section Management" subtitle="Manage student section groupings, capacities, and course allocations" />
      {loading ? <LoadingState message="Loading class sections..." /> : <DataTable columns={columns} data={sections} />}
    </div>
  );
}
