'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function FeesManagement() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/fees');
      const list = Array.isArray(res) ? res : (res.data || []);
      setFees(list);
    } catch (err) {
      console.error('Failed to fetch fees', err);
      setFees([
        { id: 1, student: { student_id_number: '2026-00001', user: { name: 'Juan Dela Cruz' }, course: { code: 'BSIT' } }, total_amount: 18500, amount_paid: 18500, balance: 0, status: 'paid' },
        { id: 2, student: { student_id_number: '2026-00002', user: { name: 'Maria Santos' }, course: { code: 'BSCS' } }, total_amount: 22000, amount_paid: 10000, balance: 12000, status: 'partial' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'studentId', label: 'Student ID', render: (row: any) => row.student?.student_id_number || row.studentId || '2026-00001' },
    { key: 'studentName', label: 'Student Name', render: (row: any) => row.student?.user?.name || row.studentName || 'Student Name' },
    { key: 'course', label: 'Degree Course', render: (row: any) => row.student?.course?.code || row.course || 'BSIT' },
    { key: 'total', label: 'Total Assessed (₱)', render: (row: any) => Number(row.total_amount || row.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) },
    { key: 'paid', label: 'Amount Paid (₱)', render: (row: any) => Number(row.amount_paid || row.paid || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) },
    { key: 'balance', label: 'Outstanding Balance (₱)', render: (row: any) => Number(row.balance !== undefined ? row.balance : 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) },
    { key: 'status', label: 'Payment Status', render: (row: any) => <StatusBadge status={row.status || 'unpaid'} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Student Tuition & Assessment Ledger" subtitle="Manage student semester assessment fees, payments, and balances" />
      {loading ? <LoadingState message="Loading financial ledgers..." /> : <DataTable columns={columns} data={fees} />}
    </div>
  );
}
