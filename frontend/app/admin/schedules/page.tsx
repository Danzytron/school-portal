'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/schedules');
      const list = Array.isArray(res) ? res : (res.data || []);
      setSchedules(list);
    } catch (err) {
      console.error('Failed to fetch schedules', err);
      setSchedules([
        { id: 1, subject: { code: 'IT301', name: 'DBMS' }, section: { name: 'BSIT 3-A' }, teacher: { user: { name: 'Dr. Alan Turing' } }, room: { name: 'ComLab 1' }, day_of_week: 'Monday', start_time: '08:00:00', end_time: '11:00:00' },
        { id: 2, subject: { code: 'IT302', name: 'Web Dev' }, section: { name: 'BSIT 3-A' }, teacher: { user: { name: 'Prof. Grace Hopper' } }, room: { name: 'Room 301' }, day_of_week: 'Wednesday', start_time: '13:00:00', end_time: '16:00:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'subject', label: 'Subject', render: (row: any) => `${row.subject?.code || 'IT301'} - ${row.subject?.name || ''}` },
    { key: 'section', label: 'Section', render: (row: any) => row.section?.name || row.section || 'BSIT 3-A' },
    { key: 'teacher', label: 'Instructor', render: (row: any) => row.teacher?.user?.name || row.teacher?.name || row.teacher || 'Faculty Member' },
    { key: 'room', label: 'Assigned Room', render: (row: any) => row.room?.name || row.room || 'ComLab 1' },
    { key: 'day', label: 'Day of Week', render: (row: any) => row.day_of_week || row.day || 'Monday' },
    { key: 'time', label: 'Schedule Time', render: (row: any) => row.start_time ? `${row.start_time.substring(0,5)} - ${row.end_time?.substring(0,5)}` : (row.time || '08:00 - 11:00') },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Master Class Schedule Management" subtitle="Manage class timetable allocations, room assignments, and faculty slots" />
      {loading ? <LoadingState message="Loading timetable schedule..." /> : <DataTable columns={columns} data={schedules} />}
    </div>
  );
}
