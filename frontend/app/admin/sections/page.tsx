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
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

export default function SectionManagement() {
  const [sections, setSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    course_id: '',
    year_level: '1',
    max_students: '40',
    is_active: true,
  });

  useEffect(() => {
    fetchLookups();
    fetchSections();
  }, []);

  const fetchLookups = async () => {
    try {
      const coursesRes = await api.get('/admin/courses');
      const cList = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
      setCourses(cList);
    } catch (e) {
      console.error('Failed to load courses', e);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sections', { per_page: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSections(list);
    } catch (err: any) {
      console.error('Failed to fetch sections', err);
      setToast({ message: 'Failed to load sections from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSection(null);
    setFormData({
      name: '',
      course_id: courses[0]?.id ? String(courses[0].id) : '1',
      year_level: '1',
      max_students: '40',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (section: any) => {
    setEditingSection(section);
    setFormData({
      name: section.name || '',
      course_id: String(section.course_id || section.course?.id || courses[0]?.id || '1'),
      year_level: String(section.year_level || 1),
      max_students: String(section.max_students || 40),
      is_active: section.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setToast({ message: 'Section name is required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        course_id: parseInt(formData.course_id),
        year_level: parseInt(formData.year_level),
        max_students: parseInt(formData.max_students) || 40,
        is_active: formData.is_active,
      };

      if (editingSection) {
        await api.put(`/admin/sections/${editingSection.id}`, payload);
        setToast({ message: `Section "${payload.name}" updated successfully.`, type: 'success' });
      } else {
        await api.post('/admin/sections', payload);
        setToast({ message: `Section "${payload.name}" created successfully.`, type: 'success' });
      }
      setShowModal(false);
      await fetchSections();
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save section.');
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!sectionToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/sections/${sectionToDelete.id}`);
      setToast({ message: `Section "${sectionToDelete.name}" deleted successfully.`, type: 'success' });
      setShowDeleteConfirm(false);
      setSectionToDelete(null);
      await fetchSections();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete section. It may have students or schedules assigned.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSections = sections.filter(s => {
    const q = search.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const matchesSearch = name.includes(q);
    const matchesCourse = !selectedCourse || String(s.course_id) === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const columns = [
    {
      key: 'name',
      label: 'Section Name',
      render: (row: any) => (
        <div className="font-semibold text-brand-primary flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-400" />
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Degree Course',
      render: (row: any) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.course?.code ? `${row.course.code} - ${row.course.name}` : (courses.find(c => c.id === row.course_id)?.code || 'General')}
        </span>
      ),
    },
    {
      key: 'yearLevel',
      label: 'Year Level',
      render: (row: any) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.year_level ? `${row.year_level}${row.year_level === 1 ? 'st' : row.year_level === 2 ? 'nd' : row.year_level === 3 ? 'rd' : 'th'} Year` : '1st Year'}
        </span>
      ),
    },
    {
      key: 'maxStudents',
      label: 'Student Capacity',
      render: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Max {row.max_students || 40} Students
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
            title="Edit Section"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSectionToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Section"
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
        title="Class Section Management"
        subtitle="Manage student class sections, maximum capacities, and course allocations"
        action={{
          label: 'Add New Section',
          icon: Plus,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by section name (e.g. BSIT 3-A)..." />
          <FormSelect
            label=""
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            options={[{ value: '', label: 'All Degree Courses' }, ...courses.map(c => ({ value: String(c.id), label: `${c.code} - ${c.name}` }))]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading class sections from database..." />
      ) : (
        <DataTable columns={columns} data={filteredSections} emptyMessage="No class sections found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingSection ? `Edit Section: ${editingSection.name}` : 'Add New Class Section'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Section Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. BSIT 3-A"
              required
            />

            <FormSelect
              label="Degree Course"
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              options={courses.map(c => ({ value: String(c.id), label: `${c.code} - ${c.name}` }))}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Year Level"
                value={formData.year_level}
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                options={[
                  { value: '1', label: '1st Year' },
                  { value: '2', label: '2nd Year' },
                  { value: '3', label: '3rd Year' },
                  { value: '4', label: '4th Year' },
                ]}
                required
              />
              <FormInput
                label="Max Student Capacity"
                type="number"
                min="5"
                max="100"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Active Section (available for student admission & enrollment)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-secondary rounded-md font-medium text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingSection ? 'Save Changes' : 'Create Section'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && sectionToDelete && (
        <ConfirmDialog
          title="Delete Section"
          message={`Are you sure you want to delete "${sectionToDelete.name}"? This action cannot be undone.`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Section'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSectionToDelete(null);
          }}
        />
      )}
    </div>
  );
}

