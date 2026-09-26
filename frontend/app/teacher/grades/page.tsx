'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import {
  GraduationCap, Save, CheckCircle2, AlertCircle, BookOpen,
  Plus, Pencil, Trash2, Search, Users, FileText, ListChecks, LayoutList,
  ArrowUpDown
} from 'lucide-react';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
export interface GradeRecord {
  id: number | string;
  studentId: string;
  studentDatabaseId?: number;
  name: string;
  assessmentType?: string;
  assessmentName?: string;
  rawScore?: string;
  maxScore?: string;
  weight?: string;
  midterm: string;
  final: string;
  finalGrade: string;
  term: string;
  schoolYear: string;
  remarks: string;
  status: 'Draft' | 'Submitted' | 'Finalized' | 'No Grade';
  is_submitted?: boolean;
}

type ViewMode = 'list' | 'bulk';
type SortField = 'studentId' | 'name' | 'midterm' | 'final' | 'finalGrade' | 'status';
type SortOrder = 'asc' | 'desc';

// Default subjects/sections matching faculty assignments
const DEFAULT_SUBJECTS = [
  { id: '1', code: 'IT101', name: 'Introduction to Computing' },
  { id: '2', code: 'IT102', name: 'Computer Programming 1' },
  { id: '10', code: 'IT201', name: 'Object-Oriented Programming' },
  { id: '16', code: 'CS102', name: 'Programming Fundamentals' },
];

const DEFAULT_SECTIONS = [
  { id: '1', name: 'BSIT-1A' },
  { id: '3', name: 'BSIT-2A' },
  { id: '5', name: 'BSCS-1A' },
];

const TERMS = [
  { id: '1st', label: '1st Semester' },
  { id: '2nd', label: '2nd Semester' },
  { id: 'summer', label: 'Summer Term' },
];

const SCHOOL_YEARS = [
  { id: '2026-2027', label: 'A.Y. 2026–2027' },
  { id: '2025-2026', label: 'A.Y. 2025–2026' },
];

const ASSESSMENT_TYPES = [
  'Major Exam',
  'Quiz / Assessment',
  'Laboratory Activity',
  'Project / Capstone',
  'Assignment / Homework',
  'Class Participation',
];

// ────────────────────────────────────────────
// Grade Calculation Helpers
// ────────────────────────────────────────────
function calcFinalGrade(midterm: string, final: string): string {
  if (!midterm || !final) return '';
  const m = parseFloat(midterm);
  const f = parseFloat(final);
  if (isNaN(m) || isNaN(f)) return '';
  return ((m + f) / 2).toFixed(2);
}

function getPassStatus(finalGrade: string): 'passed' | 'failed' | 'none' {
  if (!finalGrade) return 'none';
  const g = parseFloat(finalGrade);
  if (isNaN(g)) return 'none';
  return g <= 3.0 ? 'passed' : 'failed';
}

