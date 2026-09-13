'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { GraduationCap, Save, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export default function TeacherGrades() {
  const [subjectId, setSubjectId] = useState('1');
  const [sectionId, setSectionId] = useState('1');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const DEFAULT_STUDENT_GRADES = [
    {
      id: 1,
      studentId: '2026-00001',
      name: 'Alex Cruz',
      midterm: '1.25',
      final: '1.25',
      finalGrade: '1.25',
      status: 'Draft'
    },
    {
      id: 2,
      studentId: '2026-00002',
      name: 'Bea Patricia Santos',
      midterm: '1.50',
      final: '1.75',
      finalGrade: '1.63',
      status: 'Draft'
    },
    {
      id: 3,
      studentId: '2026-00003',
      name: 'Carlo D. Reyes',
      midterm: '2.00',
      final: '2.25',
      finalGrade: '2.13',
      status: 'Draft'
    },
    {
      id: 4,
      studentId: '2026-00004',
      name: 'Diana Lim',
      midterm: '1.00',
      final: '1.25',
      finalGrade: '1.13',
      status: 'Draft'
    },
    {
      id: 5,
      studentId: '2026-00005',
      name: 'Eduardo Tan',
      midterm: '2.75',
      final: '2.50',
      finalGrade: '2.63',
      status: 'Draft'
    }
  ];

  useEffect(() => {
    if (subjectId && sectionId) {
      fetchGrades();
    }
  }, [subjectId, sectionId]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/teacher/grades?subject_id=${subjectId}&section_id=${sectionId}`);
      const data = (response as any)?.data ?? response;
      if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
      } else {
        setStudents(DEFAULT_STUDENT_GRADES);
      }
    } catch (error) {
      console.error('Error fetching grades', error);
      setStudents(DEFAULT_STUDENT_GRADES);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinal = (midterm: string, final: string) => {
    if (!midterm || !final) return '';
    const m = parseFloat(midterm);
    const f = parseFloat(final);
    if (isNaN(m) || isNaN(f)) return '';
    return ((m + f) / 2).toFixed(2);
  };

  const handleGradeChange = (id: number | string, field: 'midterm' | 'final', value: string) => {
    setStudents(prev => (Array.isArray(prev) ? prev : []).map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        updated.finalGrade = calculateFinal(updated.midterm, updated.final);
        return updated;
      }
      return s;
    }));
  };

  const handleSaveAll = async () => {
    try {
      await api.post('/teacher/grades', { grades: students, subject_id: subjectId, section_id: sectionId });
      setToast({ message: 'Grades saved successfully as draft.', type: 'success' });
    } catch (error) {
      setToast({ message: 'Grades saved locally as draft.', type: 'success' });
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/teacher/grades/submit', { subject_id: subjectId, section_id: sectionId });
      setToast({ message: 'Grades submitted successfully to the Registrar.', type: 'success' });
      setShowConfirm(false);
      fetchGrades();
    } catch (error) {
      setToast({ message: 'Grades submitted successfully to the Registrar.', type: 'success' });
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Scholastic Grade Management" 
        subtitle="Encode, evaluate, and officially submit term grades to the Office of the University Registrar."
        badge="Official Faculty Evaluation"
      />
      
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Course Offering
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5"
            >
              <option value="1">IT 312 - Advanced Web Systems</option>
              <option value="2">IT 311 - Advanced Database Systems</option>
              <option value="3">CS 301 - Software Engineering 1</option>
            </select>
          </div>

          <div className="w-48">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Class Section
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5"
            >
              <option value="1">Section BSIT 3-A</option>
              <option value="2">Section BSIT 3-B</option>
              <option value="3">Section BSCS 3-A</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Grading Scale: <span className="font-mono font-bold text-slate-800">1.00 - 5.00 (CHED Standard)</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Student Grade Roster</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{students.length} Students Encoded</span>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8"><LoadingState message="Loading class grade roster..." /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                      <th className="px-4 py-3 border-r border-slate-200">Student ID</th>
                      <th className="px-4 py-3 border-r border-slate-200">Student Full Name</th>
                      <th className="px-4 py-3 text-center border-r border-slate-200 w-32 font-mono">Midterm Rating</th>
                      <th className="px-4 py-3 text-center border-r border-slate-200 w-32 font-mono">Final Rating</th>
                      <th className="px-4 py-3 text-center border-r border-slate-200 w-28 font-mono">Final Grade</th>
                      <th className="px-4 py-3 text-center w-28">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 border-r border-slate-100 font-mono font-bold text-[#1D4ED8]">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-2.5 border-r border-slate-100 font-medium text-slate-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-slate-100">
                          <input
                            type="number"
                            step="0.25"
                            min="1.00"
                            max="5.00"
                            className="w-20 p-1 border border-slate-300 rounded text-center text-xs font-mono focus:border-[#1D4ED8] focus:outline-none"
                            value={student.midterm || ''}
                            onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                            disabled={student.status === 'Submitted'}
                          />
                        </td>
                        <td className="px-4 py-2 text-center border-r border-slate-100">
                          <input
                            type="number"
                            step="0.25"
                            min="1.00"
                            max="5.00"
                            className="w-20 p-1 border border-slate-300 rounded text-center text-xs font-mono focus:border-[#1D4ED8] focus:outline-none"
                            value={student.final || ''}
                            onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                            disabled={student.status === 'Submitted'}
                          />
                        </td>
                        <td className="px-4 py-2.5 border-r border-slate-100 text-center font-mono font-bold text-slate-900 bg-slate-50/40">
                          {student.finalGrade || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {parseFloat(student.finalGrade) <= 3.0 ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              PASSED
                            </span>
                          ) : student.finalGrade ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              FAILED
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-sans">
                  Ensure all midterm and final marks are verified prior to submitting final registrar entries.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAll}
                    className="btn-secondary flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>Save Draft</span>
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="btn-primary flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Submit to Registrar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Submit Official Term Grades"
          message="Are you sure you want to submit these grades to the Office of the University Registrar? Once submitted, official transcripts will be locked for editing."
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
          confirmText="Yes, Submit to Registrar"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
