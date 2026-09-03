'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Enrollment, Subject, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Calendar,
  Search,
  Plus,
  Trash2
} from 'lucide-react';

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

        // Fetch subjects for enrolling if not approved
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
      alert("Please select at least one course for advisement.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/student/enrollment', {
        semester_id: currentSemester?.id,
        subject_ids: selectedSubjectIds
      });
      // Refresh status
      const updated = await api.get<Enrollment>('/student/enrollment');
      setEnrollment((updated as any).data || updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Connecting to Academic Advising Portal..." />;

  const isApproved = enrollment?.status === 'approved' || enrollment?.status === 'enrolled' || !!enrollment;

  const totalSelectedUnits = availableSubjects
    .filter(s => selectedSubjectIds.includes(s.id))
    .reduce((sum, s) => sum + (s.units || 3), 0);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader 
        title="Enrollment, Advising & Assessment" 
        subtitle="Official course advisement, unit validation, and Enrollment Assessment Form (EAF)."
        badge="Office of the University Registrar"
        className="no-print"
        actions={
          isApproved ? [
            {
              label: "Print Official EAF Slip",
              onClick: () => window.print(),
              variant: "default",
              icon: Printer
            }
          ] : undefined
        }
      />

      {/* 4-Step Academic Advising Workflow Tracker */}
      <div className="no-print bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded bg-blue-50/70 border border-blue-200">
            <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-[10px]">1</div>
            <div>
              <span className="font-semibold text-slate-900 block">Curriculum Advising</span>
              <span className="text-[10px] text-blue-700 font-medium">Courses Selected</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded bg-blue-50/70 border border-blue-200">
            <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-[10px]">2</div>
            <div>
              <span className="font-semibold text-slate-900 block">Dean Evaluation</span>
              <span className="text-[10px] text-blue-700 font-medium">Load Evaluated</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded bg-blue-50/70 border border-blue-200">
            <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-[10px]">3</div>
            <div>
              <span className="font-semibold text-slate-900 block">Treasury Assessment</span>
              <span className="text-[10px] text-blue-700 font-medium">Fees Assessed</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded bg-emerald-50 border border-emerald-200">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">4</div>
            <div>
              <span className="font-semibold text-slate-900 block">Official Validation</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Officially Enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {isApproved ? (
        /* OFFICIAL ENROLLMENT ASSESSMENT FORM (EAF) */
        <div className="bg-white border border-slate-200/90 rounded-lg shadow-sm overflow-hidden font-sans border-t-2 border-t-[#1D4ED8]">
          {/* Official EAF Document Header */}
          <div className="p-4 sm:p-8 border-b border-slate-200 bg-slate-50/40">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                <img 
                  src="/cec-logo.jpg" 
                  alt="Cebu Eastern College" 
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full bg-white p-1 border border-slate-300 shadow-2xs shrink-0" 
                />
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight m-0">
                    CEBU EASTERN COLLEGE
                  </h2>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Office of the University Registrar & Admissions
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Leon Kilat St., Cebu City, Philippines 6000
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto border-slate-200">
                <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                  FORM EAF-2026-V1
                </span>
                <div className="text-xs font-bold text-slate-800 uppercase mt-1">
                  Enrollment Assessment Form
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  1st Sem A.Y. 2026–2027
                </div>
              </div>
            </div>

            {/* Student Identification Strip */}
            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Student ID Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">2026-00001</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Student Full Name</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user?.name || 'Roldan Jr. Delarmente'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Degree Program</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">BS Information Technology</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Curricular Standing</span>
                <span className="font-semibold text-emerald-700 text-xs mt-0.5 block">Year 3 • Regular</span>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Table */}
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Course Description</th>
                    <th className="px-4 py-3 text-center">Units</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Schedule Days & Time</th>
                    <th className="px-4 py-3">Facility / Venue</th>
                    <th className="px-4 py-3">Faculty Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {enrollment?.subjects && enrollment.subjects.length > 0 ? (
                    enrollment.subjects.map((es) => (
                      <tr key={es.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">
                          {es.subject?.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {es.subject?.name}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">
                          {(es.subject?.units || 3).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                          {es.section?.name || 'BSIT 3-A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {es.schedule ? `${es.schedule.day_of_week} ${es.schedule.start_time}–${es.schedule.end_time}` : 'MW 07:30–08:30'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {es.schedule?.room?.name ? `Room ${es.schedule.room.name}` : 'OL 110'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">
                          {es.schedule?.teacher?.user?.name || 'Assigned Faculty'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">FREE ELEC 1</td>
                        <td className="px-4 py-3 font-medium text-slate-900">FREE ELECTIVE 1</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">3.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Mon and Wed 10:30–12:00 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room H 204</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Vincent John Cababan</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">GE ELEC 5</td>
                        <td className="px-4 py-3 font-medium text-slate-900">ANG PANITIKAN NG PILIPINAS</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">3.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Tue, Thu, Sat 06:30–07:30 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room K 104</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Ms. Lindy Enaldo</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">GE ELEC 6</td>
                        <td className="px-4 py-3 font-medium text-slate-900">PHILIPPINE POPULAR CULTURE</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">3.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Tue, Thu, Sat 05:30–06:30 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room H 301</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Ms. Krystel Hurboda</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT ELEC 1</td>
                        <td className="px-4 py-3 font-medium text-slate-900">ELECTIVE 1 (LECTURE)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">2.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Fri and Sat 03:00–04:00 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room OL 111</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Ms. En Catarungan</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT ELEC 1 LAB</td>
                        <td className="px-4 py-3 font-medium text-slate-900">ELECTIVE 1 (LABORATORY)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">1.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Fri and Sat 01:30–03:00 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room CL 1</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Ms. En Catarungan</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT EVD31</td>
                        <td className="px-4 py-3 font-medium text-slate-900">EVENT DRIVEN PROGRAMMING (LECTURE)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">2.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Mon and Wed 08:30–09:30 AM</td>
                        <td className="px-4 py-3 text-slate-600">Room OL 107</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Yestin Prado</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT EVD31 LAB</td>
                        <td className="px-4 py-3 font-medium text-slate-900">EVENT DRIVEN PROGRAMMING (LABORATORY)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">1.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Fri and Sat 09:00–10:30 AM</td>
                        <td className="px-4 py-3 text-slate-600">Room CL 1</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Yestin Prado</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT IAS31</td>
                        <td className="px-4 py-3 font-medium text-slate-900">INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">2.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Mon and Wed 09:30–10:30 AM</td>
                        <td className="px-4 py-3 text-slate-600">Room OL 108</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Jay-ar Base</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT IAS31 LAB</td>
                        <td className="px-4 py-3 font-medium text-slate-900">INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">1.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Fri and Sat 07:30–09:00 AM</td>
                        <td className="px-4 py-3 text-slate-600">Room CL 1</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Jay-ar Base</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT NET31</td>
                        <td className="px-4 py-3 font-medium text-slate-900">NETWORKING 1 (LECTURE)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">2.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Mon and Wed 10:30–11:30 AM</td>
                        <td className="px-4 py-3 text-slate-600">Room OL 109</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Arnel L. Villanueva</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT NET31 LAB</td>
                        <td className="px-4 py-3 font-medium text-slate-900">NETWORKING 1 (LABORATORY)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">1.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Tue and Thu 03:00–04:30 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room CL 3</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Arnel L. Villanueva</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT SIA31</td>
                        <td className="px-4 py-3 font-medium text-slate-900">SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">2.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Mon and Wed 07:30–08:30 AM</td>
                        <td className="px-4 py-3 text-slate-600">Room OL 110</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Charles Bacotot</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT SIA31 LAB</td>
                        <td className="px-4 py-3 font-medium text-slate-900">SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">1.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Fri and Sat 10:30–12:00 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room CL 1</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Charles Bacotot</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">IT SP131</td>
                        <td className="px-4 py-3 font-medium text-slate-900">SOCIAL AND PROFESSIONAL ISSUES 1</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700">3.0</td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">BSIT 3-A</td>
                        <td className="px-4 py-3 font-mono text-slate-700">Tue and Thu 07:30–09:00 PM</td>
                        <td className="px-4 py-3 text-slate-600">Room A 202</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">Sir Arjay Alangcas</td>
                      </tr>
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-900">
                    <td colSpan={2} className="px-4 py-3 text-right text-xs uppercase tracking-wider">
                      Total Validated Academic Load:
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[#1D4ED8] text-sm">
                      27.0 Units
                    </td>
                    <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                      14 Registered Lecture & Laboratory Subjects
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Assessment & Institutional Validation Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="space-y-1 text-center sm:text-left">
              <div>Certified by: <strong className="text-slate-800">Atty. Manuel C. Go, Registrar</strong></div>
              <div>System Timestamp: <span className="font-mono text-slate-600">Aug 20, 2026 09:14 AM PHT</span></div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200 uppercase">
                Official Registrar Document
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ADVISING & SUBJECT SELECTION INTERFACE */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-72 relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500">Selected Load:</span>
                <span className="font-mono font-bold text-[#1D4ED8] ml-1">{totalSelectedUnits}.0 / 24.0 Max Units</span>
              </div>
              <button
                onClick={handleEnrollSubmit}
                disabled={submitting || selectedSubjectIds.length === 0}
                className="btn-primary flex items-center gap-1.5"
              >
                <span>{submitting ? 'Submitting...' : 'Submit for Dean Advising'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <span className="font-heading font-bold text-slate-900">Available Curriculum Offerings</span>
              <span className="text-[11px] font-mono text-slate-500">{availableSubjects.length} Courses</span>
            </div>

            <div className="p-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                    <th className="w-12 px-4 py-3 text-center">Select</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Course Description</th>
                    <th className="px-4 py-3 text-center">Units</th>
                    <th className="px-4 py-3">Year Level</th>
                    <th className="px-4 py-3">Prerequisites</th>
                    <th className="px-4 py-3 text-center">Slots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {availableSubjects
                    .filter(s => s.code.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(subj => {
                      const isSelected = selectedSubjectIds.includes(subj.id);
                      return (
                        <tr key={subj.id} className={`hover:bg-blue-50/30 ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSubject(subj.id)}
                              className="rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]/30 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">
                            {subj.code}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {subj.name}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-700">
                            {(subj.units || 3).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            Year {subj.year_level || 3}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            None / Standing
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-emerald-700 font-semibold">
                            38 / 40 Open
                          </td>
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
