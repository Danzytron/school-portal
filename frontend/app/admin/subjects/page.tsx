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
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    units: '3',
    course_id: '',
    year_level: '1',
    semester: '1',
    is_active: true,
  });

  useEffect(() => {
    fetchLookups();
    fetchSubjects();
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

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subjects', { per_page: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSubjects(list);
    } catch (err: any) {
      console.error('Failed to fetch subjects', err);
      setToast({ message: 'Failed to load subjects from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      units: '3',
      course_id: courses[0]?.id ? String(courses[0].id) : '1',
      year_level: '1',
      semester: '1',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (subject: any) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code || '',
      name: subject.name || '',
      units: String(subject.units || 3),
      course_id: String(subject.course_id || subject.course?.id || courses[0]?.id || '1'),
      year_level: String(subject.year_level || 1),
      semester: String(subject.semester || 1),
      is_active: subject.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      setToast({ message: 'Subject code and name are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        units: parseInt(formData.units) || 3,
        course_id: parseInt(formData.course_id),
        year_level: parseInt(formData.year_level),
        semester: parseInt(formData.semester),
        is_active: formData.is_active,
      };

      if (editingSubject) {
        await api.put(`/admin/subjects/${editingSubject.id}`, payload);
        setToast({ message: `Subject "${payload.code}" updated successfully.`, type: 'success' });
      } else {
        await api.post('/admin/subjects', payload);
        setToast({ message: `Subject "${payload.code}" created successfully.`, type: 'success' });
      }
      setShowModal(false);
      await fetchSubjects();
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save subject.');
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/subjects/${subjectToDelete.id}`);
      setToast({ message: `Subject "${subjectToDelete.code}" deleted successfully.`, type: 'success' });
      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
      await fetchSubjects();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete subject. It may be attached to existing schedules.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const q = search.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const code = (s.code || '').toLowerCase();
    const matchesSearch = name.includes(q) || code.includes(q);
    const matchesCourse = !selectedCourse || String(s.course_id) === selectedCourse;
    const matchesYear = !selectedYear || String(s.year_level) === selectedYear;
    return matchesSearch && matchesCourse && matchesYear;
  });

  const columns = [
    {
      key: 'code',
      label: 'Subject Code',
      render: (row: any) => (
        <div className="font-semibold text-brand-primary flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.code}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Subject Description',
      render: (row: any) => <span className="font-medium text-slate-800">{row.name}</span>,
    },
    {
      key: 'units',
      label: 'Units',
      render: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          {row.units} {row.units === 1 ? 'Unit' : 'Units'}
        </span>
      ),
    },
    {
      key: 'course',
      label: 'Course / Program',
      render: (row: any) => (
        <span className="text-xs font-medium text-slate-600">
          {row.course?.code ? `${row.course.code} - ${row.course.name}` : (courses.find(c => c.id === row.course_id)?.code || 'General Subject')}
        </span>
      ),
    },
    {
      key: 'yearLevel',
      label: 'Year & Term',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.year_level ? `${row.year_level}${row.year_level === 1 ? 'st' : row.year_level === 2 ? 'nd' : row.year_level === 3 ? 'rd' : 'th'} Year` : '1st Year'}
          {' • '}
          {row.semester ? `${row.semester}${row.semester === 1 ? 'st' : 'nd'} Sem` : '1st Sem'}
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
            title="Edit Subject"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubjectToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Subject"
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
        title="Subject Master Management"
        subtitle="Manage curriculum subjects, credit units, and course offerings"
        action={{
          label: 'Add New Subject',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by subject code or name..." />
          <FormSelect
            label=""
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            options={[{ value: '', label: 'All Degree Courses' }, ...courses.map(c => ({ value: String(c.id), label: `${c.code} - ${c.name}` }))]}
          />
          <FormSelect
            label=""
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={[
              { value: '', label: 'All Year Levels' },
              { value: '1', label: '1st Year' },
              { value: '2', label: '2nd Year' },
              { value: '3', label: '3rd Year' },
              { value: '4', label: '4th Year' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading subjects from database..." />
      ) : (
        <DataTable columns={columns} data={filteredSubjects} emptyMessage="No subjects found matching your criteria." />
      )}

      {/* Add/Edit Subject Modal */}
      {showModal && (
        <Modal
          title={editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add New Subject'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Subject Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. IT301"
                required
              />
              <FormInput
                label="Credit Units"
                type="number"
                min="1"
                max="12"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                required
              />
            </div>

            <FormInput
              label="Subject Description / Title"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Database Management Systems"
              required
            />

            <FormSelect
              label="Associated Course / Program"
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
              <FormSelect
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                options={[
                  { value: '1', label: '1st Semester' },
                  { value: '2', label: '2nd Semester' },
                  { value: '3', label: 'Summer Term' },
                ]}
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
                Active Subject (available for enrollment & schedules)
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
                {submitting ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && subjectToDelete && (
        <ConfirmDialog
          title="Delete Subject"
          message={`Are you sure you want to delete "${subjectToDelete.code} - ${subjectToDelete.name}"? This action cannot be undone.`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Subject'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSubjectToDelete(null);
          }}
        />
      )}
    </div>
  );
}
