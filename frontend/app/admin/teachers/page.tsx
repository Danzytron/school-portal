'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { UserCheck, Plus, Edit2, Trash2, GraduationCap, Building2 } from 'lucide-react';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employee_id: '',
    department: 'College of Information Technology',
    specialization: 'Web Systems & Distributed Databases',
    contact_number: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/teachers', { per_page: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setTeachers(list);
    } catch (err: any) {
      console.error('Failed to fetch teachers', err);
      setToast({ message: 'Failed to retrieve faculty directory.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    const nextNum = String(teachers.length + 1).padStart(3, '0');
    setFormData({
      name: '',
      email: '',
      employee_id: `FAC-2026-${nextNum}`,
      department: 'College of Information Technology',
      specialization: 'Web Systems & Software Architecture',
      contact_number: '',
    });
    setShowModal(true);
  };

  const openEditModal = (t: any) => {
    setEditingTeacher(t);
    setFormData({
      name: t.user?.name || t.name || '',
      email: t.user?.email || t.email || '',
      employee_id: t.employee_id || t.empId || '',
      department: t.department || 'College of Information Technology',
      specialization: t.specialization || '',
      contact_number: t.contact_number || '',
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
        employee_id: formData.employee_id.trim(),
        department: formData.department.trim(),
        specialization: formData.specialization.trim(),
        contact_number: formData.contact_number || null,
      };

      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, payload);
        setToast({ message: `Faculty profile '${formData.name}' updated successfully in PostgreSQL.`, type: 'success' });
      } else {
        await api.post('/admin/teachers', payload);
        setToast({ message: `Faculty member '${formData.name}' created with default password 'roldan2026'.`, type: 'success' });
      }

      setShowModal(false);
      fetchTeachers();
    } catch (err: any) {
      console.error('Save teacher failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save faculty record.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/teachers/${teacherToDelete.id}`);
      setToast({ message: `Faculty member '${teacherToDelete.user?.name || teacherToDelete.name}' deleted from database.`, type: 'success' });
      setShowDeleteConfirm(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (err: any) {
      console.error('Delete teacher failed', err);
      setToast({ message: err.response?.data?.message || 'Failed to delete faculty record.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    const name = t.user?.name || t.name || '';
    const empId = t.employee_id || t.empId || '';
    const email = t.user?.email || t.email || '';
    const matchesSearch = name.toLowerCase().includes(q) || empId.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    const matchesDept = !selectedDept || (t.department || '').toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const columns = [
    {
      key: 'empId',
      label: 'Employee ID',
      render: (row: any) => (
        <span className="font-mono font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 text-xs">
          {row.employee_id || row.empId}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Faculty Name & Credentials',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-slate-900">{row.user?.name || row.name}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.user?.email || row.email}</div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department / College',
      render: (row: any) => (
        <span className="text-slate-800 font-medium text-xs">
          {row.department || 'College of Information Technology'}
        </span>
      ),
    },
    {
      key: 'specialization',
      label: 'Academic Specialization',
      render: (row: any) => (
        <span className="text-slate-600 text-xs">
          {row.specialization || 'Computer Science & Software Eng.'}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row: any) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {row.contact_number || '+63 917 555 0192'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => (
        <StatusBadge status={row.user?.is_active !== false ? 'Active' : 'Inactive'} />
      ),
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => openEditModal(row)}
        className="p-1 rounded hover:bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
      >
        <Edit2 size={12} />
        <span>Edit</span>
      </button>
      <button
        onClick={() => {
          setTeacherToDelete(row);
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
        title="Faculty & Instructional Staff Management"
        subtitle="Maintain official faculty registry, instructional appointments, and department assignments."
        badge="Academic Personnel"
        action={{
          label: 'Add Faculty Member',
          onClick: openAddModal,
          icon: Plus,
        }}
      />

      {/* Filter Controls */}
      <div className="bg-white p-4 border border-slate-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-1/2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, employee ID, or email..." />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#1D4ED8] w-full sm:w-auto"
          >
            <option value="">All Academic Departments</option>
            <option value="Information Technology">College of IT</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Accountancy">Business & Accountancy</option>
            <option value="Education">College of Education</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Retrieving faculty roster from PostgreSQL database..." />
      ) : (
        <div className="panel overflow-hidden">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <GraduationCap size={15} className="text-[#1D4ED8]" />
              <span>Official Faculty Roster ({filteredTeachers.length} Members)</span>
            </div>
          </div>
          <DataTable columns={columns} data={filteredTeachers} actions={actions} />
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        title={editingTeacher ? 'Edit Faculty Record' : 'Appoint New Faculty Member'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                placeholder="FAC-2026-001"
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
                placeholder="Prof. Justin Beiber"
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
                placeholder="teacher@schoolportal.test"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                placeholder="+63 917 555 0192"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Academic Department / College *</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
              placeholder="College of Information Technology"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Field of Specialization</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
              placeholder="Web Systems & Distributed Database Architecture"
            />
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
              {submitting ? 'Saving to Database...' : editingTeacher ? 'Update Faculty Profile' : 'Appoint Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => !submitting && setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Remove Faculty Member"
        message={`Are you sure you want to permanently delete '${teacherToDelete?.user?.name || teacherToDelete?.name}' from the PostgreSQL database? This action will also delete the associated user login.`}
        confirmText={submitting ? 'Deleting...' : 'Delete from Database'}
        variant="danger"
      />
    </div>
  );
}
