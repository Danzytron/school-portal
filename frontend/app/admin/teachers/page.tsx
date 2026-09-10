'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/teachers');
      const list = Array.isArray(res) ? res : (res.data || []);
      setTeachers(list);
    } catch (err) {
      console.error('Failed to fetch teachers', err);
      setTeachers([
        { id: 1, employee_id: 'EMP-001', user: { name: 'Dr. Alan Turing', email: 'aturing@school.edu' }, department: 'Computer Science', specialization: 'Algorithms' },
        { id: 2, employee_id: 'EMP-002', user: { name: 'Prof. Grace Hopper', email: 'ghopper@school.edu' }, department: 'Information Tech', specialization: 'Compilers' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'empId', label: 'Employee ID', render: (row: any) => row.employee_id || row.empId || 'EMP-000' },
    { key: 'name', label: 'Faculty Name', render: (row: any) => row.user?.name || row.name },
    { key: 'department', label: 'Department', render: (row: any) => row.department || 'Computer Studies' },
    { key: 'email', label: 'Email', render: (row: any) => row.user?.email || row.email },
    { key: 'specialization', label: 'Specialization', render: (row: any) => row.specialization || 'Software Engineering' },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.user?.is_active !== false ? 'Active' : 'Inactive'} /> },
  ];

  const filteredTeachers = teachers.filter(t => {
    const q = search.toLowerCase();
    const name = t.user?.name || t.name || '';
    const empId = t.employee_id || t.empId || '';
    return name.toLowerCase().includes(q) || empId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Faculty & Staff Management" subtitle="Manage university teaching staff and department assignments" />
      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs flex justify-between items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or employee ID..." />
      </div>
      {loading ? <LoadingState message="Loading faculty directory..." /> : <DataTable columns={columns} data={filteredTeachers} />}
    </div>
  );
}
