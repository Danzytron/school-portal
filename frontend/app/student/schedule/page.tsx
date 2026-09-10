'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Schedule, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Printer, BookOpen } from 'lucide-react';

const DEFAULT_STUDENT_SCHEDULES: any[] = [
  { id: 1, day_of_week: 'Monday', start_time: '07:30:00', end_time: '08:30:00', subject: { id: 12, code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: 2 }, room: { id: 10, name: 'OL 110' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 2, day_of_week: 'Wednesday', start_time: '07:30:00', end_time: '08:30:00', subject: { id: 12, code: 'IT SIA31', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LECTURE)', units: 2 }, room: { id: 10, name: 'OL 110' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 3, day_of_week: 'Monday', start_time: '08:30:00', end_time: '09:30:00', subject: { id: 6, code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: 2 }, room: { id: 6, name: 'OL 107' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 4, day_of_week: 'Wednesday', start_time: '08:30:00', end_time: '09:30:00', subject: { id: 6, code: 'IT EVD31', name: 'EVENT DRIVEN PROGRAMMING (LECTURE)', units: 2 }, room: { id: 6, name: 'OL 107' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 5, day_of_week: 'Monday', start_time: '09:30:00', end_time: '10:30:00', subject: { id: 8, code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: 2 }, room: { id: 7, name: 'OL 108' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 6, day_of_week: 'Wednesday', start_time: '09:30:00', end_time: '10:30:00', subject: { id: 8, code: 'IT IAS31', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LECTURE)', units: 2 }, room: { id: 7, name: 'OL 108' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 7, day_of_week: 'Monday', start_time: '10:30:00', end_time: '11:30:00', subject: { id: 10, code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: 2 }, room: { id: 8, name: 'OL 109' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 8, day_of_week: 'Wednesday', start_time: '10:30:00', end_time: '11:30:00', subject: { id: 10, code: 'IT NET31', name: 'NETWORKING 1 (LECTURE)', units: 2 }, room: { id: 8, name: 'OL 109' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 9, day_of_week: 'Monday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 1, code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1', units: 3 }, room: { id: 1, name: 'H 204' }, teacher: { id: 1, user: { name: 'Sir Vincent John Cababan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 10, day_of_week: 'Wednesday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 1, code: 'FREE ELEC 1', name: 'FREE ELECTIVE 1', units: 3 }, room: { id: 1, name: 'H 204' }, teacher: { id: 1, user: { name: 'Sir Vincent John Cababan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 11, day_of_week: 'Tuesday', start_time: '15:00:00', end_time: '16:30:00', subject: { id: 11, code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: 1 }, room: { id: 9, name: 'CL 3' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 12, day_of_week: 'Thursday', start_time: '15:00:00', end_time: '16:30:00', subject: { id: 11, code: 'IT NET31 LAB', name: 'NETWORKING 1 (LABORATORY)', units: 1 }, room: { id: 9, name: 'CL 3' }, teacher: { id: 7, user: { name: 'Sir Arnel L. Villanueva' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 13, day_of_week: 'Tuesday', start_time: '17:30:00', end_time: '18:30:00', subject: { id: 3, code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3 }, room: { id: 3, name: 'H 301' }, teacher: { id: 3, user: { name: 'Ms. Krystel Hurboda' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 14, day_of_week: 'Thursday', start_time: '17:30:00', end_time: '18:30:00', subject: { id: 3, code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3 }, room: { id: 3, name: 'H 301' }, teacher: { id: 3, user: { name: 'Ms. Krystel Hurboda' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 15, day_of_week: 'Saturday', start_time: '17:30:00', end_time: '18:30:00', subject: { id: 3, code: 'GE ELEC 6', name: 'PHILIPPINE POPULAR CULTURE', units: 3 }, room: { id: 3, name: 'H 301' }, teacher: { id: 3, user: { name: 'Ms. Krystel Hurboda' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 16, day_of_week: 'Tuesday', start_time: '18:30:00', end_time: '19:30:00', subject: { id: 2, code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3 }, room: { id: 2, name: 'K 104' }, teacher: { id: 2, user: { name: 'Ms. Lindy Enaldo' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 17, day_of_week: 'Thursday', start_time: '18:30:00', end_time: '19:30:00', subject: { id: 2, code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3 }, room: { id: 2, name: 'K 104' }, teacher: { id: 2, user: { name: 'Ms. Lindy Enaldo' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 18, day_of_week: 'Saturday', start_time: '18:30:00', end_time: '19:30:00', subject: { id: 2, code: 'GE ELEC 5', name: 'ANG PANITIKAN NG PILIPINAS', units: 3 }, room: { id: 2, name: 'K 104' }, teacher: { id: 2, user: { name: 'Ms. Lindy Enaldo' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 19, day_of_week: 'Tuesday', start_time: '19:30:00', end_time: '21:00:00', subject: { id: 14, code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: 3 }, room: { id: 11, name: 'A 202' }, teacher: { id: 9, user: { name: 'Sir Arjay Alangcas' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 20, day_of_week: 'Thursday', start_time: '19:30:00', end_time: '21:00:00', subject: { id: 14, code: 'IT SP131', name: 'SOCIAL AND PROFESSIONAL ISSUES 1', units: 3 }, room: { id: 11, name: 'A 202' }, teacher: { id: 9, user: { name: 'Sir Arjay Alangcas' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 21, day_of_week: 'Friday', start_time: '07:30:00', end_time: '09:00:00', subject: { id: 9, code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 22, day_of_week: 'Saturday', start_time: '07:30:00', end_time: '09:00:00', subject: { id: 9, code: 'IT IAS31 LAB', name: 'INFORMATION ASSURANCE AND SECURITY 1 (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 6, user: { name: 'Sir Jay-ar Base' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 23, day_of_week: 'Friday', start_time: '09:00:00', end_time: '10:30:00', subject: { id: 7, code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 24, day_of_week: 'Saturday', start_time: '09:00:00', end_time: '10:30:00', subject: { id: 7, code: 'IT EVD31 LAB', name: 'EVENT DRIVEN PROGRAMMING (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 5, user: { name: 'Sir Yestin Prado' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 25, day_of_week: 'Friday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 13, code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 26, day_of_week: 'Saturday', start_time: '10:30:00', end_time: '12:00:00', subject: { id: 13, code: 'IT SIA31 LAB', name: 'SYSTEM INTEGRATION AND ARCHITECTURE 2 (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 8, user: { name: 'Sir Charles Bacotot' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 27, day_of_week: 'Friday', start_time: '13:30:00', end_time: '15:00:00', subject: { id: 5, code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 28, day_of_week: 'Saturday', start_time: '13:30:00', end_time: '15:00:00', subject: { id: 5, code: 'IT ELEC 1 LAB', name: 'ELECTIVE 1 (LABORATORY)', units: 1 }, room: { id: 5, name: 'CL 1' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 29, day_of_week: 'Friday', start_time: '15:00:00', end_time: '16:00:00', subject: { id: 4, code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: 2 }, room: { id: 4, name: 'OL 111' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
  { id: 30, day_of_week: 'Saturday', start_time: '15:00:00', end_time: '16:00:00', subject: { id: 4, code: 'IT ELEC 1', name: 'ELECTIVE 1 (LECTURE)', units: 2 }, room: { id: 4, name: 'OL 111' }, teacher: { id: 4, user: { name: 'Ms. En Catarungan' } }, section: { id: 1, name: 'BSIT 3-A' } },
];

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>(DEFAULT_STUDENT_SCHEDULES);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const TIME_SLOTS = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM'
  ];

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
    
    const fetchSchedule = async () => {
      setLoadingSchedule(true);
      setError('');
      try {
        const response = await api.get<Schedule[]>(`/student/schedule?semester_id=${selectedSemester}`);
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setSchedules(data);
        } else {
          setSchedules(DEFAULT_STUDENT_SCHEDULES);
        }
      } catch (err: any) {
        setSchedules(DEFAULT_STUDENT_SCHEDULES);
      } finally {
        setLoadingSchedule(false);
      }
    };
    
    fetchSchedule();
  }, [selectedSemester]);

  if (loadingSemesters) return <LoadingState message="Loading schedule..." />;

  const getSchedulesForDayAndTime = (day: string, timeSlot: string) => {
    if (!Array.isArray(schedules)) return [];
    return schedules.filter(s => {
      if (!s.day_of_week) return false;
      if (s.day_of_week.toLowerCase() !== day.toLowerCase()) return false;
      const start = s.start_time?.substring(0, 5);
      const slotHour = timeSlot.includes('PM') && !timeSlot.startsWith('12') 
        ? parseInt(timeSlot.substring(0, 2)) + 12 
        : parseInt(timeSlot.substring(0, 2));
      const schedHour = parseInt(start?.substring(0, 2) || '0');
      return schedHour === slotHour;
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const formatScheduleTime = (s: any) => `${formatTime(s.start_time)} – ${formatTime(s.end_time)}`;

  return (
    <div className="space-y-4">
      
      <PageHeader 
        title="Class Schedule" 
        subtitle="Weekly class timetable."
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
        <div className="flex items-center gap-1 sm:ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 text-xs rounded cursor-pointer ${viewMode === 'list' ? 'bg-[#1D4ED8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 text-xs rounded cursor-pointer ${viewMode === 'grid' ? 'bg-[#1D4ED8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Grid
          </button>
        </div>
      </div>

      {loadingSchedule ? (
        <LoadingState message="Loading schedule..." />
      ) : error ? (
        <EmptyState title="Error" description={error} icon={<BookOpen size={40} />} />
      ) : schedules.length === 0 ? (
        <EmptyState 
          title="No Schedule" 
          description="No classes found for this semester." 
        />
      ) : viewMode === 'list' ? (
        /* List View — simple table */
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Course Code</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Room</th>
                  <th className="px-3 py-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700 capitalize">{s.day_of_week}</td>
                    <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8]">{s.subject?.code}</td>
                    <td className="px-3 py-2 text-gray-900">{s.subject?.name}</td>
                    <td className="px-3 py-2 text-gray-700 tabular-nums whitespace-nowrap">{formatScheduleTime(s)}</td>
                    <td className="px-3 py-2 text-gray-700">{s.room?.name || 'TBA'}</td>
                    <td className="px-3 py-2 text-gray-600 text-[11px]">{s.teacher?.user?.name || 'TBA'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View — timetable matrix */
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="w-20 px-2 py-2 text-center border-r border-gray-200">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-2 py-2 text-center border-r border-gray-200 last:border-r-0">
                      {day.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="border-b border-gray-100">
                    <td className="px-2 py-1.5 text-center text-[11px] text-gray-500 bg-gray-50/50 border-r border-gray-200 whitespace-nowrap tabular-nums">
                      {slot}
                    </td>
                    {DAYS.map(day => {
                      const matches = getSchedulesForDayAndTime(day, slot);
                      return (
                        <td key={day} className="px-1 py-1 border-r border-gray-200 last:border-r-0 align-top">
                          {matches.map(sched => (
                            <div key={sched.id} className="text-[10px] leading-tight mb-1 px-1 py-0.5">
                              <div className="font-medium text-[#1D4ED8]">{sched.subject?.code}</div>
                              <div className="text-gray-500">{sched.room?.name}</div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
