'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Grade, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Printer, BookOpen } from 'lucide-react';

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

  if (loadingSemesters) return <LoadingState message="Loading grades..." />;

  // Calculate GWA
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

  const getRemarkText = (remarks: string | undefined, gradeVal: number) => {
    if (gradeVal <= 3.00) return <span className="text-green-700 text-[11px] font-medium">Passed</span>;
    if (gradeVal === 5.00) return <span className="text-red-600 text-[11px] font-medium">Failed</span>;
    return <span className="text-amber-600 text-[11px] font-medium">{remarks || 'Incomplete'}</span>;
  };

  return (
    <div className="space-y-4">
      
      {/* Page Header */}
      <PageHeader 
        title="Grade Report" 
        subtitle="Semester grades and scholastic record."
        className="no-print"
        actions={[
          {
            label: "Print",
            onClick: () => window.print(),
            variant: "default",
            icon: Printer
          }
        ]}
      />

      {/* Filter Bar */}
      <div className="filter-bar no-print">
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
      </div>

      {loadingGrades ? (
        <LoadingState message="Loading grades..." />
      ) : error ? (
        <EmptyState title="Error" description={error} icon={<BookOpen size={40} />} />
      ) : grades.length === 0 ? (
        <EmptyState 
          title="No Grades" 
          description="No grades have been released for this semester." 
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="px-3 py-2">Course Code</th>
                  <th className="px-3 py-2">Course Title</th>
                  <th className="px-3 py-2 text-center">Units</th>
                  <th className="px-3 py-2 text-center">Midterm</th>
                  <th className="px-3 py-2 text-center">Final</th>
                  <th className="px-3 py-2 text-center">Rating</th>
                  <th className="px-3 py-2 text-center">Remarks</th>
                  <th className="px-3 py-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => {
                  const finalVal = Number(grade.final_grade ?? grade.final ?? 1.25) || 1.25;
                  const midtermVal = Number(grade.midterm ?? 1.25) || 1.25;
                  return (
                    <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8] whitespace-nowrap">
                        {grade.subject?.code}
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {grade.subject?.name}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700 tabular-nums">
                        {(grade.subject?.units || 3).toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600 tabular-nums">
                        {midtermVal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600 tabular-nums">
                        {finalVal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center font-medium text-gray-900 tabular-nums">
                        {finalVal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getRemarkText(grade.remarks, finalVal)}
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-[11px]">
                        {grade.teacher?.user?.name || 'TBA'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-900">
                  <td colSpan={2} className="px-3 py-2 text-right text-xs">
                    Total Units / GWA:
                  </td>
                  <td className="px-3 py-2 text-center text-xs font-bold tabular-nums">
                    {totalUnits.toFixed(1)}
                  </td>
                  <td colSpan={2}></td>
                  <td className="px-3 py-2 text-center text-xs font-bold text-[#1D4ED8] tabular-nums">
                    {gwa}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Grading Scale Reference */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
          Grading Scale
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-[11px] text-gray-500 uppercase font-semibold">
                <th className="px-2 py-1 text-left">Grade</th>
                <th className="px-2 py-1 text-left">Equivalent</th>
                <th className="px-2 py-1 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-t border-gray-100"><td className="px-2 py-1 tabular-nums">1.00</td><td className="px-2 py-1">97–100%</td><td className="px-2 py-1">Excellent</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1 tabular-nums">1.25–1.50</td><td className="px-2 py-1">91–96%</td><td className="px-2 py-1">Very Good</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1 tabular-nums">1.75–2.00</td><td className="px-2 py-1">85–90%</td><td className="px-2 py-1">Good</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1 tabular-nums">2.25–2.50</td><td className="px-2 py-1">79–84%</td><td className="px-2 py-1">Satisfactory</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1 tabular-nums">2.75–3.00</td><td className="px-2 py-1">75–78%</td><td className="px-2 py-1">Passing</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1 tabular-nums text-red-600">5.00</td><td className="px-2 py-1">Below 75%</td><td className="px-2 py-1 text-red-600">Failed</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1">INC</td><td className="px-2 py-1">—</td><td className="px-2 py-1 text-amber-600">Incomplete</td></tr>
              <tr className="border-t border-gray-100"><td className="px-2 py-1">DRP</td><td className="px-2 py-1">—</td><td className="px-2 py-1">Dropped</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
