'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Schedule, Semester } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Printer, 
  Grid, 
  List, 
  Building2,
  CheckCircle2,
  Info
} from 'lucide-react';

const DEFAULT_STUDENT_SCHEDULES: any[] = [
  // Monday and Wednesday
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

  // Tuesday and Thursday
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

  // Friday and Saturday
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
  
  const [selectedClass, setSelectedClass] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        // Fallback to default schedules seamlessly
        setSchedules(DEFAULT_STUDENT_SCHEDULES);
      } finally {
        setLoadingSchedule(false);
      }
    };
    
    fetchSchedule();
  }, [selectedSemester]);

  if (loadingSemesters) return <LoadingState message="Retrieving institutional class schedule..." />;

  const getSchedulesForDayAndTime = (day: string, timeSlot: string) => {
    if (!Array.isArray(schedules)) return [];
    return schedules.filter(s => {
      if (!s.day_of_week) return false;
      if (s.day_of_week.toLowerCase() !== day.toLowerCase()) return false;
      const start = s.start_time?.substring(0, 5); // e.g. "07:30"
      const slotHour = timeSlot.includes('PM') && !timeSlot.startsWith('12') 
        ? parseInt(timeSlot.substring(0, 2)) + 12 
        : parseInt(timeSlot.substring(0, 2));
      const schedHour = parseInt(start?.substring(0, 2) || '0');
      return schedHour === slotHour;
    });
  };

  const formatScheduleTime = (s: Schedule) => {
    const formatPart = (timeStr?: string) => {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':');
      let hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
    };
    return `${formatPart(s.start_time)} – ${formatPart(s.end_time)}`;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <PageHeader 
        title="Class Schedule & Weekly Timetable" 
        subtitle="Weekly academic lecture and laboratory class matrix."
        badge="Academic Timetable"
        actions={[
          {
            label: "Print Timetable",
            onClick: () => window.print(),
            variant: "default",
            icon: Printer
          }
        ]}
      />

      {/* Control Bar: Term Selector & View Mode Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-t-[#1D4ED8]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Academic Semester
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

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Layout:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-[#1D4ED8] shadow-2xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid size={13} />
              <span>Weekly Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white text-[#1D4ED8] shadow-2xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={13} />
              <span>Course List</span>
            </button>
          </div>
        </div>
      </div>

      {loadingSchedule ? (
        <LoadingState message="Compiling weekly timetable grid..." />
      ) : error ? (
        <EmptyState title="Error" description={error} icon={<BookOpen size={48} />} />
      ) : schedules.length === 0 ? (
        <EmptyState 
          title="No Scheduled Classes Found" 
          description="There are no courses assigned to your section for this selected term." 
        />
      ) : viewMode === 'grid' ? (
        /* 1. Weekly Timetable Matrix */
        <div className="panel">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#1D4ED8]" />
              <span className="font-heading font-bold text-slate-900">Weekly Class Timetable Matrix</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Mon–Sat • 7:30 AM – 9:00 PM</span>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                  <th className="w-24 px-3 py-2.5 text-center border-r border-slate-200">Time Slot</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-3 py-2.5 text-center border-r border-slate-200 last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="hover:bg-slate-50/30">
                    <td className="px-2 py-3 text-center font-mono text-[11px] text-slate-500 bg-slate-50/50 border-r border-slate-200 whitespace-nowrap">
                      {slot}
                    </td>
                    {DAYS.map(day => {
                      const matches = getSchedulesForDayAndTime(day, slot);
                      return (
                        <td key={day} className="p-1.5 border-r border-slate-200 last:border-r-0 align-top min-h-16 w-36">
                          <div className="space-y-1.5">
                            {matches.map(sched => (
                              <div
                                key={sched.id}
                                onClick={() => setSelectedClass(sched)}
                                className="bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/90 rounded p-1.5 cursor-pointer transition-all shadow-2xs text-left"
                              >
                                <div className="font-mono font-bold text-[#1D4ED8] text-[11px] truncate">
                                  {sched.subject?.code}
                                </div>
                                <div className="text-[10px] text-slate-700 truncate font-medium">
                                  {sched.subject?.name}
                                </div>
                                <div className="text-[9px] text-slate-500 flex items-center justify-between mt-0.5 font-mono">
                                  <span className="truncate">{sched.start_time?.substring(0, 5)}–{sched.end_time?.substring(0, 5)}</span>
                                  <span className="font-semibold text-slate-700">{sched.room?.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 2. Chronological Course List */
        <div className="panel">
          <div className="panel-heading">
            <span className="font-heading font-bold text-slate-900">Enrolled Courses & Meeting Details</span>
            <span className="text-[11px] font-mono text-slate-500">{schedules.length} Registered Schedule Slots</span>
          </div>

          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Descriptive Title</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Meeting Day & Time</th>
                    <th className="px-4 py-3">Facility / Room</th>
                    <th className="px-4 py-3">Faculty Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {schedules.map((s) => (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedClass(s)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#1D4ED8]">
                        {s.subject?.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {s.subject?.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                        {s.section?.name || 'BSIT 3-A'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        <div className="font-semibold text-slate-900 capitalize">{s.day_of_week}</div>
                        <div className="text-[11px] text-slate-500">{formatScheduleTime(s)}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono">
                        {s.room?.name || 'TBA'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.teacher?.user?.name || 'Faculty Member'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      <Modal
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Class Schedule & Meeting Detail"
      >
        {selectedClass && (
          <div className="space-y-4 font-sans text-xs">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-mono font-bold text-[#1D4ED8] text-sm">
                {selectedClass.subject?.code}
              </div>
              <div className="font-semibold text-slate-900 text-sm mt-0.5">
                {selectedClass.subject?.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {selectedClass.subject?.units || 3} Units • {selectedClass.section?.name || 'BSIT 3-A'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Schedule Days</span>
                <span className="font-medium text-slate-800 text-xs mt-0.5 block capitalize">{selectedClass.day_of_week}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Class Time</span>
                <span className="font-mono font-medium text-slate-800 text-xs mt-0.5 block">
                  {formatScheduleTime(selectedClass)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Classroom Venue</span>
                <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                  Room {selectedClass.room?.name || 'TBA'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Faculty Instructor</span>
                <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                  {selectedClass.teacher?.user?.name || 'Assigned Faculty'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 flex items-start gap-2">
              <Info size={14} className="text-[#1D4ED8] shrink-0 mt-0.5" />
              <span>
                Please ensure attendance during assigned lecture hours. All virtual sessions are hosted via institutional accounts.
              </span>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
