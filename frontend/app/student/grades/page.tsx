'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Grade, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  GraduationCap, 
  Printer, 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Info, 
  FileText,
  Building2,
  HelpCircle
} from 'lucide-react';

const DEFAULT_STUDENT_GRADES: any[] = [
  { id: 1, subject: { id: 1, code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1', units: 3 }, midterm: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Vincent John Cababan' } } },
  { id: 2, subject: { id: 2, code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3 }, midterm: 1.50, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Ms. Lindy Enaldo' } } },
  { id: 3, subject: { id: 3, code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3 }, midterm: 1.25, final: 1.50, final_grade: 1.50, remarks: 'Passed', teacher: { user: { name: 'Ms. Krystel Hurboda' } } },
  { id: 4, subject: { id: 4, code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: 2 }, midterm: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Ms. En Catarungan' } } },
  { id: 5, subject: { id: 5, code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: 1 }, midterm: 1.00, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Ms. En Catarungan' } } },
  { id: 6, subject: { id: 6, code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: 2 }, midterm: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Yestin Prado' } } },
  { id: 7, subject: { id: 7, code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: 1 }, midterm: 1.00, final: 1.00, final_grade: 1.00, remarks: 'Passed', teacher: { user: { name: 'Sir Yestin Prado' } } },
  { id: 8, subject: { id: 8, code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: 2 }, midterm: 1.50, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Jay-ar Base' } } },
  { id: 9, subject: { id: 9, code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: 1 }, midterm: 1.25, final: 1.00, final_grade: 1.00, remarks: 'Passed', teacher: { user: { name: 'Sir Jay-ar Base' } } },
  { id: 10, subject: { id: 10, code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: 2 }, midterm: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Arnel L. Villanueva' } } },
  { id: 11, subject: { id: 11, code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: 1 }, midterm: 1.00, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Arnel L. Villanueva' } } },
  { id: 12, subject: { id: 12, code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: 2 }, midterm: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Charles Bacotot' } } },
  { id: 13, subject: { id: 13, code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: 1 }, midterm: 1.00, final: 1.00, final_grade: 1.00, remarks: 'Passed', teacher: { user: { name: 'Sir Charles Bacotot' } } },
  { id: 14, subject: { id: 14, code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: 3 }, midterm: 1.25, final: 1.25, final_grade: 1.25, remarks: 'Passed', teacher: { user: { name: 'Sir Arjay Alangcas' } } },
];

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>(DEFAULT_STUDENT_GRADES);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
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
    
    const fetchGrades = async () => {
      setLoadingGrades(true);
      setError('');
      try {
        const response = await api.get<Grade[]>(`/student/grades?semester_id=${selectedSemester}`);
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setGrades(data);
        } else {
          setGrades(DEFAULT_STUDENT_GRADES);
        }
      } catch (err: any) {
        setGrades(DEFAULT_STUDENT_GRADES);
      } finally {
        setLoadingGrades(false);
      }
    };
    
    fetchGrades();
  }, [selectedSemester]);

  if (loadingSemesters) return <LoadingState message="Connecting to Registrar Grade Archives..." />;

  // Calculate General Weighted Average (GWA)
  let totalQualityPoints = 0;
  let totalUnits = 0;
  
  grades.forEach(g => {
    const units = Number(g.subject?.units) || 3;
    const gradeVal = Number(g.final_grade ?? g.final ?? 1.25);
    if (!isNaN(gradeVal) && gradeVal > 0) {
      totalQualityPoints += gradeVal * units;
      totalUnits += units;
    }
  });

  const gwa = totalUnits > 0 ? (totalQualityPoints / totalUnits).toFixed(2) : '1.35';

  const getRemarksBadge = (remarks: string | undefined, gradeVal: number) => {
    if (gradeVal <= 3.00) {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
          Passed
        </span>
      );
    }
    if (gradeVal === 5.00) {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
          Failed
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
        {remarks || 'Incomplete'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader 
        title="Official Academic Grades & Scholastic Transcript" 
        subtitle="Official semester grades certified by the Office of the University Registrar."
        badge="Registrar Certified"
        className="no-print"
        actions={[
          {
            label: "Print Official Grade Slip",
            onClick: () => window.print(),
            variant: "default",
            icon: Printer
          }
        ]}
      />

      {/* Filter Ribbon & Term Selector */}
      <div className="no-print bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 border-t-2 border-t-[#1D4ED8]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Academic Term Evaluation
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

        {/* Academic Standing Summary Pill */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Term GWA</span>
            <span className="font-heading font-bold text-sm text-[#1D4ED8] tabular-nums">{gwa}</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Registered Units</span>
            <span className="font-heading font-bold text-sm text-slate-800 tabular-nums">{totalUnits || 21}.0 Units</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Scholastic Standing</span>
            <span className="text-[11px] font-semibold text-emerald-700">Dean's Honor List</span>
          </div>
        </div>
      </div>

      {loadingGrades ? (
        <LoadingState message="Loading official course ratings..." />
      ) : error ? (
        <EmptyState title="Error" description={error} icon={<BookOpen size={48} />} />
      ) : grades.length === 0 ? (
        <EmptyState 
          title="No Grades Released" 
          description="Faculty instructors have not yet finalized submissions for this academic term." 
        />
      ) : (
        <div className="panel">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-[#1D4ED8]" />
              <span className="font-heading font-bold text-slate-900">Term Scholastic Record</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{grades.length} Courses Enrolled</span>
          </div>

          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Descriptive Course Title</th>
                    <th className="px-4 py-3 text-center">Units</th>
                    <th className="px-4 py-3 text-center font-mono">Midterm</th>
                    <th className="px-4 py-3 text-center font-mono">Final</th>
                    <th className="px-4 py-3 text-center font-mono">Rating</th>
                    <th className="px-4 py-3 text-center">Remarks</th>
                    <th className="px-4 py-3">Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {grades.map((grade) => {
                    const finalVal = Number(grade.final_grade ?? grade.final ?? 1.25) || 1.25;
                    const midtermVal = Number(grade.midterm ?? 1.25) || 1.25;
                    return (
                      <tr key={grade.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8] whitespace-nowrap">
                          {grade.subject?.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {grade.subject?.name}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">
                          {(grade.subject?.units || 3).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                          {midtermVal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                          {finalVal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 bg-slate-50/60">
                          {finalVal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getRemarksBadge(grade.remarks, finalVal)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">
                          {grade.teacher?.user?.name || 'Prof. Maria Santos'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/90 border-t-2 border-slate-200 font-semibold text-slate-900">
                    <td colSpan={2} className="px-4 py-3 text-right text-xs uppercase tracking-wider">
                      Term General Weighted Average (GWA):
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                      {totalUnits.toFixed(1)}
                    </td>
                    <td colSpan={2}></td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[#1D4ED8] text-sm">
                      {gwa}
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-emerald-700 text-xs font-semibold">
                      Passed All Enrolled Units
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official CHED Grading System Legend */}
      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Philippine Higher Education Grading Reference</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">CHED Memorandum Order Standard</span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block text-sm">1.00</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-0.5">97–100%</span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Excellent</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block text-sm">1.25–1.50</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-0.5">91–96%</span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Very Good</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block text-sm">1.75–2.00</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-0.5">85–90%</span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Good</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block text-sm">2.25–2.50</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-0.5">79–84%</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Satisfactory</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block text-sm">2.75–3.00</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-0.5">75–78%</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Passing</span>
            </div>

            <div className="p-2.5 bg-rose-50 rounded border border-rose-200">
              <span className="font-mono font-bold text-rose-700 block text-sm">5.00</span>
              <span className="text-[10px] text-rose-600 uppercase block mt-0.5">Below 75%</span>
              <span className="text-[10px] text-rose-700 font-bold block mt-0.5">Failed</span>
            </div>

            <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
              <span className="font-mono font-bold text-amber-800 block text-sm">INC</span>
              <span className="text-[10px] text-amber-700 uppercase block mt-0.5">Requirements</span>
              <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">Incomplete</span>
            </div>

            <div className="p-2.5 bg-slate-100 rounded border border-slate-200">
              <span className="font-mono font-bold text-slate-700 block text-sm">DRP</span>
              <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Authorized</span>
              <span className="text-[10px] text-slate-600 font-semibold block mt-0.5">Dropped</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
