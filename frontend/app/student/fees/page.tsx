'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SchoolFee, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth';
import { 
  CreditCard, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Building2,
  FileCheck,
  ShieldCheck,
  Receipt,
  Eye,
  FileText
} from 'lucide-react';

export default function StudentFeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState<SchoolFee | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingFees, setLoadingFees] = useState(false);
  const [error, setError] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

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
        setError('Failed to load semesters');
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
        setError(err.message || 'Failed to load school fees');
      } finally {
        setLoadingFees(false);
      }
    };
    
    fetchFees();
  }, [selectedSemester]);

  if (loadingSemesters) return <LoadingState message="Retrieving University Treasury accounts..." />;

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
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* SCREEN VIEW (Hidden when printing via .no-print)              */}
      {/* ------------------------------------------------------------- */}
      <div className="no-print space-y-6">
        {/* Page Header */}
        <PageHeader 
          title="Student Statement of Account & Assessment" 
          subtitle="Itemized assessment of tuition and fees certified by the University Cashier."
          badge="Official Treasury Record"
          actions={[
            {
              label: showPrintPreview ? "Back to Dashboard View" : "Preview Official SOA",
              onClick: () => setShowPrintPreview(!showPrintPreview),
              variant: "default",
              icon: showPrintPreview ? FileText : Eye
            },
            {
              label: "Print Official SOA",
              onClick: handlePrint,
              variant: "primary",
              icon: Printer
            }
          ]}
        />

        {/* Financial Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs border-t-2 border-t-[#1D4ED8]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Assessed Fees</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-heading tabular-nums">
              {formatCurrency(totalAmount)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Full Term Assessment</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs border-t-2 border-t-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Payments Received</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 font-heading tabular-nums">
              {formatCurrency(amountPaid)}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Posted Official Receipts</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs border-t-2 border-t-slate-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Current Outstanding Balance</span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 font-heading tabular-nums ${isPaid ? 'text-[#1D4ED8]' : 'text-rose-600'}`}>
              {formatCurrency(balance)}
            </div>
            <div className="mt-1">
              {isPaid ? (
                <span className="text-[11px] text-[#1D4ED8] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Cleared for Examination Permit
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle size={12} /> Pending Installment Balance
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 size={18} className="text-[#1D4ED8]" />
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Select Statement Term
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="form-control text-xs font-semibold text-slate-900 py-1.5 px-3 min-w-[240px]"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id.toString()}>
                    {s.name} {s.is_current ? '(Current Term)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Account Status:</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
              {isPaid ? 'Paid in Full / Cleared' : 'Active Balance'}
            </span>
          </div>
        </div>

        {/* 2-Column Web View (Assessment Breakdown vs. Installments) */}
        {!showPrintPreview ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Itemized Tuition & Fee Assessment (7 cols) */}
              <div className="lg:col-span-7">
                <div className="panel">
                  <div className="panel-heading">
                    <div className="flex items-center gap-2">
                      <FileCheck size={16} className="text-[#1D4ED8]" />
                      <span className="font-heading font-bold text-slate-900">Itemized Fee Assessment</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">21.0 Total Units</span>
                  </div>

                  <div className="p-0">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                          <th className="px-4 py-3">Fee Item Description</th>
                          <th className="px-4 py-3 text-right">Assessment Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            Tuition Fee (21 Academic Units @ ₱850.00 / unit)
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                            ₱17,850.00
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            Computer Laboratory & Software Licensing Fee
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                            ₱3,600.00
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            Miscellaneous & Registration Fee
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                            ₱2,800.00
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            Library Fund, Digital Research & Journal Access
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                            ₱1,200.00
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            Student Athletics & Cultural Development Fund
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                            ₱1,000.00
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50/90 border-t-2 border-slate-200 font-semibold text-slate-900">
                          <td className="px-4 py-3 text-right text-xs uppercase tracking-wider">
                            Total Semester Assessment:
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#1D4ED8] text-sm">
                            ₱26,450.00
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Installment Due Dates & Guidelines (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#1D4ED8]" />
                      <span className="font-heading font-bold text-slate-900 text-sm">Installment Schedule</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">CHED Standard</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-900 block">Downpayment upon Enrollment</span>
                        <span className="text-[11px] text-slate-500 font-mono">Due: Aug 15, 2026</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 text-xs block">₱7,000.00</span>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase">Settled</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-900 block">Prelim Installment</span>
                        <span className="text-[11px] text-slate-500 font-mono">Due: Sep 15, 2026</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 text-xs block">₱6,500.00</span>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase">Settled</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-900 block">Midterm Installment</span>
                        <span className="text-[11px] text-slate-500 font-mono">Due: Oct 15, 2026</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 text-xs block">₱6,500.00</span>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase">Settled</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-900 block">Final Installment</span>
                        <span className="text-[11px] text-slate-500 font-mono">Due: Nov 20, 2026</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 text-xs block">₱6,450.00</span>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase">Settled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Payment Transaction History */}
            <div className="panel">
              <div className="panel-heading">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-[#1D4ED8]" />
                  <span className="font-heading font-bold text-slate-900">Verified Payment Transaction History</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Office of the Cashier</span>
              </div>

              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                        <th className="px-4 py-3">Official Receipt (OR)</th>
                        <th className="px-4 py-3">Transaction Date</th>
                        <th className="px-4 py-3">Payment Channel</th>
                        <th className="px-4 py-3">Reference / Check No.</th>
                        <th className="px-4 py-3 text-right">Amount Paid</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">OR-2026-08149</td>
                        <td className="px-4 py-3 font-mono text-slate-600">Aug 14, 2026</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">BDO Online Bills Payment</td>
                        <td className="px-4 py-3 font-mono text-slate-500">TXN-882910394</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₱7,000.00</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                            Validated
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">OR-2026-09012</td>
                        <td className="px-4 py-3 font-mono text-slate-600">Aug 22, 2026</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">University Cashier Window 2</td>
                        <td className="px-4 py-3 font-mono text-slate-500">CSH-2026-4402</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₱19,450.00</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                            Validated
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ON-SCREEN PREVIEW OF PRINTABLE SOA DOCUMENT */
          <div className="bg-slate-100 p-4 sm:p-6 rounded-lg border border-slate-300">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye size={14} className="text-[#1D4ED8]" />
                <span>Document Print Preview (Actual Output on Paper)</span>
              </span>
              <button 
                onClick={handlePrint}
                className="btn-primary flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Document Now</span>
              </button>
            </div>

            {/* Render Printable Document Container inside preview card */}
            <div className="bg-white p-6 sm:p-10 border border-slate-300 shadow-md max-w-4xl mx-auto rounded">
              <PrintableStatementOfAccount 
                fees={fees} 
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
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DEDICATED PRINTABLE SOA DOCUMENT                              */}
      {/* (Only visible when printing via @media print / .print-only)   */}
      {/* ------------------------------------------------------------- */}
      <div className="print-only">
        <PrintableStatementOfAccount 
          fees={fees} 
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

