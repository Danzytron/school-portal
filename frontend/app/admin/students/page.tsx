'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { KeyRound, Plus, Edit2, Trash2, UserPlus, Users } from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id_number: '',
    course_id: '',
    year_level: '1',
    section_id: '',
    contact_number: '',
    address: '',
    enrollment_status: 'enrolled',
  });

  useEffect(() => {
    fetchLookups();
    fetchStudents();
  }, []);

  const fetchLookups = async () => {
    try {
      const [coursesRes, sectionsRes] = await Promise.all([
        api.get('/admin/courses').catch(() => []),
        api.get('/admin/sections').catch(() => []),
      ]);
      const cList = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
      const sList = Array.isArray(sectionsRes) ? sectionsRes : (sectionsRes?.data || []);
      setCourses(cList);
      setSections(sList);
    } catch (e) {
      console.error('Failed to load courses/sections', e);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students', { per_page: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setStudents(list);
    } catch (err: any) {
      console.error('Failed to fetch students', err);
      setToast({ message: 'Failed to load students from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    const nextNum = String(students.length + 1).padStart(5, '0');
    setFormData({
      name: '',
      email: '',
      student_id_number: `2026-${nextNum}`,
      course_id: courses[0]?.id ? String(courses[0].id) : '1',
      year_level: '1',
      section_id: sections[0]?.id ? String(sections[0].id) : '1',
      contact_number: '',
      address: '',
      enrollment_status: 'enrolled',
    });
    setShowModal(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.user?.name || student.name || '',
      email: student.user?.email || student.email || '',
      student_id_number: student.student_id_number || student.studentId || '',
      course_id: String(student.course_id || student.course?.id || '1'),
      year_level: String(student.year_level || student.year || '1'),
      section_id: String(student.section_id || student.section?.id || '1'),
      contact_number: student.contact_number || '',
      address: student.address || '',
      enrollment_status: student.enrollment_status || 'enrolled',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        student_id_number: formData.student_id_number.trim(),
        course_id: Number(formData.course_id) || 1,
        year_level: Number(formData.year_level) || 1,
        section_id: Number(formData.section_id) || null,
        contact_number: formData.contact_number || null,
        address: formData.address || null,
        enrollment_status: formData.enrollment_status,
      };

      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, payload);
        setToast({ message: `Student '${formData.name}' updated successfully in PostgreSQL.`, type: 'success' });
      } else {
        await api.post('/admin/students', payload);
        setToast({ message: `Student '${formData.name}' created with default password 'roldan2026'.`, type: 'success' });
      }

      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      console.error('Save student failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save student.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/students/${studentToDelete.id}`);
      setToast({ message: `Student '${studentToDelete.user?.name || studentToDelete.name}' removed from database.`, type: 'success' });
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      console.error('Delete student failed', err);
      setToast({ message: err.response?.data?.message || 'Failed to delete student.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (student: any) => {
    try {
      await api.post(`/admin/students/${student.id}/reset-password`);
      setToast({ message: `Password reset to 'roldan2026' for ${student.user?.name || student.name}.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Password reset failed.', type: 'error' });
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const nameMatch = (s.user?.name || s.name || '').toLowerCase().includes(q);
    const idMatch = (s.student_id_number || s.studentId || '').toLowerCase().includes(q);
    const emailMatch = (s.user?.email || s.email || '').toLowerCase().includes(q);
    const courseMatch = !selectedCourse || String(s.course_id || s.course?.id) === selectedCourse;
    const yearMatch = !selectedYear || String(s.year_level || s.year) === selectedYear;
    return (nameMatch || idMatch || emailMatch) && courseMatch && yearMatch;
  });

  const columns = [
    {
      key: 'studentId',
      label: 'Student ID',
      render: (row: any) => (
        <span className="font-mono font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
          {row.student_id_number || row.studentId}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Full Name',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-slate-900">{row.user?.name || row.name}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.user?.email || row.email}</div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Degree Program',
      render: (row: any) => (
        <span className="text-slate-800 font-medium">
          {row.course?.code || (courses.find((c) => c.id === row.course_id)?.code) || 'BSIT'}
        </span>
      ),
    },
    {
      key: 'year',
      label: 'Year Level',
      render: (row: any) => (
        <span className="text-slate-600 font-mono text-xs">
          Year {row.year_level || row.year || 1}
        </span>
      ),
    },
    {
      key: 'section',
      label: 'Section',
      render: (row: any) => (
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
          {row.section?.name || (sections.find((s) => s.id === row.section_id)?.name) || 'BSIT-1A'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => (
        <StatusBadge status={row.enrollment_status || row.status || 'enrolled'} />
      ),
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => handleResetPassword(row)}
        title="Reset password to roldan2026"
        className="p-1 rounded hover:bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
      >
        <KeyRound size={12} />
        <span>Reset Pass</span>
      </button>
      <button
        onClick={() => openEditModal(row)}
        className="p-1 rounded hover:bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
      >
        <Edit2 size={12} />
        <span>Edit</span>
      </button>
      <button
        onClick={() => {
          setStudentToDelete(row);
          setShowDeleteConfirm(true);
        }}
        className="p-1 rounded hover:bg-red-50 text-red-600 border border-red-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
      >
        <Trash2 size={12} />
        <span>Delete</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Student Information Management"
        subtitle="Manage official student registry, program allocations, and account access credentials."
        badge="Registrar Module"
        action={{
          label: 'Add Student Record',
          onClick: openAddModal,
          icon: UserPlus,
        }}
      />

      {/* Filter Controls */}
      <div className="bg-white p-4 border border-slate-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-1/2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search student by name, ID number, or email..." />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#1D4ED8]"
          >
            <option value="">All Degree Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.code} – {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#1D4ED8]"
          >
            <option value="">All Year Levels</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Retrieving student registry from PostgreSQL database..." />
      ) : (
        <div className="panel overflow-hidden">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-[#1D4ED8]" />
              <span>Official Student Roster ({filteredStudents.length} Records)</span>
            </div>
          </div>
          <DataTable columns={columns} data={filteredStudents} actions={actions} />
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        title={editingStudent ? 'Edit Student Information' : 'Enroll New Student Record'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Student ID Number *</label>
              <input
                type="text"
                required
                value={formData.student_id_number}
                onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                placeholder="2026-00001"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                placeholder="Juan Dela Cruz"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Institutional Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                placeholder="student@schoolportal.test"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                placeholder="+63 912 345 6789"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Degree Program *</label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} – {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Year Level *</label>
              <select
                required
                value={formData.year_level}
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] bg-white"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Class Section *</label>
              <select
                value={formData.section_id}
                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] bg-white"
              >
                <option value="">No Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
              placeholder="Cebu City, Philippines"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Enrollment Status</label>
            <select
              value={formData.enrollment_status}
              onChange={(e) => setFormData({ ...formData, enrollment_status: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8] bg-white"
            >
              <option value="enrolled">Enrolled</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-1.5"
            >
              {submitting ? 'Saving to Database...' : editingStudent ? 'Update Record' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => !submitting && setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Permanently Remove Student Record"
        message={`Are you sure you want to permanently delete '${studentToDelete?.user?.name || studentToDelete?.name}' (${studentToDelete?.student_id_number || studentToDelete?.studentId}) from the PostgreSQL database? This action cannot be undone.`}
        confirmText={submitting ? 'Deleting...' : 'Delete from Database'}
        variant="danger"
      />
    </div>
  );
}
