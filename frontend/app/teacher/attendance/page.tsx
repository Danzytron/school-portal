'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import { ClipboardList, CheckCircle2, UserCheck, Clock, Check, X, AlertCircle } from 'lucide-react';

export default function TeacherAttendance() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [sectionId, setSectionId] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [subsRes, studsRes] = await Promise.all([
        api.get('/teacher/subjects').catch(() => []),
        api.get('/teacher/students').catch(() => []),
      ]);
      const sList = Array.isArray(subsRes) ? subsRes : (subsRes?.data || []);
      const stList = Array.isArray(studsRes) ? studsRes : (studsRes?.data || []);
      
      setSubjects(sList);
      if (sList.length > 0 && !subjectId) {
        setSubjectId(String(sList[0].id));
      }

      if (stList.length > 0) {
        setStudents(stList.map((st: any) => ({
          id: st.id,
          student_id_number: st.student_id_number || `2026-${String(st.id).padStart(5, '0')}`,
          name: st.user?.name || st.name || 'Student Name',
          status: 'present',
        })));
      } else {
        setStudents([
          { id: 1, student_id_number: '2026-00001', name: 'Alex Cruz', status: 'present' },
          { id: 2, student_id_number: '2026-00002', name: 'Bea Patricia Santos', status: 'present' },
          { id: 3, student_id_number: '2026-00003', name: 'Carlo D. Reyes', status: 'late' },
          { id: 4, student_id_number: '2026-00004', name: 'Diana Lim', status: 'present' },
          { id: 5, student_id_number: '2026-00005', name: 'Eduardo Tan', status: 'excused' },
        ]);
      }
    } catch (e) {
      console.error('Failed to load initial teacher attendance data', e);
    }
  };

  const handleStatusChange = (id: number | string, status: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAll = (status: string) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmit = async () => {
    if (!subjectId) {
      setToast({ message: 'Please select a subject offering.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: s.status,
      }));

      await api.post('/teacher/attendance', {
        subject_id: parseInt(subjectId),
        section_id: parseInt(sectionId) || 1,
        date: date,
        records: records,
      });

      setToast({ message: 'Class attendance recorded and permanently saved to database.', type: 'success' });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to submit attendance.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const excusedCount = students.filter(s => s.status === 'excused').length;

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Classroom Attendance Registry" 
        subtitle="Log student attendance, record late arrivals, and submit official roll call reports"
      />
      
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Course Offering
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            >
              {subjects.length > 0 ? (
                subjects.map(s => (
                  <option key={s.id} value={String(s.id)}>
                    {s.code} - {s.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="1">IT 312 - Advanced Web Systems</option>
                  <option value="2">IT 311 - Advanced Database Systems</option>
                  <option value="3">CS 301 - Software Engineering 1</option>
                </>
              )}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Class Section
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            >
              <option value="1">BSIT 3-A</option>
              <option value="2">BSIT 3-B</option>
              <option value="3">BSCS 3-A</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll('present')}
            className="btn-secondary"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Saving Roll Call...' : 'Save & Submit Roll Call'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Present</div>
          <div className="text-xl font-bold text-emerald-700 font-heading mt-0.5">{presentCount}</div>
        </div>
        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Late</div>
          <div className="text-xl font-bold text-amber-700 font-heading mt-0.5">{lateCount}</div>
        </div>
        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Absent</div>
          <div className="text-xl font-bold text-rose-700 font-heading mt-0.5">{absentCount}</div>
        </div>
        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Excused</div>
          <div className="text-xl font-bold text-blue-700 font-heading mt-0.5">{excusedCount}</div>
        </div>
      </div>

      {/* Roster Roll Call List */}
      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Official Class Roster Attendance ({students.length} Students)</span>
          </div>
        </div>

        <div className="divide-y divide-slate-200/80">
          {students.map((student) => (
            <div key={student.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1D4ED8] border border-blue-100 flex items-center justify-center font-bold text-xs">
                  {student.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{student.name}</div>
                  <div className="font-mono text-xs text-slate-500">{student.student_id_number}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {(['present', 'late', 'absent', 'excused'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(student.id, status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                      student.status === status
                        ? status === 'present' ? 'bg-emerald-600 text-white'
                        : status === 'late' ? 'bg-amber-500 text-white'
                        : status === 'absent' ? 'bg-rose-600 text-white'
                        : 'bg-[#1D4ED8] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