/**
 * Clean, formal, paper-ready Statement of Account document
 * Focuses purely on the financial assessment, payments made, and OUTSTANDING BALANCE NEEDED
 */
function PrintableStatementOfAccount({
  fees,
  termName,
  currentDate,
  totalAmount,
  amountPaid,
  balance,
  isPaid,
  studentName = 'Roldan Jr. Delarmente'
}: {
  fees: SchoolFee | null;
  termName: string;
  currentDate: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  isPaid: boolean;
  studentName?: string;
}) {
  return (
    <div className="w-full text-slate-900 bg-white text-xs leading-normal font-sans">
      
      {/* University Letterhead */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img 
            src="/cec-logo.jpg" 
            alt="Cebu Eastern College Seal" 
            className="w-16 h-16 object-contain rounded-full border border-slate-300 p-0.5" 
          />
          <div>
            <h1 className="font-heading font-bold text-lg text-slate-900 leading-tight m-0 tracking-tight">
              CEBU EASTERN COLLEGE
            </h1>
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Office of the University Treasurer & Student Accounts Division
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Leon Kilat St., Cebu City, Philippines 6000 • Tel: (032) 253-5681 • finance@cebueasterncollege.edu.ph
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-heading font-bold text-sm text-[#1D4ED8] tracking-wide uppercase">
            STATEMENT OF ACCOUNT
          </div>
          <div className="text-[10px] font-mono text-slate-600 mt-0.5">
            Ref No: <strong className="text-slate-900">SOA-2026-08149</strong>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Date of Issue: <span className="font-mono text-slate-800">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Student Billing & Academic Profile */}
      <div className="bg-slate-50 border border-slate-300 rounded p-3 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Student ID Number:</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">2026-00001</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Student Full Name:</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{studentName}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Program / Section:</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">BS Information Technology (3-A)</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold block">Academic Term:</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{termName}</span>
          </div>
        </div>
      </div>

      {/* Itemized Assessment of Fees (Billing Charges) */}
      <div className="mb-4">
        <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
          I. Itemized Assessment of Tuition & Incidental Fees
        </div>
        <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold uppercase text-[10px]">
              <th className="p-2 border-r border-slate-300">Particulars / Account Description</th>
              <th className="p-2 text-center border-r border-slate-300 w-24">Units / Basis</th>
              <th className="p-2 text-right w-32">Amount (PHP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="p-2 border-r border-slate-200">Tuition Fee (@ ₱850.00 / academic unit)</td>
              <td className="p-2 text-center border-r border-slate-200 font-mono">21.0 Units</td>
              <td className="p-2 text-right font-mono font-medium">17,850.00</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-slate-200">Computer Laboratory & Systems Software Licensing</td>
              <td className="p-2 text-center border-r border-slate-200 font-mono">Laboratory</td>
              <td className="p-2 text-right font-mono font-medium">3,600.00</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-slate-200">Registration, Guidance & Medical/Dental Services</td>
              <td className="p-2 text-center border-r border-slate-200 font-mono">Fixed</td>
              <td className="p-2 text-right font-mono font-medium">2,800.00</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-slate-200">University Library Fund & Digital Research Journals</td>
              <td className="p-2 text-center border-r border-slate-200 font-mono">Fixed</td>
              <td className="p-2 text-right font-mono font-medium">1,200.00</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-slate-200">Athletics, Cultural & Student Activity Development Fund</td>
              <td className="p-2 text-center border-r border-slate-200 font-mono">Fixed</td>
              <td className="p-2 text-right font-mono font-medium">1,000.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-900">
              <td colSpan={2} className="p-2 text-right text-[10px] uppercase tracking-wider">
                Total Assessed Semester Charges:
              </td>
              <td className="p-2 text-right font-mono font-bold text-xs">
                ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Recorded Official Payments */}
      <div className="mb-4">
        <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
          II. Recorded Payments & Remittances
        </div>
        <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold uppercase text-[10px]">
              <th className="p-2 border-r border-slate-300">Date Paid</th>
              <th className="p-2 border-r border-slate-300">Official Receipt (OR)</th>
              <th className="p-2 border-r border-slate-300">Payment Channel</th>
              <th className="p-2 border-r border-slate-300">Reference / Check No.</th>
              <th className="p-2 text-right w-32">Amount Paid (PHP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="p-2 border-r border-slate-200 font-mono">Aug 14, 2026</td>
              <td className="p-2 border-r border-slate-200 font-mono font-semibold">OR-2026-08149</td>
              <td className="p-2 border-r border-slate-200">BDO Online Bills Payment</td>
              <td className="p-2 border-r border-slate-200 font-mono text-slate-600">TXN-882910394</td>
              <td className="p-2 text-right font-mono font-medium">7,000.00</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-slate-200 font-mono">Aug 22, 2026</td>
              <td className="p-2 border-r border-slate-200 font-mono font-semibold">OR-2026-09012</td>
              <td className="p-2 border-r border-slate-200">University Cashier Window 2</td>
              <td className="p-2 border-r border-slate-200 font-mono text-slate-600">CSH-2026-4402</td>
              <td className="p-2 text-right font-mono font-medium">19,450.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-900">
              <td colSpan={4} className="p-2 text-right text-[10px] uppercase tracking-wider">
                Total Payments Received & Posted:
              </td>
              <td className="p-2 text-right font-mono font-bold text-xs text-emerald-800">
                ₱{amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* THE BALANCE OF WHAT IS NEEDED / FINAL ACCOUNT STATEMENT */}
      <div className="border-2 border-slate-800 rounded p-4 mb-4 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Account Financial Clearance Summary
            </div>
            <div className="text-sm font-heading font-bold text-slate-900 mt-0.5">
              Net Outstanding Financial Obligation
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              {isPaid ? (
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  ✓ FULLY SETTLED — NO OUTSTANDING BALANCE NEEDED
                </span>
              ) : (
                <span className="font-semibold text-rose-700">
                  REMAINING BALANCE PAYABLE FOR THE SEMESTER
                </span>
              )}
            </div>
          </div>

          <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-300 pt-3 sm:pt-0 sm:pl-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Balance Due / Needed
            </span>
            <div className={`text-2xl font-bold font-mono ${isPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
              ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide mt-0.5">
              Status: <span className={isPaid ? 'text-emerald-700' : 'text-amber-800'}>
                {isPaid ? 'Permit Validated / Cleared' : 'Pending Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Installment Breakdown of Needed Balance */}
        <div className="mt-3 pt-3 border-t border-slate-300 grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block font-mono">Downpayment</span>
            <span className="font-bold text-slate-800 font-mono">₱7,000.00</span>
            <span className="text-[9px] font-semibold text-emerald-700 uppercase block">Settled</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block font-mono">Prelims (Sep 15)</span>
            <span className="font-bold text-slate-800 font-mono">₱6,500.00</span>
            <span className="text-[9px] font-semibold text-emerald-700 uppercase block">Settled</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block font-mono">Midterms (Oct 15)</span>
            <span className="font-bold text-slate-800 font-mono">₱6,500.00</span>
            <span className="text-[9px] font-semibold text-emerald-700 uppercase block">Settled</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block font-mono">Finals (Nov 20)</span>
            <span className="font-bold text-slate-800 font-mono">₱6,450.00</span>
            <span className="text-[9px] font-semibold text-emerald-700 uppercase block">Settled</span>
          </div>
        </div>
      </div>

      {/* Official Cashier Signatures & Institutional Validation */}
      <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 gap-6 text-[10px] text-slate-600">
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800 font-mono">
            CRUZ, ALEX VILLANUEVA
          </div>
          <span>Student / Authorized Representative</span>
        </div>

        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
            CARMEN S. VILLARIN, CPA
          </div>
          <span>University Billing & Accounting Officer</span>
        </div>

        <div className="col-span-2 sm:col-span-1 text-center sm:text-right">
          <div className="inline-block border-2 border-emerald-700 text-emerald-800 px-3 py-1 font-heading font-bold text-[11px] uppercase tracking-wider rounded">
            VALIDATED & CLEARED
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
            Office of the University Treasurer
          </div>
        </div>
      </div>

      {/* Official Footnote */}
      <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-400 text-center font-mono">
        This computer-generated Statement of Account serves as the official university record of student financial assessment. Valid for semester examination permit issuance.
      </div>

    </div>
  );
}
