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
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { CreditCard, Plus, DollarSign, Receipt, History } from 'lucide-react';

export default function FeesManagement() {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [showAssessModal, setShowAssessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<any>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Assess Fee form state
  const [assessData, setAssessData] = useState({
    student_id: '',
    tuition: '25000',
    miscellaneous: '5000',
    laboratory: '3000',
    library: '1000',
    other_fees: '500',
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Cashier Cash',
    reference_number: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchFees();
  }, [statusFilter]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students', { per_page: 100 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setStudents(list);
    } catch (e) {
      console.error('Failed to load students', e);
    }
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/fees', params);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setFees(list);
    } catch (err: any) {
      console.error('Failed to fetch fees', err);
      setToast({ message: 'Failed to load fee accounts from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAssessModal = () => {
    setAssessData({
      student_id: students[0]?.id ? String(students[0].id) : '1',
      tuition: '25000',
      miscellaneous: '5000',
      laboratory: '3000',
      library: '1000',
      other_fees: '500',
    });
    setShowAssessModal(true);
  };

  const openPaymentModal = (fee: any) => {
    setSelectedFeeForPayment(fee);
    setPaymentData({
      amount: String(fee.balance || fee.total_amount || '5000'),
      payment_method: 'Cashier Cash',
      reference_number: `CEC-OR-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setShowPaymentModal(true);
  };

  const handleAssessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        student_id: parseInt(assessData.student_id),
        tuition: parseFloat(assessData.tuition) || 0,
        miscellaneous: parseFloat(assessData.miscellaneous) || 0,
        laboratory: parseFloat(assessData.laboratory) || 0,
        library: parseFloat(assessData.library) || 0,
        other_fees: parseFloat(assessData.other_fees) || 0,
      };

      await api.post('/admin/fees', payload);
      setToast({ message: 'Student tuition assessment created successfully.', type: 'success' });
      setShowAssessModal(false);
      await fetchFees();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create assessment.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeForPayment) return;
    setSubmitting(true);
    try {
      const payload = {
        school_fee_id: selectedFeeForPayment.id,
        amount: parseFloat(paymentData.amount) || 0,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
      };

      await api.post('/admin/payments', payload);
      setToast({
        message: `Payment of ₱${payload.amount.toLocaleString()} posted successfully (Ref: ${payload.reference_number}).`,
        type: 'success',
      });
      setShowPaymentModal(false);
      setSelectedFeeForPayment(null);
      await fetchFees();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record payment.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFees = fees.filter(f => {
    const q = search.toLowerCase();
    const sName = (f.student?.user?.name || '').toLowerCase();
    const sId = (f.student?.student_id_number || '').toLowerCase();
    const course = (f.student?.course?.code || '').toLowerCase();
    return sName.includes(q) || sId.includes(q) || course.includes(q);
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
      key: 'total',
      label: 'Total Assessed (₱)',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          ₱{Number(row.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'paid',
      label: 'Amount Paid (₱)',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-emerald-700">
          ₱{Number(row.amount_paid || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance (₱)',
      render: (row: any) => {
        const bal = Number(row.balance !== undefined ? row.balance : 0);
        return (
          <span className={`font-mono text-xs font-bold ${bal > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            ₱{bal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.status || 'unpaid'} />,
    },
    {
      key: 'actions',
      label: 'Cashier Actions',
      render: (row: any) => (
        <button
          onClick={() => openPaymentModal(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
          title="Receive Payment"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Pay / Receipt</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Student Tuition & Assessment Ledger"
        subtitle="Manage student semester tuition fees, payments, official receipts, and balance ledgers"
        action={{
          label: 'Assess Student Fee',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAssessModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by student name, ID number..." />
          <FormSelect
            label=""
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Payment Statuses' },
              { value: 'unpaid', label: 'Unpaid Accounts' },
              { value: 'partial', label: 'Partial Payment Accounts' },
              { value: 'paid', label: 'Fully Settled / Paid' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading financial ledgers from database..." />
      ) : (
        <DataTable columns={columns} data={filteredFees} emptyMessage="No fee assessments found." />
      )}

      {/* Assess New Student Fee Modal */}
      {showAssessModal && (
        <Modal
          title="New Student Tuition Assessment"
          isOpen={showAssessModal}
          onClose={() => setShowAssessModal(false)}
        >
          <form onSubmit={handleAssessSubmit} className="space-y-4">
            <FormSelect
              label="Select Student"
              value={assessData.student_id}
              onChange={(e) => setAssessData({ ...assessData, student_id: e.target.value })}
              options={students.map(s => ({
                value: String(s.id),
                label: `${s.student_id_number || 'STU'} - ${s.user?.name || s.name} (${s.course?.code || 'BSIT'})`,
              }))}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Tuition Fee (₱)"
                type="number"
                value={assessData.tuition}
                onChange={(e) => setAssessData({ ...assessData, tuition: e.target.value })}
                required
              />
              <FormInput
                label="Miscellaneous Fee (₱)"
                type="number"
                value={assessData.miscellaneous}
                onChange={(e) => setAssessData({ ...assessData, miscellaneous: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Laboratory (₱)"
                type="number"
                value={assessData.laboratory}
                onChange={(e) => setAssessData({ ...assessData, laboratory: e.target.value })}
                required
              />
              <FormInput
                label="Library (₱)"
                type="number"
                value={assessData.library}
                onChange={(e) => setAssessData({ ...assessData, library: e.target.value })}
                required
              />
              <FormInput
                label="Other Fees (₱)"
                type="number"
                value={assessData.other_fees}
                onChange={(e) => setAssessData({ ...assessData, other_fees: e.target.value })}
                required
              />
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700">Total Assessment:</span>
              <span className="font-mono text-lg font-bold text-brand-primary">
                ₱{(
                  (parseFloat(assessData.tuition) || 0) +
                  (parseFloat(assessData.miscellaneous) || 0) +
                  (parseFloat(assessData.laboratory) || 0) +
                  (parseFloat(assessData.library) || 0) +
                  (parseFloat(assessData.other_fees) || 0)
                ).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAssessModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-secondary rounded-md font-medium text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Assessing...' : 'Save Assessment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedFeeForPayment && (
        <Modal
          title={`Cashier Payment: ${selectedFeeForPayment.student?.user?.name || 'Student'}`}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFeeForPayment(null);
          }}
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Student:</span>
                <span className="font-bold text-blue-900">{selectedFeeForPayment.student?.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Outstanding Balance:</span>
                <span className="font-bold font-mono text-red-600">
                  ₱{Number(selectedFeeForPayment.balance || selectedFeeForPayment.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <FormInput
              label="Payment Amount (₱)"
              type="number"
              min="1"
              max={selectedFeeForPayment.balance || selectedFeeForPayment.total_amount || 100000}
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              required
            />

            <FormSelect
              label="Payment Channel"
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
              options={[
                { value: 'Cashier Cash', label: 'Cashier Cash Payment' },
                { value: 'GCash / Maya', label: 'GCash / Maya Online' },
                { value: 'Bank Transfer (BDO/BPI)', label: 'Bank Direct Deposit' },
                { value: 'Credit / Debit Card', label: 'Credit / Debit POS' },
              ]}
              required
            />

            <FormInput
              label="Official Receipt / Reference No."
              value={paymentData.reference_number}
              onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
              placeholder="e.g. CEC-OR-123456"
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedFeeForPayment(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting Payment...' : 'Post & Print Receipt'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
