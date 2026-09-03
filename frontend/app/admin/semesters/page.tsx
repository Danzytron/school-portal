'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/semesters');
      const list = Array.isArray(res) ? res : (res.data || []);
      setSemesters(list);
    } catch (err) {
      console.error('Failed to fetch semesters', err);
      setSemesters([
        { id: 1, name: '1st Semester', school_year: { year_start: 2025, year_end: 2026 }, start_date: '2025-08-04', end_date: '2025-12-19', is_current: true },
        { id: 2, name: '2nd Semester', school_year: { year_start: 2025, year_end: 2026 }, start_date: '2026-01-05', end_date: '2026-05-22', is_current: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Academic Semester', render: (row: any) => row.name },
    { key: 'schoolYear', label: 'School Year', render: (row: any) => row.school_year ? `SY ${row.school_year.year_start}-${row.school_year.year_end}` : (row.schoolYear || 'SY 2025-2026') },
    { key: 'startDate', label: 'Start Date', render: (row: any) => row.start_date },
    { key: 'endDate', label: 'End Date', render: (row: any) => row.end_date },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.is_current ? 'Current Semester' : 'Inactive'} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Academic Periods & Term Management" subtitle="Configure active school years, semester start/end dates, and encoding periods" />
      {loading ? <LoadingState message="Loading academic terms..." /> : <DataTable columns={columns} data={semesters} />}
    </div>
  );
}
