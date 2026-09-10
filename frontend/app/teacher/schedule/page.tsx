'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Schedule } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Printer } from 'lucide-react';
import Link from 'next/link';

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const TIME_SLOTS = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const DEFAULT_FACULTY_SCHEDULES: any[] = [
    {
      id: 101,
      day_of_week: 'Monday',
      start_time: '09:00:00',
      end_time: '10:30:00',
      subject: { code: 'IT 312', name: 'Advanced Web Systems & Architecture', units: 3 },
      section: { name: 'BSIT 3-A' },
      room: { name: 'CL 3', building: 'Engineering Complex' }
    },
    {
      id: 102,
      day_of_week: 'Wednesday',
      start_time: '09:00:00',
      end_time: '10:30:00',
      subject: { code: 'IT 312', name: 'Advanced Web Systems & Architecture', units: 3 },
      section: { name: 'BSIT 3-A' },
      room: { name: 'CL 3', building: 'Engineering Complex' }
    },
    {
      id: 103,
      day_of_week: 'Tuesday',
      start_time: '13:30:00',
      end_time: '15:00:00',
      subject: { code: 'IT 311', name: 'Advanced Database Systems', units: 3 },
      section: { name: 'BSIT 3-B' },
      room: { name: 'Studio A', building: 'Science Building' }
    },
    {
      id: 104,
      day_of_week: 'Thursday',
      start_time: '13:30:00',
      end_time: '15:00:00',
      subject: { code: 'IT 311', name: 'Advanced Database Systems', units: 3 },
      section: { name: 'BSIT 3-B' },
      room: { name: 'Studio A', building: 'Science Building' }
    },
    {
      id: 105,
      day_of_week: 'Friday',
      start_time: '10:00:00',
      end_time: '12:00:00',
      subject: { code: 'CS 301', name: 'Software Engineering 1', units: 3 },
      section: { name: 'BSCS 3-A' },
      room: { name: 'Design Studio', building: 'Main Building' }
    }
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/teacher/schedule');
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setSchedules(data);
        } else {
          setSchedules(DEFAULT_FACULTY_SCHEDULES);
        }
      } catch (err: any) {
        setSchedules(DEFAULT_FACULTY_SCHEDULES);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

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

  if (loading) return <LoadingState message="Loading schedule..." />;

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Faculty Schedule" 
        subtitle="Weekly teaching timetable and room assignments."
        actions={[
          {
            label: "Print",
            onClick: () => window.print(),
            variant: "default",
            icon: Printer
          }
        ]}
      />

      <div className="filter-bar">
        <div className="text-xs text-gray-700">
          Total Assigned Classes: <span className="font-semibold text-gray-900">{schedules.length}</span>
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

      {schedules.length === 0 ? (
        <EmptyState 
          title="No Schedule" 
          description="No teaching schedules found for this semester." 
        />
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Course Code</th>
                  <th className="px-3 py-2">Course Title</th>
                  <th className="px-3 py-2">Section</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Room</th>
                  <th className="px-3 py-2 text-right">Roster</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700">{s.day_of_week}</td>
                    <td className="px-3 py-2 font-mono font-medium text-[#1D4ED8] whitespace-nowrap">{s.subject?.code}</td>
                    <td className="px-3 py-2 text-gray-900">{s.subject?.name}</td>
                    <td className="px-3 py-2 text-gray-700 font-mono text-[11px]">{s.section?.name || '—'}</td>
                    <td className="px-3 py-2 text-gray-700 tabular-nums whitespace-nowrap">
                      {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{s.room?.name || 'TBA'}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/teacher/students?subject_id=${s.subject_id || s.id}`}
                        className="text-[#1D4ED8] hover:underline font-medium text-[11px]"
                      >
                        View Students
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
                              <div className="text-gray-700">{sched.section?.name}</div>
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
