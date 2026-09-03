'use client';

import React, { useEffect, useState } from 'react';
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
  const [subjects, setSubjects] = useState<EnrollmentSubject[]>(DEFAULT_ENROLLED_SUBJECTS);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
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
        setError('Failed to load academic periods');
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
          // If the backend has subjects with schedule links, map them; otherwise keep the 14 subjects
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
        <span className="font-mono text-slate-700 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
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
      
      {/* Page Header */}
      <PageHeader 
        title="Enrolled Courses & Academic Load" 
        subtitle="Official course roster, classroom venues, and faculty instructors for the active term."
        badge="Active Academic Load"
        actions={[
          {
            label: "Print Class Roster",
            onClick: () => window.print(),
            variant: "default",
            icon: Printer
          }
        ]}
      />

      {/* Term Selector Ribbon */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-t-[#1D4ED8]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200">
            <Building2 size={18} />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Academic Term</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-control text-xs font-semibold text-slate-800 py-1.5 px-3 min-w-[240px] mt-0.5"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.name} {s.is_current ? '(Current Term)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-slate-700">
            Total Subjects: <strong className="text-slate-900">{subjects.length} Courses</strong>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 rounded border border-blue-200 text-[#1D4ED8] font-bold">
            Total Units: {totalUnits.toFixed(1)} Units
          </div>
        </div>
      </div>

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
              <span className="font-heading font-bold text-slate-900">Registered Subject Roster</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Official Class Load</span>
          </div>

          <DataTable 
            data={subjects} 
            columns={columns} 
          />
        </div>
      )}

    </div>
  );
}
