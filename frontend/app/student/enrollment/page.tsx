'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Enrollment, Subject, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth';
import { Printer, Search, ArrowRight } from 'lucide-react';

export default function StudentEnrollmentPage() {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        const [enrollRes, semRes] = await Promise.all([
          api.get<Enrollment>('/student/enrollment'),
          api.get<Semester[]>('/semesters')
        ]);
        
        const enrollmentData = (enrollRes as any).data || enrollRes;
        const semesterData = (semRes as any).data || semRes;
        
        setEnrollment(enrollmentData);
        setSemesters(semesterData);
        
        const active = semesterData.find((s: Semester) => s.is_current) || semesterData[0];
        setCurrentSemester(active);

        if (!enrollmentData || enrollmentData.status !== 'approved') {
          const subjRes = await api.get<Subject[]>('/subjects');
          const subjs = (subjRes as any).data || subjRes;
          setAvailableSubjects(subjs);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load enrollment status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollmentData();
  }, []);

  const handleToggleSubject = (subjectId: number) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleEnrollSubmit = async () => {
    if (selectedSubjectIds.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/student/enrollment', {
        semester_id: currentSemester?.id,
        subject_ids: selectedSubjectIds
      });
      const updated = await api.get<Enrollment>('/student/enrollment');
      setEnrollment((updated as any).data || updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading enrollment..." />;

  const isApproved = enrollment?.status === 'approved' || enrollment?.status === 'enrolled' || !!enrollment;

  const totalSelectedUnits = availableSubjects
    .filter(s => selectedSubjectIds.includes(s.id))
    .reduce((sum, s) => sum + (s.units || 3), 0);

  return (
    <div className="space-y-4">
      
      <PageHeader 
        title="Enrollment" 
        subtitle="Course enrollment and assessment."
        className="no-print"
        actions={
          isApproved ? [{
            label: "Print",
            onClick: () => window.print(),
            variant: "default" as const,
            icon: Printer
          }] : undefined
        }
      />

      {isApproved ? (
        /* Enrollment Assessment Form */
        <div className="space-y-4">
          {/* Student Info */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 text-[11px] block">Student ID</span>
                <span className="font-mono font-medium text-gray-900">2026-00001</span>
              </div>
              <div>
                <span className="text-gray-500 text-[11px] block">Name</span>
                <span className="font-medium text-gray-900">{user?.name || 'Roldan Jr. Delarmente'}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[11px] block">Program</span>
                <span className="text-gray-800">BS Information Technology</span>
              </div>
              <div>
                <span className="text-gray-500 text-[11px] block">Status</span>
                <StatusBadge status="Enrolled" />
              </div>
            </div>
          </div>

          {/* Enrolled Subjects Table */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                    <th className="px-3 py-2">Course Code</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-center">Units</th>
                    <th className="px-3 py-2">Section</th>
                    <th className="px-3 py-2">Schedule</th>
                    <th className="px-3 py-2">Room</th>
                    <th className="px-3 py-2">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollment?.subjects && enrollment.subjects.length > 0 ? (
                    enrollment.subjects.map((es) => (
                      <tr key={es.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">{es.subject?.code}</td>
                        <td className="px-3 py-2 text-gray-900">{es.subject?.name}</td>
                        <td className="px-3 py-2 text-center text-gray-700 tabular-nums">{(es.subject?.units || 3).toFixed(1)}</td>
                        <td className="px-3 py-2 text-gray-600 text-[11px]">{es.section?.name || 'BSIT 3-A'}</td>
                        <td className="px-3 py-2 text-gray-700 text-[11px]">{es.schedule ? `${es.schedule.day_of_week} ${es.schedule.start_time}–${es.schedule.end_time}` : 'TBA'}</td>
                        <td className="px-3 py-2 text-gray-600">{es.schedule?.room?.name || 'TBA'}</td>
                        <td className="px-3 py-2 text-gray-600 text-[11px]">{es.schedule?.teacher?.user?.name || 'TBA'}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      {[
                        { code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1', units: '3.0', section: 'BSIT 3-A', sched: 'Mon & Wed 10:30–12:00', room: 'H 204', inst: 'Sir Vincent John Cababan' },
                        { code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: '3.0', section: 'BSIT 3-A', sched: 'Tue, Thu, Sat 06:30–07:30 PM', room: 'K 104', inst: 'Ms. Lindy Enaldo' },
                        { code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: '3.0', section: 'BSIT 3-A', sched: 'Tue, Thu, Sat 05:30–06:30 PM', room: 'H 301', inst: 'Ms. Krystel Hurboda' },
                        { code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: '2.0', section: 'BSIT 3-A', sched: 'Fri & Sat 03:00–04:00 PM', room: 'OL 111', inst: 'Ms. En Catarungan' },
                        { code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: '1.0', section: 'BSIT 3-A', sched: 'Fri & Sat 01:30–03:00 PM', room: 'CL 1', inst: 'Ms. En Catarungan' },
                        { code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: '2.0', section: 'BSIT 3-A', sched: 'Mon & Wed 08:30–09:30 AM', room: 'OL 107', inst: 'Sir Yestin Prado' },
                        { code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: '1.0', section: 'BSIT 3-A', sched: 'Fri & Sat 09:00–10:30 AM', room: 'CL 1', inst: 'Sir Yestin Prado' },
                        { code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: '2.0', section: 'BSIT 3-A', sched: 'Mon & Wed 09:30–10:30 AM', room: 'OL 108', inst: 'Sir Jay-ar Base' },
                        { code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: '1.0', section: 'BSIT 3-A', sched: 'Fri & Sat 07:30–09:00 AM', room: 'CL 1', inst: 'Sir Jay-ar Base' },
                        { code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: '2.0', section: 'BSIT 3-A', sched: 'Mon & Wed 10:30–11:30 AM', room: 'OL 109', inst: 'Sir Arnel L. Villanueva' },
                        { code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: '1.0', section: 'BSIT 3-A', sched: 'Tue & Thu 03:00–04:30 PM', room: 'CL 3', inst: 'Sir Arnel L. Villanueva' },
                        { code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: '2.0', section: 'BSIT 3-A', sched: 'Mon & Wed 07:30–08:30 AM', room: 'OL 110', inst: 'Sir Charles Bacotot' },
                        { code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: '1.0', section: 'BSIT 3-A', sched: 'Fri & Sat 10:30–12:00 PM', room: 'CL 1', inst: 'Sir Charles Bacotot' },
                        { code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: '3.0', section: 'BSIT 3-A', sched: 'Tue & Thu 07:30–09:00 PM', room: 'A 202', inst: 'Sir Arjay Alangcas' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">{row.code}</td>
                          <td className="px-3 py-2 text-gray-900">{row.name}</td>
                          <td className="px-3 py-2 text-center text-gray-700 tabular-nums">{row.units}</td>
                          <td className="px-3 py-2 text-gray-600 text-[11px]">{row.section}</td>
                          <td className="px-3 py-2 text-gray-700 text-[11px]">{row.sched}</td>
                          <td className="px-3 py-2 text-gray-600">{row.room}</td>
                          <td className="px-3 py-2 text-gray-600 text-[11px]">{row.inst}</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-900">
                    <td colSpan={2} className="px-3 py-2 text-right text-xs">Total Units:</td>
                    <td className="px-3 py-2 text-center text-xs font-bold tabular-nums">27.0</td>
                    <td colSpan={4} className="px-3 py-2 text-xs text-gray-500">14 subjects</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Subject Selection Interface */
        <div className="space-y-4">
          <div className="filter-bar">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Search:</label>
              <input
                type="text"
                placeholder="Search subject code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control py-1.5 px-2 text-xs w-auto min-w-[200px]"
              />
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500">Selected: <strong className="text-gray-900">{totalSelectedUnits} / 24 units</strong></span>
              <button
                onClick={handleEnrollSubmit}
                disabled={submitting || selectedSubjectIds.length === 0}
                className="btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Enrollment'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                    <th className="w-10 px-3 py-2 text-center">Select</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-center">Units</th>
                    <th className="px-3 py-2">Year Level</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSubjects
                    .filter(s => s.code.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(subj => {
                      const isSelected = selectedSubjectIds.includes(subj.id);
                      return (
                        <tr key={subj.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSubject(subj.id)}
                              className="rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]/30 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">{subj.code}</td>
                          <td className="px-3 py-2 text-gray-900">{subj.name}</td>
                          <td className="px-3 py-2 text-center text-gray-700 tabular-nums">{(subj.units || 3).toFixed(1)}</td>
                          <td className="px-3 py-2 text-gray-600">Year {subj.year_level || 3}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
