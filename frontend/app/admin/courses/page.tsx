'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses');
      const list = Array.isArray(res) ? res : (res.data || []);
      setCourses(list);
    } catch (err) {
      console.error('Failed to fetch courses', err);
      setCourses([
        { id: 1, code: 'BSIT', name: 'Bachelor of Science in Information Technology', department: 'Computer Studies', duration_years: 4, is_active: true },
        { id: 2, code: 'BSCS', name: 'Bachelor of Science in Computer Science', department: 'Computer Studies', duration_years: 4, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Program Code', render: (row: any) => row.code },
    { key: 'name', label: 'Degree Name', render: (row: any) => row.name },
    { key: 'department', label: 'Department', render: (row: any) => row.department || 'Computer Studies' },
    { key: 'duration', label: 'Duration', render: (row: any) => `${row.duration_years || row.duration || 4} Years` },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.is_active !== false ? 'Active' : 'Inactive'} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Degree Course Management" subtitle="Manage academic degree programs and department curricula" />
      {loading ? <LoadingState message="Loading degree programs..." /> : <DataTable columns={columns} data={courses} />}
    </div>
  );
}
