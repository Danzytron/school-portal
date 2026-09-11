'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { EnrollmentSubject, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookOpen, Calendar, Clock, Building2, User, Printer } from 'lucide-react';

const DEFAULT_ENROLLED_SUBJECTS: any[] = [
  {
    id: 1,
    subject: { code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Vincent John Cababan',
    schedule: {
      day_of_week: 'Monday and Wednesday',
      start_time: '10:30 AM',
      end_time: '12:00 PM',
      room: { name: 'H 204' },
      teacher: { user: { name: 'Sir Vincent John Cababan' } }
    }
  },
  {
    id: 2,
    subject: { code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. Lindy Enaldo',
    schedule: {
      day_of_week: 'Tuesday, Thursday, and Saturday',
      start_time: '06:30 PM',
      end_time: '07:30 PM',
      room: { name: 'K 104' },
      teacher: { user: { name: 'Ms. Lindy Enaldo' } }
    }
  },
  {
    id: 3,
    subject: { code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. Krystel Hurboda',
    schedule: {
      day_of_week: 'Tuesday, Thursday, and Saturday',
      start_time: '05:30 PM',
      end_time: '06:30 PM',
      room: { name: 'H 301' },
      teacher: { user: { name: 'Ms. Krystel Hurboda' } }
    }
  },
  {
    id: 4,
    subject: { code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. En Catarungan',
    schedule: {
      day_of_week: 'Friday and Saturday',
      start_time: '03:00 PM',
      end_time: '04:00 PM',
      room: { name: 'OL 111' },
      teacher: { user: { name: 'Ms. En Catarungan' } }
    }
  },
  {
    id: 5,
    subject: { code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. En Catarungan',
    schedule: {
      day_of_week: 'Friday and Saturday',
      start_time: '01:30 PM',
      end_time: '03:00 PM',
      room: { name: 'CL 1' },
      teacher: { user: { name: 'Ms. En Catarungan' } }
    }
  },
  {
    id: 6,
    subject: { code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Yestin Prado',
    schedule: {
      day_of_week: 'Monday and Wednesday',
      start_time: '08:30 AM',
      end_time: '09:30 AM',
      room: { name: 'OL 107' },
      teacher: { user: { name: 'Sir Yestin Prado' } }
    }
  },
  {
    id: 7,
    subject: { code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Yestin Prado',
    schedule: {
      day_of_week: 'Friday and Saturday',
      start_time: '09:00 AM',
      end_time: '10:30 AM',
      room: { name: 'CL 1' },
      teacher: { user: { name: 'Sir Yestin Prado' } }
    }
  },
  {
    id: 8,
    subject: { code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Jay-ar Base',
    schedule: {
      day_of_week: 'Monday and Wednesday',
      start_time: '09:30 AM',
      end_time: '10:30 AM',
      room: { name: 'OL 108' },
      teacher: { user: { name: 'Sir Jay-ar Base' } }
    }
  },
  {
    id: 9,
    subject: { code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Jay-ar Base',
    schedule: {
      day_of_week: 'Friday and Saturday',
      start_time: '07:30 AM',
      end_time: '09:00 AM',
      room: { name: 'CL 1' },
      teacher: { user: { name: 'Sir Jay-ar Base' } }
    }
  },
  {
    id: 10,
    subject: { code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Arnel L. Villanueva',
    schedule: {
      day_of_week: 'Monday and Wednesday',
      start_time: '10:30 AM',
      end_time: '11:30 AM',
      room: { name: 'OL 109' },
      teacher: { user: { name: 'Sir Arnel L. Villanueva' } }
    }
  },
  {
    id: 11,
    subject: { code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Arnel L. Villanueva',
    schedule: {
      day_of_week: 'Tuesday and Thursday',
      start_time: '03:00 PM',
      end_time: '04:30 PM',
      room: { name: 'CL 3' },
      teacher: { user: { name: 'Sir Arnel L. Villanueva' } }
    }
  },
  {
    id: 12,
    subject: { code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Charles Bacotot',
    schedule: {
      day_of_week: 'Monday and Wednesday',
      start_time: '07:30 AM',
      end_time: '08:30 AM',
      room: { name: 'OL 110' },
      teacher: { user: { name: 'Sir Charles Bacotot' } }
    }
  },
  {
    id: 13,
    subject: { code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Charles Bacotot',
    schedule: {
      day_of_week: 'Friday and Saturday',
      start_time: '10:30 AM',
      end_time: '12:00 PM',
      room: { name: 'CL 1' },
      teacher: { user: { name: 'Sir Charles Bacotot' } }
    }
  },
  {
    id: 14,
    subject: { code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Arjay Alangcas',
    schedule: {
      day_of_week: 'Tuesday and Thursday',
      start_time: '07:30 PM',
      end_time: '09:00 PM',
      room: { name: 'A 202' },
      teacher: { user: { name: 'Sir Arjay Alangcas' } }
    }
  }
];

export default function StudentSubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<EnrollmentSubject[]>(DEFAULT_ENROLLED_SUBJECTS);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState('');

  const studentName = user?.name || 'Roldan D. Enaldo';

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
    
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setError('');
      try {
        const response = await api.get<EnrollmentSubject[]>(`/student/subjects?semester_id=${selectedSemester}`);
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
        } else {
          setSubjects(DEFAULT_ENROLLED_SUBJECTS);
        }
      } catch (err: any) {
        setSubjects(DEFAULT_ENROLLED_SUBJECTS);
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, [selectedSemester]);

  if (loadingSemesters) return <LoadingState message="Loading academic course catalog..." />;

  const totalUnits = subjects.reduce((sum, s) => sum + (s.subject?.units || 3), 0);
  const selectedSemesterName = semesters.find(s => s.id.toString() === selectedSemester)?.name || '1st Semester A.Y. 2026–2027';

  const columns = [
    { 
      header: 'Course Code', 
      accessor: 'subject.code',
      render: (row: any) => (
        <span className="font-mono font-bold text-[#1D4ED8]">
          {row.subject?.code}
        </span>
      )
    },
    { 
      header: 'Descriptive Course Title', 
      accessor: 'subject.name',
      render: (row: any) => (
        <div className="font-medium text-slate-900">
          {row.subject?.name}
        </div>
      )
    },
    { 
      header: 'Units', 
      accessor: 'subject.units',
      align: 'center' as const,
      render: (row: any) => (
        <span className="font-mono font-bold text-slate-800">
          {(row.subject?.units || 3).toFixed(1)}
        </span>
      )
    },
    { 
      header: 'Section', 
      accessor: 'section.name',
      render: (row: any) => (
        <span className="font-mono text-slate-700 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.section?.name || 'BSIT 3-A'}
        </span>
      )
    },
    { 
      header: 'Schedule & Facility', 
      accessor: 'schedule',
      render: (row: any) => {
        if (!row.schedule) {
          return <span className="text-slate-400 font-mono text-[11px]">TBA</span>;
        }
        return (
          <div className="text-[11px]">
            <div className="font-mono text-slate-800 font-medium capitalize">
              {row.schedule.day_of_week} • {row.schedule.start_time}–{row.schedule.end_time}
            </div>
            <div className="text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 size={11} className="text-slate-400" />
              <span>Room {row.schedule.room?.name || 'OL 110'}</span>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Faculty Instructor', 
      accessor: 'instructor',
      render: (row: any) => (
        <div className="text-slate-700 text-xs">
          {row.instructor || row.schedule?.teacher?.user?.name || 'Prof. Maria Santos'}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      align: 'center' as const,
      render: () => <StatusBadge status="Enrolled" type="success" />
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. PRINT-ONLY OFFICIAL INSTITUTIONAL HEADER                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          Cebu Eastern College
        </h1>
        <p className="text-xs text-slate-600">Leon Kilat St., Cebu City, Philippines • (032) 256-2181</p>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1D4ED8] mt-1">
          Office of the University Registrar
        </p>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mt-2 border-t border-b border-slate-300 py-1 inline-block">
          Official Student Study Load & Course Roster
        </h2>

        {/* Student Dossier for Print */}
        <div className="grid grid-cols-2 text-left text-xs mt-4 pt-2 border-t border-slate-200">
          <div className="space-y-1">
            <div><span className="font-semibold text-slate-600">Student Name:</span> <span className="font-bold text-slate-900">{studentName}</span></div>
            <div><span className="font-semibold text-slate-600">Student Number:</span> <span className="font-mono font-bold text-slate-900">2026-00001</span></div>
            <div><span className="font-semibold text-slate-600">Degree Program:</span> <span className="text-slate-900">BS in Information Technology (BSIT)</span></div>
          </div>
          <div className="space-y-1 text-right">
            <div><span className="font-semibold text-slate-600">Academic Term:</span> <span className="font-bold text-slate-900">{selectedSemesterName}</span></div>
            <div><span className="font-semibold text-slate-600">Section:</span> <span className="text-slate-900">BSIT 3-A</span></div>
            <div><span className="font-semibold text-slate-600">Date Printed:</span> <span className="text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. ON-SCREEN PAGE HEADER & DOSSIER                                */}
      {/* ------------------------------------------------------------------ */}
      <PageHeader 
        title="Enrolled Courses & Academic Load" 
        subtitle="Official course roster, classroom venues, and faculty instructors for the active term."
        badge="Active Academic Load"
        className="no-print"
        actions={[
          {
            label: "Print Study Load Slip",
            onClick: () => window.print(),
            variant: "default",
            icon: Printer
          }
        ]}
      />

      {/* Screen Student Dossier Strip */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-4 shadow-2xs border-t-2 border-t-[#1D4ED8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-base">{studentName}</span>
              <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded font-semibold">
                SN: 2026-00001
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                Officially Enrolled
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Bachelor of Science in Information Technology</span>
              <span className="text-slate-300">•</span>
              <span>Year 3, Section BSIT 3-A</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono font-medium text-slate-700">{selectedSemesterName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-md text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Courses</span>
              <span className="font-mono font-bold text-sm text-slate-900">{subjects.length} Subjects</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Credit Units</span>
              <span className="font-mono font-bold text-sm text-[#1D4ED8]">{totalUnits.toFixed(1)} Units</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Load Status</span>
              <span className="text-xs font-semibold text-emerald-700">Regular Load</span>
            </div>
          </div>
        </div>
      </div>

      {/* Term Selector Ribbon */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Select Semester Term
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-control text-xs font-semibold text-slate-800 py-1.5 px-3 min-w-[260px]"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.name} {s.is_current ? '(Current Term)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-sans">
          <span>Advising Status: </span>
          <span className="font-semibold text-emerald-700">Registrar & Dean Approved</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SUBJECT ROSTER TABLE                                            */}
      {/* ------------------------------------------------------------------ */}
      {loadingSubjects ? (
        <LoadingState message="Fetching enrolled courses from academic records..." />
      ) : error && subjects.length === 0 ? (
        <EmptyState title="Error" description={error} icon={<BookOpen size={48} />} />
      ) : subjects.length === 0 ? (
        <EmptyState 
          title="No Enrolled Classes" 
          description="You do not have any registered subjects for this semester." 
        />
      ) : (
        <div className="panel">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#1D4ED8]" />
              <span className="font-semibold text-slate-900">Registered Subject Roster</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Official Study Load</span>
          </div>

          <DataTable 
            data={subjects} 
            columns={columns} 
          />

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              <span>Registered load for: </span>
              <strong className="text-slate-900">{selectedSemesterName}</strong>
            </div>
            <div className="flex items-center gap-4 font-mono font-semibold">
              <span>Total Subjects: {subjects.length}</span>
              <span>Total Units: {totalUnits.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. SIGNATURE CERTIFICATION BLOCK (PRINT ONLY)                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden print:grid grid-cols-2 gap-12 mt-12 pt-8 text-xs text-center font-sans">
        <div>
          <div className="w-48 mx-auto border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
            MARIA ELENA S. REYES, Ed.D.
          </div>
          <span className="text-[11px] text-slate-600 block">Dean, College of Computer Studies</span>
        </div>
        <div>
          <div className="w-48 mx-auto border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
            ATTY. ROBERTO V. TAN, CESO
          </div>
          <span className="text-[11px] text-slate-600 block">University Registrar</span>
        </div>
      </div>

    </div>
  );
}