function percentageToChedRating(scoreStr: string, maxStr: string): string {
  if (!scoreStr || !maxStr) return '';
  const s = parseFloat(scoreStr);
  const m = parseFloat(maxStr);
  if (isNaN(s) || isNaN(m) || m === 0) return '';
  const pct = (s / m) * 100;
  if (pct >= 97) return '1.00';
  if (pct >= 94) return '1.25';
  if (pct >= 91) return '1.50';
  if (pct >= 88) return '1.75';
  if (pct >= 85) return '2.00';
  if (pct >= 82) return '2.25';
  if (pct >= 79) return '2.50';
  if (pct >= 76) return '2.75';
  if (pct >= 75) return '3.00';
  return '5.00';
}

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────
export default function TeacherGrades() {
  // Assigned classes from backend
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<{ id: string; code: string; name: string }[]>(DEFAULT_SUBJECTS);
  const [sectionsList, setSectionsList] = useState<{ id: string; name: string }[]>(DEFAULT_SECTIONS);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [selectedStudentDropdown, setSelectedStudentDropdown] = useState<string>('');

  // Filter state
  const [subjectId, setSubjectId] = useState('1');
  const [sectionId, setSectionId] = useState('1');
  const [term, setTerm] = useState('1st');
  const [schoolYear, setSchoolYear] = useState('2026-2027');
  const [search, setSearch] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('studentId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Data state
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [bulkRows, setBulkRows] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GradeRecord | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    studentDatabaseId: undefined as number | undefined,
    name: '',
    assessmentType: 'Major Exam',
    assessmentName: 'Midterm & Final Examination',
    rawScore: '',
    maxScore: '100',
    weight: '100',
    midterm: '',
    final: '',
    remarks: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Load Teacher's Assigned Classes ────────
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        const response = await api.get('/teacher/subjects');
        const data = (response as any)?.data ?? response;
        if (Array.isArray(data) && data.length > 0) {
          setAssignedClasses(data);

          // Extract unique subjects
          const subjMap = new Map<string, { id: string; code: string; name: string }>();
          data.forEach((item: any) => {
            if (item.subject) {
              subjMap.set(String(item.subject.id), {
                id: String(item.subject.id),
                code: item.subject.code,
                name: item.subject.name,
              });
            }
          });
          const uniqueSubjs = Array.from(subjMap.values());
          if (uniqueSubjs.length > 0) {
            setSubjectsList(uniqueSubjs);
            const initialSubjId = uniqueSubjs[0].id;
            setSubjectId(initialSubjId);

            // Filter sections for this first subject
            const secMap = new Map<string, { id: string; name: string }>();
            data
              .filter((item: any) => String(item.subject_id) === initialSubjId && item.section)
              .forEach((item: any) => {
                secMap.set(String(item.section.id), {
                  id: String(item.section.id),
                  name: item.section.name,
                });
              });
            const uniqueSecs = Array.from(secMap.values());
            if (uniqueSecs.length > 0) {
              setSectionsList(uniqueSecs);
              setSectionId(uniqueSecs[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load teacher assigned subjects:', err);
      }
    };
    fetchTeacherClasses();
  }, []);

  // ── Handle Subject Filter Change ───────────
  const handleSubjectChange = (newSubjId: string) => {
    setSubjectId(newSubjId);
    if (assignedClasses.length > 0) {
      const secMap = new Map<string, { id: string; name: string }>();
      assignedClasses
        .filter((item: any) => String(item.subject_id) === newSubjId && item.section)
        .forEach((item: any) => {
          secMap.set(String(item.section.id), {
            id: String(item.section.id),
            name: item.section.name,
          });
        });
      const secs = Array.from(secMap.values());
      if (secs.length > 0) {
        setSectionsList(secs);
        if (!secs.some((s) => s.id === sectionId)) {
          setSectionId(secs[0].id);
        }
      }
    }
  };

  // ── Load Enrolled Students in Section ──────
  useEffect(() => {
    if (sectionId) {
      api.get(`/teacher/students?section_id=${sectionId}`)
        .then((res: any) => {
          const data = res?.data ?? res;
          if (Array.isArray(data)) {
            setEnrolledStudents(data);
          }
        })
        .catch((err) => console.error('Failed to load enrolled students:', err));
    }
  }, [sectionId]);

  // ── Load Grades from PostgreSQL ───────────
  const fetchGrades = async () => {
    if (!subjectId || !sectionId) return;
    setLoading(true);
    try {
      const response = await api.get(`/teacher/grades?subject_id=${subjectId}&section_id=${sectionId}`);
      const data = (response as any)?.data ?? response;
      if (Array.isArray(data)) {
        const mapped: GradeRecord[] = data.map((g: any) => ({
          id: g.id,
          studentId: g.student?.student_id_number || (typeof g.student_id === 'number' ? `2026-${String(g.student_id).padStart(5, '0')}` : g.student_id || ''),
          studentDatabaseId: g.student_id,
          name: g.student?.user?.name || g.name || '',
          assessmentType: g.assessment_type || 'Major Exam',
          assessmentName: g.assessment_name || 'Midterm & Final Examination',
          rawScore: g.raw_score !== null && g.raw_score !== undefined ? g.raw_score.toString() : '',
          maxScore: g.max_score !== null && g.max_score !== undefined ? g.max_score.toString() : '100',
          weight: g.weight !== null && g.weight !== undefined ? g.weight.toString() : '100',
          midterm: g.midterm !== null && g.midterm !== undefined ? g.midterm.toString() : '',
          final: g.final !== null && g.final !== undefined ? g.final.toString() : '',
          finalGrade: g.final_grade !== null && g.final_grade !== undefined ? g.final_grade.toString() : calcFinalGrade(g.midterm?.toString(), g.final?.toString()),
          term: g.term || currentTerm?.label || '1st Semester',
          schoolYear: g.school_year || currentSY?.label || '2026–2027',
          remarks: g.remarks || '',
          status: g.is_submitted ? 'Submitted' : (g.midterm || g.final ? 'Draft' : 'No Grade'),
          is_submitted: g.is_submitted,
        }));
        setGrades(mapped);
      } else {
        setGrades([]);
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId && sectionId) {
      fetchGrades();
    }
  }, [subjectId, sectionId, term, schoolYear]);

  // ── Sync Bulk Rows (Roster + Saved Grades) ─
  const currentTerm = TERMS.find((t) => t.id === term);
  const currentSY = SCHOOL_YEARS.find((sy) => sy.id === schoolYear);

  useEffect(() => {
    if (enrolledStudents.length > 0) {
      const rows: GradeRecord[] = enrolledStudents.map((st) => {
        const existing = grades.find(
          (g) =>
            (g.studentDatabaseId && g.studentDatabaseId === st.id) ||
            (g.studentId && g.studentId === st.student_id_number) ||
            (g.name && st.user?.name && g.name.toLowerCase() === st.user.name.toLowerCase())
        );

        if (existing) {
          return { ...existing, studentDatabaseId: st.id };
        }

        return {
          id: `enrolled-${st.id}`,
          studentId: st.student_id_number || (typeof st.id === 'number' ? `2026-${String(st.id).padStart(5, '0')}` : String(st.id)),
          studentDatabaseId: st.id,
          name: st.user?.name || '',
          assessmentType: 'Major Exam',
          assessmentName: 'Midterm & Final Examination',
          rawScore: '',
          maxScore: '100',
          weight: '100',
          midterm: '',
          final: '',
          finalGrade: '',
          term: currentTerm?.label || '1st Semester',
          schoolYear: currentSY?.label || '2026–2027',
          remarks: '',
          status: 'No Grade',
          is_submitted: false,
        };
      });

      const customGrades = grades.filter(
        (g) => !rows.some((r) => r.id === g.id || (g.studentId && r.studentId === g.studentId))
      );

      setBulkRows([...rows, ...customGrades]);
    } else {
      setBulkRows(grades);
    }
  }, [enrolledStudents, grades, currentTerm, currentSY]);

  // ── Sorting ────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ── Filtered & Sorted Grades (Individual View)
  const filteredGrades = useMemo(() => {
    let list = [...grades];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.studentId.toLowerCase().includes(q) ||
          g.remarks.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let aVal = (a[sortField] || '').toString().toLowerCase();
      let bVal = (b[sortField] || '').toString().toLowerCase();

      if (sortField === 'midterm' || sortField === 'final' || sortField === 'finalGrade') {
        const aNum = parseFloat(aVal) || 999;
        const bNum = parseFloat(bVal) || 999;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    return list;
  }, [grades, search, sortField, sortOrder]);

  // ── Filtered Rows (Bulk View) ──────────────
  const filteredBulkRows = useMemo(() => {
    let list = [...bulkRows];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.studentId.toLowerCase().includes(q) ||
          g.remarks.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bulkRows, search]);

  // ── Summary stats ──────────────────────────
  const stats = useMemo(() => {
    const total = enrolledStudents.length > 0 ? enrolledStudents.length : grades.length;
    const recorded = grades.filter((g) => g.midterm || g.final).length;
    const completed = grades.filter((g) => g.midterm && g.final && g.finalGrade).length;
    const pending = Math.max(0, total - completed);
    const submitted = grades.filter((g) => g.status === 'Submitted' || g.status === 'Finalized').length;
    return { total, recorded, completed, pending, submitted };
  }, [grades, enrolledStudents]);

  // ── Context labels ─────────────────────────
  const currentSubject = subjectsList.find((s) => s.id === subjectId) || DEFAULT_SUBJECTS.find((s) => s.id === subjectId);
  const currentSection = sectionsList.find((s) => s.id === sectionId) || DEFAULT_SECTIONS.find((s) => s.id === sectionId);

  // ── Form validation ────────────────────────
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() && !editingGrade) {
      errors.name = 'Student name is required.';
    }

    if (formData.midterm) {
      const m = parseFloat(formData.midterm);
      if (isNaN(m) || m < 1.0 || m > 5.0) {
        errors.midterm = 'Midterm must be between 1.00 and 5.00.';
      }
    }

    if (formData.final) {
      const f = parseFloat(formData.final);
      if (isNaN(f) || f < 1.0 || f > 5.0) {
        errors.final = 'Final must be between 1.00 and 5.00.';
      }
    }

    if (formData.rawScore && formData.maxScore) {
      const s = parseFloat(formData.rawScore);
      const m = parseFloat(formData.maxScore);
      if (isNaN(s) || s < 0) {
        errors.rawScore = 'Score cannot be negative.';
      } else if (m > 0 && s > m) {
        errors.rawScore = 'Score cannot exceed maximum score.';
      }
    }

    if (!formData.midterm && !formData.final && !formData.rawScore) {
      errors.midterm = 'Please enter at least one rating (Midterm or Final) or a score.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── CRUD: Open Add Modal ───────────────────
  const handleOpenAdd = () => {
    setSelectedStudentDropdown('');
    setFormData({
      studentId: '',
      studentDatabaseId: undefined,
      name: '',
      assessmentType: 'Major Exam',
      assessmentName: 'Midterm & Final Examination',
      rawScore: '',
      maxScore: '100',
      weight: '100',
      midterm: '',
      final: '',
      remarks: '',
    });
    setFormErrors({});
    setEditingGrade(null);
    setShowAddModal(true);
  };

  // ── Student Selection from Roster ──────────
  const handleSelectStudentFromRoster = (val: string) => {
    setSelectedStudentDropdown(val);
    if (val === 'custom' || val === '') {
      setFormData((prev) => ({
        ...prev,
        studentDatabaseId: undefined,
        studentId: '',
        name: '',
      }));
    } else {
      const st = enrolledStudents.find((s) => String(s.id) === val);
      if (st) {
        setFormData((prev) => ({
          ...prev,
          studentDatabaseId: st.id,
          studentId: st.student_id_number || (typeof st.id === 'number' ? `2026-${String(st.id).padStart(5, '0')}` : String(st.id)),
          name: st.user?.name || '',
        }));
      }
    }
  };

  // ── CRUD: Save (Create or Update) ──────────
  const handleSaveGrade = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      const payload: any = {
        subject_id: subjectId,
        section_id: sectionId,
        student_id: formData.studentDatabaseId || formData.studentId || undefined,
        name: formData.name || undefined,
        midterm: formData.midterm ? parseFloat(formData.midterm) : null,
        final: formData.final ? parseFloat(formData.final) : null,
        remarks: formData.remarks || null,
        assessment_type: formData.assessmentType,
        assessment_name: formData.assessmentName,
        raw_score: formData.rawScore ? parseFloat(formData.rawScore) : null,
        max_score: formData.maxScore ? parseFloat(formData.maxScore) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingGrade) {
        await api.put(`/teacher/grades/${editingGrade.id}`, payload);
        setToast({ message: 'Grade record updated successfully.', type: 'success' });
      } else {
        await api.post('/teacher/grades', payload);
        setToast({ message: 'Grade record added successfully.', type: 'success' });
      }
      setShowAddModal(false);
      setEditingGrade(null);
      await fetchGrades();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to save grade record.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── CRUD: Open Edit Modal ──────────────────
  const handleOpenEdit = (grade: GradeRecord) => {
    setFormData({
      studentId: grade.studentId,
      studentDatabaseId: grade.studentDatabaseId,
      name: grade.name,
      assessmentType: grade.assessmentType || 'Major Exam',
      assessmentName: grade.assessmentName || 'Midterm & Final Examination',
      rawScore: grade.rawScore || '',
      maxScore: grade.maxScore || '100',
      weight: grade.weight || '100',
      midterm: grade.midterm || '',
      final: grade.final || '',
      remarks: grade.remarks || '',
    });
    setFormErrors({});
    setEditingGrade(grade);
    setShowAddModal(true);
  };

  // ── CRUD: Delete Grade Record ──────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await api.delete(`/teacher/grades/${deleteTarget.id}`);
      setToast({ message: 'Grade record deleted successfully.', type: 'success' });
      setGrades((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      await fetchGrades();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete grade record from server.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setDeleteTarget(null);
      setIsSaving(false);
    }
  };

  // ── Bulk Entry Handlers ────────────────────
  const handleBulkGradeChange = (id: number | string, field: 'midterm' | 'final', value: string) => {
    setBulkRows((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, [field]: value };
          updated.finalGrade = calcFinalGrade(updated.midterm, updated.final);
          if (updated.midterm || updated.final) {
            updated.status = 'Draft';
          }
          return updated;
        }
        return g;
      })
    );
  };

  const handleBulkRemarksChange = (id: number | string, value: string) => {
    setBulkRows((prev) =>
      prev.map((g) => (g.id === id ? { ...g, remarks: value } : g))
    );
  };

  const handleSaveAllBulk = async () => {
    setIsSaving(true);
    try {
      const rowsToSave = bulkRows
        .filter((r) => r.midterm || r.final || r.remarks || typeof r.id === 'number')
        .map((r) => ({
          id: typeof r.id === 'number' ? r.id : undefined,
          student_id: r.studentDatabaseId,
          studentId: r.studentId,
          name: r.name,
          midterm: r.midterm ? parseFloat(r.midterm) : null,
          final: r.final ? parseFloat(r.final) : null,
          remarks: r.remarks || null,
        }));

      if (rowsToSave.length === 0) {
        setToast({ message: 'No grade marks to save.', type: 'error' });
        setIsSaving(false);
        return;
      }

      await api.post('/teacher/grades/bulk', {
        grades: rowsToSave,
        subject_id: subjectId,
        section_id: sectionId,
      });
      setToast({ message: `Successfully saved grades for ${rowsToSave.length} student(s).`, type: 'success' });
      await fetchGrades();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to save grades in bulk.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Submit to Registrar ────────────────────
  const handleSubmitToRegistrar = async () => {
    setIsSaving(true);
    try {
      await api.post('/teacher/grades/submit', {
        subject_id: subjectId,
        section_id: sectionId,
      });
      setToast({ message: 'Grades officially submitted to the Registrar.', type: 'success' });
      setShowSubmitConfirm(false);
      await fetchGrades();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to submit grades to registrar.';
      setToast({ message: errorMsg, type: 'error' });
      setShowSubmitConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Computed Modal Values ──────────────────
  const computedFinalGrade = calcFinalGrade(formData.midterm, formData.final);
  const calculatedRatingFromScore = percentageToChedRating(formData.rawScore, formData.maxScore);

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <div className="space-y-5 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page Header ─────────────────────── */}
      <PageHeader
        title="Grading Management"
        subtitle="Manage, compute, and submit official student grades for your assigned courses."
        badge="Official Faculty Evaluation"
        actions={
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} />
            <span>Add Grade</span>
          </button>
        }
      />

      {/* ── Active Subject / Section Banner ─── */}
      {currentSubject && currentSection && (
        <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-[#1D4ED8]">
              <BookOpen size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-slate-900 text-sm">
                  {currentSection.name}
                </span>
                <span className="text-slate-300 font-mono">|</span>
                <span className="text-xs font-semibold text-[#1D4ED8]">
                  {currentSubject.code}
                </span>
                <span className="text-slate-400 text-xs hidden md:inline">—</span>
                <span className="text-xs text-slate-700 font-medium hidden md:inline">
                  {currentSubject.name}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{currentTerm?.label}</span>
                <span>•</span>
                <span>{currentSY?.label}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-sans self-start sm:self-center bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
            CHED Scale: <strong className="font-mono text-slate-800">1.00 (97-100) — 3.00 (75 Pass) — 5.00 (Fail)</strong>
          </div>
        </div>
      )}

      {/* ── Filters & Controls Bar ─────────── */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Course Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            >
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Class Section
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            >
              {sectionsList.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Term Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Term / Semester
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            >
              {TERMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* School Year Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Academic Year
            </label>
            <select
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
            >
              {SCHOOL_YEARS.map((sy) => (
                <option key={sy.id} value={sy.id}>
                  {sy.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Student */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Search Student
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or Student ID..."
                className="form-control text-xs py-1.5 pl-8"
              />
            </div>
          </div>
        </div>

        {/* View Mode Toggle Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-0.5 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList size={13} />
              <span>Individual View</span>
            </button>
            <button
              onClick={() => setViewMode('bulk')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'bulk'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks size={13} />
              <span>Bulk Grade Entry</span>
            </button>
          </div>

          <div className="text-slate-500 text-[11px]">
            {viewMode === 'list' ? (
              <>Showing <strong className="text-slate-800">{filteredGrades.length}</strong> of {grades.length} Recorded Grade(s)</>
            ) : (
              <>Roster: <strong className="text-slate-800">{filteredBulkRows.length}</strong> Enrolled Students</>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Overview Stats ─────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Enrolled Students', value: stats.total, icon: Users, color: 'text-[#1D4ED8] bg-blue-50 border-blue-200' },
          { label: 'Grades Recorded', value: stats.recorded, icon: FileText, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Evaluations Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Pending Evaluations', value: stats.pending, icon: AlertCircle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-2xs flex items-center gap-3"
          >
            <div className={`p-2 rounded-md border ${stat.color} shrink-0`}>
              <stat.icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                {stat.label}
              </div>
              <div className="text-lg font-bold text-slate-900 font-heading tabular-nums leading-tight mt-0.5">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Student Grade List Panel ───────── */}
      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">
              {viewMode === 'list' ? 'Student Grade List' : 'Class Roster Bulk Grade Entry'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {currentSection?.name} · {currentSubject?.code}
          </span>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8">
              <LoadingState message="Loading student grades from database..." />
            </div>
          ) : viewMode === 'list' && filteredGrades.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Grade Records"
                description={
                  search
                    ? `No students matching "${search}" found in this class.`
                    : 'There are no grade records for this class yet. Click "+ Add Grade" or switch to "Bulk Grade Entry" to enter student marks.'
                }
                icon={GraduationCap}
                action={
                  !search ? (
                    <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5 cursor-pointer">
                      <Plus size={14} />
                      <span>Add Grade</span>
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : viewMode === 'list' ? (
            /* ───────────────────────────────────
               INDIVIDUAL READ-ONLY TABLE (WITH CRUD ACTIONS)
               ─────────────────────────────────── */
            <>
              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                      <th className="px-3.5 py-3 border-r border-slate-200 w-10 text-center">#</th>
                      <th
                        onClick={() => handleSort('studentId')}
                        className="px-3.5 py-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Student ID</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-3.5 py-3 border-r border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Student Full Name</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('midterm')}
                        className="px-3.5 py-3 text-center border-r border-slate-200 w-24 font-mono cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Midterm</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('final')}
                        className="px-3.5 py-3 text-center border-r border-slate-200 w-24 font-mono cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Final</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('finalGrade')}
                        className="px-3.5 py-3 text-center border-r border-slate-200 w-28 font-mono cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Final Grade</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('status')}
                        className="px-3.5 py-3 text-center border-r border-slate-200 w-24 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Status</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3.5 py-3 border-r border-slate-200">Remarks</th>
                      <th className="px-3.5 py-3 text-center w-24 select-none">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredGrades.map((grade, idx) => {
                      const passStatus = getPassStatus(grade.finalGrade);

                      return (
                        <tr key={grade.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 font-mono font-bold text-[#1D4ED8]">
                            {grade.studentId}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 font-medium text-slate-900">
                            {grade.name}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center font-mono font-semibold text-slate-800">
                            {grade.midterm || <span className="text-slate-300 font-normal">—</span>}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center font-mono font-semibold text-slate-800">
                            {grade.final || <span className="text-slate-300 font-normal">—</span>}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center font-mono font-bold text-slate-900 bg-slate-50/40">
                            {grade.finalGrade ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{grade.finalGrade}</span>
                                {passStatus === 'passed' && (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-px rounded text-[9px] font-bold uppercase">
                                    PASSED
                                  </span>
                                )}
                                {passStatus === 'failed' && (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-px rounded text-[9px] font-bold uppercase">
                                    FAILED
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-normal">—</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center">
                            {grade.status === 'Submitted' || grade.status === 'Finalized' ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                Submitted
                              </span>
                            ) : grade.status === 'Draft' ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                Draft
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                No Grade
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-slate-500 text-[11px] max-w-[180px] truncate">
                            {grade.remarks || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(grade)}
                                className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-[#1D4ED8] transition-colors cursor-pointer"
                                title="Edit Grade"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(grade)}
                                className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Grade"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 font-sans">
                {filteredGrades.map((grade) => {
                  const passStatus = getPassStatus(grade.finalGrade);

                  return (
                    <div key={grade.id} className="p-3.5 space-y-2 hover:bg-slate-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#1D4ED8] block">
                            {grade.studentId}
                          </span>
                          <h4 className="font-medium text-slate-900 text-xs mt-0.5">
                            {grade.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(grade)}
                            className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-[#1D4ED8] transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(grade)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-md text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Midterm</span>
                          <span className="font-mono font-bold text-slate-800">{grade.midterm || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Final</span>
                          <span className="font-mono font-bold text-slate-800">{grade.final || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Final Grade</span>
                          <div className="font-mono font-bold text-[#1D4ED8]">
                            {grade.finalGrade || '—'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          {passStatus === 'passed' && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              PASSED
                            </span>
                          )}
                          {passStatus === 'failed' && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              FAILED
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {grade.remarks || 'No remarks'}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                          {grade.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-sans">
                  Ensure all term ratings are validated before submitting. Submissions lock grade entries.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="btn-primary flex items-center gap-1.5 cursor-pointer"
                    disabled={stats.completed === 0}
                  >
                    <CheckCircle2 size={13} />
                    <span>Submit to Registrar</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ───────────────────────────────────
               BULK GRADE ENTRY MODE
               ─────────────────────────────────── */
            <>
              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase">
                      <th className="px-3.5 py-3 border-r border-slate-200 w-10 text-center">#</th>
                      <th className="px-3.5 py-3 border-r border-slate-200">Student ID</th>
                      <th className="px-3.5 py-3 border-r border-slate-200">Student Name</th>
                      <th className="px-3.5 py-3 text-center border-r border-slate-200 w-32 font-mono">Midterm Rating</th>
                      <th className="px-3.5 py-3 text-center border-r border-slate-200 w-32 font-mono">Final Rating</th>
                      <th className="px-3.5 py-3 text-center border-r border-slate-200 w-28 font-mono">Final Grade</th>
                      <th className="px-3.5 py-3 text-center border-r border-slate-200 w-36">Remarks</th>
                      <th className="px-3.5 py-3 text-center w-24">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredBulkRows.map((grade, idx) => {
                      const passStatus = getPassStatus(grade.finalGrade);

                      return (
                        <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 font-mono font-bold text-[#1D4ED8]">
                            {grade.studentId}
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 font-medium text-slate-900">
                            {grade.name}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-slate-100">
                            <input
                              type="number"
                              step="0.25"
                              min="1.00"
                              max="5.00"
                              className="w-20 p-1 border border-slate-300 rounded text-center text-xs font-mono focus:border-[#1D4ED8] focus:outline-none"
                              placeholder="1.00–5.00"
                              value={grade.midterm || ''}
                              onChange={(e) => handleBulkGradeChange(grade.id, 'midterm', e.target.value)}
                            />
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-slate-100">
                            <input
                              type="number"
                              step="0.25"
                              min="1.00"
                              max="5.00"
                              className="w-20 p-1 border border-slate-300 rounded text-center text-xs font-mono focus:border-[#1D4ED8] focus:outline-none"
                              placeholder="1.00–5.00"
                              value={grade.final || ''}
                              onChange={(e) => handleBulkGradeChange(grade.id, 'final', e.target.value)}
                            />
                          </td>
                          <td className="px-3.5 py-2.5 border-r border-slate-100 text-center font-mono font-bold text-slate-900 bg-slate-50/40">
                            {grade.finalGrade || <span className="text-slate-300 font-normal">—</span>}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-slate-100">
                            <input
                              type="text"
                              placeholder="Note..."
                              className="w-32 p-1 border border-slate-300 rounded text-xs focus:border-[#1D4ED8] focus:outline-none"
                              value={grade.remarks || ''}
                              onChange={(e) => handleBulkRemarksChange(grade.id, e.target.value)}
                            />
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            {passStatus === 'passed' ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                PASSED
                              </span>
                            ) : passStatus === 'failed' ? (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                FAILED
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Bulk Card Inputs (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 font-sans">
                {filteredBulkRows.map((grade) => {
                  const passStatus = getPassStatus(grade.finalGrade);

                  return (
                    <div key={grade.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#1D4ED8] block">
                            {grade.studentId}
                          </span>
                          <h4 className="font-medium text-slate-900 text-xs mt-0.5">
                            {grade.name}
                          </h4>
                        </div>
                        {grade.finalGrade && (
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 text-xs block">
                              Grade: {grade.finalGrade}
                            </span>
                            {passStatus === 'passed' && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                PASSED
                              </span>
                            )}
                            {passStatus === 'failed' && (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                FAILED
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Midterm (1.0–5.0)
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            min="1.00"
                            max="5.00"
                            className="form-control text-xs font-mono text-center py-1.5"
                            placeholder="Midterm"
                            value={grade.midterm || ''}
                            onChange={(e) => handleBulkGradeChange(grade.id, 'midterm', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Final (1.0–5.0)
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            min="1.00"
                            max="5.00"
                            className="form-control text-xs font-mono text-center py-1.5"
                            placeholder="Final"
                            value={grade.final || ''}
                            onChange={(e) => handleBulkGradeChange(grade.id, 'final', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Add remark or note..."
                          className="form-control text-xs py-1"
                          value={grade.remarks || ''}
                          onChange={(e) => handleBulkRemarksChange(grade.id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Entry Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-sans">
                  Review all entered marks before saving draft or submitting.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAllBulk}
                    className="btn-secondary flex items-center gap-1.5 cursor-pointer"
                    disabled={isSaving}
                  >
                    <Save size={13} />
                    <span>{isSaving ? 'Saving...' : 'Save Draft Marks'}</span>
                  </button>
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="btn-primary flex items-center gap-1.5 cursor-pointer"
                    disabled={stats.completed === 0}
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

      {/* ── Add / Edit Grade Modal ─────────── */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddModal(false);
            setEditingGrade(null);
          }}
          title={editingGrade ? 'Edit Grade Record' : 'Add Student Grade'}
          size="lg"
        >
          <div className="space-y-4">
            {/* Student Identification */}
            {editingGrade ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-0.5">Student Record</div>
                <div className="font-heading font-bold text-slate-900 text-sm">{editingGrade.name}</div>
                <div className="text-[11px] text-slate-600 font-mono">{editingGrade.studentId}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledStudents.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Quick Pick From Enrolled Class Roster
                    </label>
                    <select
                      value={selectedStudentDropdown}
                      onChange={(e) => handleSelectStudentFromRoster(e.target.value)}
                      className="form-control text-xs font-semibold text-slate-900 py-1.5 cursor-pointer"
                    >
                      <option value="">-- Choose an Enrolled Student ({enrolledStudents.length} enrolled) --</option>
                      {enrolledStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.user?.name} ({st.student_id_number || `ID: ${st.id}`})
                        </option>
                      ))}
                      <option value="custom">+ Enter New / Custom Student Name</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Student Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setSelectedStudentDropdown('custom');
                        setFormData({ ...formData, name: e.target.value });
                      }}
                      placeholder="e.g., Juan Ramos"
                      className={`form-control text-xs ${formErrors.name ? 'border-rose-400 focus:border-rose-500' : ''}`}
                    />
                    {formErrors.name && (
                      <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Student ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="e.g., 2026-00004"
                      className="form-control text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Course & Section Context */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Subject</span>
                <span className="font-semibold text-slate-800 truncate block">{currentSubject?.code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Section</span>
                <span className="font-semibold text-slate-800 truncate block">{currentSection?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Semester</span>
                <span className="font-semibold text-slate-800 truncate block">{currentTerm?.label}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Academic Year</span>
                <span className="font-semibold text-slate-800 truncate block">{currentSY?.label}</span>
              </div>
            </div>

            {/* Assessment Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Assessment Type
                </label>
                <select
                  value={formData.assessmentType}
                  onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                  className="form-control text-xs py-1.5 cursor-pointer"
                >
                  {ASSESSMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Assessment Name / Description
                </label>
                <input
                  type="text"
                  value={formData.assessmentName}
                  onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                  placeholder="e.g., Prelim Quiz 1 or Final Project"
                  className="form-control text-xs"
                />
              </div>
            </div>

            {/* Raw Score & Weight (Optional Helper) */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Raw Score
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.rawScore}
                  onChange={(e) => setFormData({ ...formData, rawScore: e.target.value })}
                  placeholder="e.g., 85"
                  className="form-control text-xs font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Max Score
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  placeholder="100"
                  className="form-control text-xs font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  step="5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="100"
                  className="form-control text-xs font-mono text-center"
                />
              </div>
            </div>

            {/* Midterm & Final CHED Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Midterm Rating (1.00–5.00)
                  </label>
                  {calculatedRatingFromScore && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, midterm: calculatedRatingFromScore })}
                      className="text-[10px] text-[#1D4ED8] hover:underline font-semibold cursor-pointer"
                    >
                      Use Score ({calculatedRatingFromScore})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.25"
                  min="1.00"
                  max="5.00"
                  value={formData.midterm}
                  onChange={(e) => setFormData({ ...formData, midterm: e.target.value })}
                  placeholder="e.g., 1.50"
                  className={`form-control text-xs font-mono text-center ${formErrors.midterm ? 'border-rose-400' : ''}`}
                />
                {formErrors.midterm && (
                  <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.midterm}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Final Rating (1.00–5.00)
                  </label>
                  {calculatedRatingFromScore && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, final: calculatedRatingFromScore })}
                      className="text-[10px] text-[#1D4ED8] hover:underline font-semibold cursor-pointer"
                    >
                      Use Score ({calculatedRatingFromScore})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.25"
                  min="1.00"
                  max="5.00"
                  value={formData.final}
                  onChange={(e) => setFormData({ ...formData, final: e.target.value })}
                  placeholder="e.g., 1.75"
                  className={`form-control text-xs font-mono text-center ${formErrors.final ? 'border-rose-400' : ''}`}
                />
                {formErrors.final && (
                  <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.final}</p>
                )}
              </div>
            </div>

            {/* Calculated Final Grade Preview */}
            {computedFinalGrade && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Calculated Final Grade (Average)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Midterm {formData.midterm} + Final {formData.final}) ÷ 2
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-slate-900">{computedFinalGrade}</span>
                  {getPassStatus(computedFinalGrade) === 'passed' ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      PASSED
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      FAILED
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Faculty Remarks <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="e.g., Passed make-up exam or active participation..."
                className="form-control text-xs"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingGrade(null);
              }}
              className="btn-secondary cursor-pointer"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveGrade}
              className="btn-primary flex items-center gap-1.5 cursor-pointer"
              disabled={isSaving}
            >
              <Save size={13} />
              <span>{isSaving ? 'Saving...' : editingGrade ? 'Update Grade Record' : 'Save Grade Record'}</span>
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Dialog ─────── */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Grade?"
          message={`Are you sure you want to delete this grade record for ${deleteTarget.name} (${deleteTarget.studentId})? This will permanently remove the record from the database.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isSaving}
        />
      )}

      {/* ── Submit to Registrar Confirmation ─ */}
      {showSubmitConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Submit Official Term Grades"
          message="Are you sure you want to submit these grades to the Office of the University Registrar? Once submitted, official records will be recorded in the database."
          onConfirm={handleSubmitToRegistrar}
          onCancel={() => setShowSubmitConfirm(false)}
          confirmText="Yes, Submit to Registrar"
          cancelText="Cancel"
          type="warning"
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
