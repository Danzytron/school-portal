'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EnrollmentSubject, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Printer, BookOpen } from 'lucide-react';

const DEFAULT_ENROLLED_SUBJECTS: any[] = [
  {
    id: 1,
    subject: { code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Vincent John Cababan',
    schedule: { day_of_week: 'Monday and Wednesday', start_time: '10:30 AM', end_time: '12:00 PM', room: { name: 'H 204' }, teacher: { user: { name: 'Sir Vincent John Cababan' } } }
  },
  {
    id: 2,
    subject: { code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. Lindy Enaldo',
    schedule: { day_of_week: 'Tuesday, Thursday, and Saturday', start_time: '06:30 PM', end_time: '07:30 PM', room: { name: 'K 104' }, teacher: { user: { name: 'Ms. Lindy Enaldo' } } }
  },
  {
    id: 3,
    subject: { code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. Krystel Hurboda',
    schedule: { day_of_week: 'Tuesday, Thursday, and Saturday', start_time: '05:30 PM', end_time: '06:30 PM', room: { name: 'H 301' }, teacher: { user: { name: 'Ms. Krystel Hurboda' } } }
  },
  {
    id: 4,
    subject: { code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. En Catarungan',
    schedule: { day_of_week: 'Friday and Saturday', start_time: '03:00 PM', end_time: '04:00 PM', room: { name: 'OL 111' }, teacher: { user: { name: 'Ms. En Catarungan' } } }
  },
  {
    id: 5,
    subject: { code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Ms. En Catarungan',
    schedule: { day_of_week: 'Friday and Saturday', start_time: '01:30 PM', end_time: '03:00 PM', room: { name: 'CL 1' }, teacher: { user: { name: 'Ms. En Catarungan' } } }
  },
  {
    id: 6,
    subject: { code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Yestin Prado',
    schedule: { day_of_week: 'Monday and Wednesday', start_time: '08:30 AM', end_time: '09:30 AM', room: { name: 'OL 107' }, teacher: { user: { name: 'Sir Yestin Prado' } } }
  },
  {
    id: 7,
    subject: { code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Yestin Prado',
    schedule: { day_of_week: 'Friday and Saturday', start_time: '09:00 AM', end_time: '10:30 AM', room: { name: 'CL 1' }, teacher: { user: { name: 'Sir Yestin Prado' } } }
  },
  {
    id: 8,
    subject: { code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Jay-ar Base',
    schedule: { day_of_week: 'Monday and Wednesday', start_time: '09:30 AM', end_time: '10:30 AM', room: { name: 'OL 108' }, teacher: { user: { name: 'Sir Jay-ar Base' } } }
  },
  {
    id: 9,
    subject: { code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Jay-ar Base',
    schedule: { day_of_week: 'Friday and Saturday', start_time: '07:30 AM', end_time: '09:00 AM', room: { name: 'CL 1' }, teacher: { user: { name: 'Sir Jay-ar Base' } } }
  },
  {
    id: 10,
    subject: { code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Arnel L. Villanueva',
    schedule: { day_of_week: 'Monday and Wednesday', start_time: '10:30 AM', end_time: '11:30 AM', room: { name: 'OL 109' }, teacher: { user: { name: 'Sir Arnel L. Villanueva' } } }
  },
  {
    id: 11,
    subject: { code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Arnel L. Villanueva',
    schedule: { day_of_week: 'Tuesday and Thursday', start_time: '03:00 PM', end_time: '04:30 PM', room: { name: 'CL 3' }, teacher: { user: { name: 'Sir Arnel L. Villanueva' } } }
  },
  {
    id: 12,
    subject: { code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: 2 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Charles Bacotot',
    schedule: { day_of_week: 'Monday and Wednesday', start_time: '07:30 AM', end_time: '08:30 AM', room: { name: 'OL 110' }, teacher: { user: { name: 'Sir Charles Bacotot' } } }
  },
  {
    id: 13,
    subject: { code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: 1 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Charles Bacotot',
    schedule: { day_of_week: 'Friday and Saturday', start_time: '10:30 AM', end_time: '12:00 PM', room: { name: 'CL 1' }, teacher: { user: { name: 'Sir Charles Bacotot' } } }
  },
  {
    id: 14,
    subject: { code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: 3 },
    section: { name: 'BSIT 3-A' },
    instructor: 'Sir Arjay Alangcas',
    schedule: { day_of_week: 'Tuesday and Thursday', start_time: '07:30 PM', end_time: '09:00 PM', room: { name: 'A 202' }, teacher: { user: { name: 'Sir Arjay Alangcas' } } }
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

  if (loadingSemesters) return <LoadingState message="Loading subjects..." />;

  const totalUnits = subjects.reduce((sum, s) => sum + (s.subject?.units || 3), 0);

  return (
    <div className="space-y-4">
      
      <PageHeader 
        title="Enrolled Subjects" 
        subtitle="Course roster for the current semester."
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
      </div>

      {loadingSubjects ? (
        <LoadingState message="Loading subjects..." />
      ) : error && subjects.length === 0 ? (
        <EmptyState title="Error" description={error} icon={<BookOpen size={40} />} />
      ) : subjects.length === 0 ? (
        <EmptyState 
          title="No Subjects" 
          description="No enrolled subjects found for this semester." 
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="px-3 py-2">Course Code</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-center">Units</th>
                  <th className="px-3 py-2">Schedule</th>
                  <th className="px-3 py-2">Room</th>
                  <th className="px-3 py-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8] whitespace-nowrap">
                      {row.subject?.code}
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      {row.subject?.name}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 tabular-nums">
                      {(row.subject?.units || 3).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-[11px]">
                      {row.schedule ? (
                        <span>{row.schedule.day_of_week} • {row.schedule.start_time}–{row.schedule.end_time}</span>
                      ) : (
                        <span className="text-gray-400">TBA</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {row.schedule?.room?.name || 'TBA'}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-[11px]">
                      {(row as any).instructor || row.schedule?.teacher?.user?.name || 'TBA'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-900">
                  <td colSpan={2} className="px-3 py-2 text-right text-xs">Total Enrolled Units:</td>
                  <td className="px-3 py-2 text-center text-xs font-bold tabular-nums">{totalUnits.toFixed(1)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
