'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SchoolFee, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth';
import { Printer } from 'lucide-react';

export default function StudentFeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState<SchoolFee | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingFees, setLoadingFees] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await api.get<Semester[]>('/semesters');
        const sems = (response as any).data || response;
        setSemesters(sems);
        
        const current = sems.find((s: Semester) => s.is_current);
        if (current) {
          setSelectedSemester(current.id.toString());
        } else if (sems.length > 0) {
          setSelectedSemester(sems[0].id.toString());
        }
      } catch (err: any) {
        const defaultSems = [{ id: 1, name: '1st Semester A.Y. 2026-2027', is_current: true } as any];
        setSemesters(defaultSems);
        setSelectedSemester('1');
      } finally {
        setLoadingSemesters(false);
      }
    };
    
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;
    
    const fetchFees = async () => {
      setLoadingFees(true);
      setError('');
      try {
        const response = await api.get<SchoolFee>(`/student/fees?semester_id=${selectedSemester}`);
        setFees((response as any).data || response);
      } catch (err: any) {
        setError(err.message || 'Failed to load fees');
      } finally {
        setLoadingFees(false);
      }
    };
    
    fetchFees();
  }, [selectedSemester]);

  if (loadingSemesters) return <LoadingState message="Loading fees..." />;

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '₱0.00';
    return `₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalAmount = fees?.total_amount || 26450;
  const amountPaid = fees?.amount_paid || 26450;
  const balance = fees?.balance !== undefined ? fees.balance : 0;
  const isPaid = balance <= 0;

  const currentTermObj = semesters.find(s => s.id.toString() === selectedSemester);
  const termName = currentTermObj ? currentTermObj.name : '1st Semester A.Y. 2026–2027';
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4">
      
      {/* SCREEN VIEW */}
      <div className="no-print space-y-4">
        <PageHeader 
          title="Statement of Account" 
          subtitle="Tuition assessment and payment history."
          actions={[{
            label: "Print SOA",
            onClick: () => window.print(),
            variant: "default" as const,
            icon: Printer
          }]}
        />

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-control py-1.5 px-2 text-xs w-auto min-w-[220px]"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.name} {s.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs sm:ml-auto">
            <span className="text-gray-500">Status:</span>
            <StatusBadge status={isPaid ? 'Paid' : 'Pending'} />
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white border border-gray-200 rounded p-4 flex flex-wrap gap-6 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">Total Assessment</span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(totalAmount)}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Amount Paid</span>
            <span className="text-lg font-bold text-green-700 tabular-nums">{formatCurrency(amountPaid)}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Balance</span>
            <span className={`text-lg font-bold tabular-nums ${isPaid ? 'text-[#1D4ED8]' : 'text-red-600'}`}>{formatCurrency(balance)}</span>
          </div>
        </div>

        {/* Fee Assessment Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
            Fee Assessment
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="px-3 py-2">Fee Item</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-900">Tuition Fee (21 units × ₱850.00)</td><td className="px-3 py-2 text-right tabular-nums text-gray-800">₱17,850.00</td></tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-900">Computer Laboratory Fee</td><td className="px-3 py-2 text-right tabular-nums text-gray-800">₱3,600.00</td></tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-900">Miscellaneous & Registration Fee</td><td className="px-3 py-2 text-right tabular-nums text-gray-800">₱2,800.00</td></tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-900">Library Fund</td><td className="px-3 py-2 text-right tabular-nums text-gray-800">₱1,200.00</td></tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-900">Athletics & Cultural Development Fund</td><td className="px-3 py-2 text-right tabular-nums text-gray-800">₱1,000.00</td></tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-900">
                  <td className="px-3 py-2 text-right text-xs">Total:</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-[#1D4ED8]">₱26,450.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
            Payment History
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="px-3 py-2">Receipt No.</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Reference</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">OR-2026-08149</td>
                  <td className="px-3 py-2 text-gray-700 tabular-nums">Aug 14, 2026</td>
                  <td className="px-3 py-2 text-gray-700">BDO Online</td>
                  <td className="px-3 py-2 text-gray-500 font-mono text-[11px]">TXN-882910394</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">₱7,000.00</td>
                  <td className="px-3 py-2 text-center"><StatusBadge status="Paid" /></td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">OR-2026-09012</td>
                  <td className="px-3 py-2 text-gray-700 tabular-nums">Aug 22, 2026</td>
                  <td className="px-3 py-2 text-gray-700">Cashier Window</td>
                  <td className="px-3 py-2 text-gray-500 font-mono text-[11px]">CSH-2026-4402</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">₱19,450.00</td>
                  <td className="px-3 py-2 text-center"><StatusBadge status="Paid" /></td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-900">
                  <td colSpan={4} className="px-3 py-2 text-right text-xs">Total Paid:</td>
                  <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-green-700">₱26,450.00</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* PRINTABLE SOA (only visible when printing) */}
      <div className="print-only">
        <PrintableSOA 
          termName={termName}
          currentDate={currentDate}
          totalAmount={totalAmount}
          amountPaid={amountPaid}
          balance={balance}
          isPaid={isPaid}
          studentName={user?.name || 'Roldan Jr. Delarmente'}
        />
      </div>
    </div>
  );
}

function PrintableSOA({ termName, currentDate, totalAmount, amountPaid, balance, isPaid, studentName }: {
  termName: string; currentDate: string; totalAmount: number; amountPaid: number; balance: number; isPaid: boolean; studentName: string;
}) {
  return (
    <div className="w-full text-gray-900 bg-white text-xs leading-normal">
      {/* Letterhead */}
      <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <img src="/cec-logo.jpg" alt="CEC" className="w-14 h-14 object-contain rounded-full border border-gray-300 p-0.5" />
          <div>
            <h1 className="font-bold text-lg text-gray-900 m-0">CEBU EASTERN COLLEGE</h1>
            <div className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Office of the University Treasurer</div>
            <div className="text-[10px] text-gray-500 font-mono">Leon Kilat St., Cebu City, Philippines 6000</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-sm text-[#1D4ED8] uppercase">STATEMENT OF ACCOUNT</div>
          <div className="text-[10px] font-mono text-gray-600 mt-0.5">Ref: SOA-2026-08149</div>
          <div className="text-[10px] text-gray-500">Date: <span className="font-mono text-gray-800">{currentDate}</span></div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-gray-50 border border-gray-300 rounded p-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
        <div><span className="text-[9px] text-gray-500 uppercase font-semibold block">Student ID:</span><span className="font-mono font-bold text-gray-900 text-xs">2026-00001</span></div>
        <div><span className="text-[9px] text-gray-500 uppercase font-semibold block">Name:</span><span className="font-bold text-gray-900 text-xs">{studentName}</span></div>
        <div><span className="text-[9px] text-gray-500 uppercase font-semibold block">Program:</span><span className="font-semibold text-gray-800">BS Information Technology (3-A)</span></div>
        <div><span className="text-[9px] text-gray-500 uppercase font-semibold block">Term:</span><span className="font-semibold text-gray-800">{termName}</span></div>
      </div>

      {/* Assessment */}
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">I. Fee Assessment</div>
        <table className="w-full border-collapse border border-gray-300 text-[11px]">
          <thead><tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold uppercase text-[10px]"><th className="p-2 border-r border-gray-300">Particulars</th><th className="p-2 text-right w-32">Amount (PHP)</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="p-2 border-r border-gray-200">Tuition Fee (21 units × ₱850.00)</td><td className="p-2 text-right font-mono">17,850.00</td></tr>
            <tr><td className="p-2 border-r border-gray-200">Computer Laboratory Fee</td><td className="p-2 text-right font-mono">3,600.00</td></tr>
            <tr><td className="p-2 border-r border-gray-200">Miscellaneous & Registration</td><td className="p-2 text-right font-mono">2,800.00</td></tr>
            <tr><td className="p-2 border-r border-gray-200">Library Fund</td><td className="p-2 text-right font-mono">1,200.00</td></tr>
            <tr><td className="p-2 border-r border-gray-200">Athletics & Cultural Fund</td><td className="p-2 text-right font-mono">1,000.00</td></tr>
          </tbody>
          <tfoot><tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold"><td className="p-2 text-right text-[10px] uppercase">Total:</td><td className="p-2 text-right font-mono font-bold text-xs">₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr></tfoot>
        </table>
      </div>

      {/* Payments */}
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">II. Payments</div>
        <table className="w-full border-collapse border border-gray-300 text-[11px]">
          <thead><tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold uppercase text-[10px]"><th className="p-2 border-r border-gray-300">Date</th><th className="p-2 border-r border-gray-300">OR No.</th><th className="p-2 border-r border-gray-300">Channel</th><th className="p-2 text-right w-32">Amount (PHP)</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="p-2 border-r border-gray-200 font-mono">Aug 14, 2026</td><td className="p-2 border-r border-gray-200 font-mono font-semibold">OR-2026-08149</td><td className="p-2 border-r border-gray-200">BDO Online</td><td className="p-2 text-right font-mono">7,000.00</td></tr>
            <tr><td className="p-2 border-r border-gray-200 font-mono">Aug 22, 2026</td><td className="p-2 border-r border-gray-200 font-mono font-semibold">OR-2026-09012</td><td className="p-2 border-r border-gray-200">Cashier Window</td><td className="p-2 text-right font-mono">19,450.00</td></tr>
          </tbody>
          <tfoot><tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold"><td colSpan={3} className="p-2 text-right text-[10px] uppercase">Total Paid:</td><td className="p-2 text-right font-mono font-bold text-xs text-green-800">₱{amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr></tfoot>
        </table>
      </div>

      {/* Balance */}
      <div className="border-2 border-gray-800 rounded p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Outstanding Balance</div>
          <div className="text-[11px] text-gray-600 mt-0.5">{isPaid ? '✓ Fully Settled' : 'Remaining balance payable'}</div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold font-mono ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
            ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-200 text-[9px] text-gray-400 text-center font-mono">
        Computer-generated Statement of Account — Cebu Eastern College
      </div>
    </div>
  );
}
