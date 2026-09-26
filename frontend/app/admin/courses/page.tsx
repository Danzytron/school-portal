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
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Studies',
    duration_years: '4',
    description: '',
    is_active: true,
  });

  const departmentOptions = [
    { value: 'Computer Studies', label: 'College of Computer Studies' },
    { value: 'Business Administration', label: 'College of Business Administration' },
    { value: 'Accountancy', label: 'College of Accountancy' },
    { value: 'Education', label: 'College of Education' },
    { value: 'Arts and Sciences', label: 'College of Arts and Sciences' },
    { value: 'Senior High School', label: 'Senior High School Dept.' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses', { per_page: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setCourses(list);
    } catch (err: any) {
      console.error('Failed to fetch courses', err);
      setToast({ message: 'Failed to load degree programs from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      department: 'Computer Studies',
      duration_years: '4',
      description: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      department: course.department || 'Computer Studies',
      duration_years: String(course.duration_years || 4),
      description: course.description || '',
      is_active: course.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      setToast({ message: 'Course code and name are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        department: formData.department,
        duration_years: parseInt(formData.duration_years) || 4,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      };

      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, payload);
        setToast({ message: `Degree course "${payload.code}" updated successfully.`, type: 'success' });
      } else {
        await api.post('/admin/courses', payload);
        setToast({ message: `Degree course "${payload.code}" created successfully.`, type: 'success' });
      }
      setShowModal(false);
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save degree course.');
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/courses/${courseToDelete.id}`);
      setToast({ message: `Degree course "${courseToDelete.code}" deleted successfully.`, type: 'success' });
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
      await fetchCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete course. It may have enrolled students or registered subjects.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const q = search.toLowerCase();
    const name = (c.name || '').toLowerCase();
    const code = (c.code || '').toLowerCase();
    const matchesSearch = name.includes(q) || code.includes(q);
    const matchesDept = !selectedDept || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const columns = [
    {
      key: 'code',
      label: 'Program Code',
      render: (row: any) => (
        <div className="font-semibold text-brand-primary flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-brand-gold" />
          <span>{row.code}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Degree Name / Description',
      render: (row: any) => <span className="font-medium text-slate-800">{row.name}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (row: any) => (
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          {row.department || 'Computer Studies'}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Program Duration',
      render: (row: any) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.duration_years || 4} Years Curriculum
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.is_active !== false ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-primary hover:bg-slate-100 rounded transition-colors"
            title="Edit Program"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCourseToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Program"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Degree Course Management"
        subtitle="Manage academic degree programs, departments, and curricula"
        action={{
          label: 'Add Degree Program',
          icon: Plus,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by course code or degree title..." />
          <FormSelect
            label=""
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={[{ value: '', label: 'All Academic Departments' }, ...departmentOptions]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading degree programs from database..." />
      ) : (
        <DataTable columns={columns} data={filteredCourses} emptyMessage="No degree programs found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingCourse ? `Edit Program: ${editingCourse.code}` : 'Add New Degree Program'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Program Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. BSIT"
                required
              />
              <FormSelect
                label="Duration (Years)"
                value={formData.duration_years}
                onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
                options={[
                  { value: '2', label: '2 Years (Associate / Tech-Voc)' },
                  { value: '4', label: '4 Years (Bachelor Degree)' },
                  { value: '5', label: '5 Years (Engineering / Honors)' },
                ]}
                required
              />
            </div>

            <FormInput
              label="Degree Title / Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bachelor of Science in Information Technology"
              required
            />

            <FormSelect
              label="Academic Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departmentOptions}
              required
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Active Program (available for student admission & enrollment)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Program'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && courseToDelete && (
        <ConfirmDialog
          title="Delete Degree Program"
          message={`Are you sure you want to delete "${courseToDelete.code} - ${courseToDelete.name}"? This action cannot be undone.`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Program'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setCourseToDelete(null);
          }}
        />
      )}
    </div>
  );
}

