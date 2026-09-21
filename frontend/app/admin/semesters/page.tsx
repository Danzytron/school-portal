'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, CheckCircle, Calendar } from 'lucide-react';

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '1st Semester',
    school_year_id: '1',
    start_date: '2025-08-04',
    end_date: '2025-12-19',
    is_current: false,
  });

  useEffect(() => {
    fetchSchoolYears();
    fetchSemesters();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const res = await api.get('/admin/school-years').catch(() => []);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSchoolYears(list);
    } catch (e) {
      console.error('Failed to load school years', e);
    }
  };

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/semesters');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSemesters(list);
    } catch (err: any) {
      console.error('Failed to fetch semesters', err);
      setToast({ message: 'Failed to load semesters from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSemester(null);
    setFormData({
      name: '1st Semester',
      school_year_id: schoolYears[0]?.id ? String(schoolYears[0].id) : '1',
      start_date: '2025-08-04',
      end_date: '2025-12-19',
      is_current: false,
    });
    setShowModal(true);
  };

  const openEditModal = (sem: any) => {
    setEditingSemester(sem);
    setFormData({
      name: sem.name || '1st Semester',
      school_year_id: String(sem.school_year_id || 1),
      start_date: sem.start_date || '',
      end_date: sem.end_date || '',
      is_current: !!sem.is_current,
    });
    setShowModal(true);
  };

  const handleSetCurrent = async (sem: any) => {
    setSubmitting(true);
    try {
      await api.put(`/admin/semesters/${sem.id}`, { is_current: true });
      setToast({ message: `"${sem.name}" is now set as the ACTIVE CURRENT semester.`, type: 'success' });
      await fetchSemesters();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update active semester.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        school_year_id: parseInt(formData.school_year_id) || 1,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_current: formData.is_current,
      };

      if (editingSemester) {
        await api.put(`/admin/semesters/${editingSemester.id}`, payload);
        setToast({ message: 'Academic semester updated successfully.', type: 'success' });
      } else {
        await api.post('/admin/semesters', payload);
        setToast({ message: 'Academic semester created successfully.', type: 'success' });
      }
      setShowModal(false);
      await fetchSemesters();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save semester.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!semesterToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/semesters/${semesterToDelete.id}`);
      setToast({ message: 'Academic semester deleted successfully.', type: 'success' });
      setShowDeleteConfirm(false);
      setSemesterToDelete(null);
      await fetchSemesters();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete semester.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Academic Semester',
      render: (row: any) => (
        <div className="font-semibold text-brand-primary flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'schoolYear',
      label: 'School Year',
      render: (row: any) => (
        <span className="font-medium text-slate-700">
          {row.school_year ? `SY ${row.school_year.year_start}-${row.school_year.year_end}` : 'SY 2025-2026'}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Term Start',
      render: (row: any) => <span className="text-xs text-slate-600">{row.start_date || 'N/A'}</span>,
    },
    {
      key: 'endDate',
      label: 'Term End',
      render: (row: any) => <span className="text-xs text-slate-600">{row.end_date || 'N/A'}</span>,
    },
    {
      key: 'status',
      label: 'Current Term',
      render: (row: any) => (
        row.is_current ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3" />
            <span>Active Semester</span>
          </span>
        ) : (
          <button
            onClick={() => handleSetCurrent(row)}
            disabled={submitting}
            className="text-xs text-slate-500 hover:text-brand-primary hover:underline font-medium"
          >
            Set as Current
          </button>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-brand-primary hover:bg-slate-100 rounded transition-colors"
            title="Edit Term"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSemesterToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Term"
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
        title="Academic Periods & Term Management"
        subtitle="Configure active school years, semester start/end dates, and encoding periods"
        action={{
          label: 'Add Academic Term',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAddModal,
        }}
      />

      {loading ? (
        <LoadingState message="Loading academic terms from database..." />
      ) : (
        <DataTable columns={columns} data={semesters} emptyMessage="No academic semesters found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingSemester ? 'Edit Academic Term' : 'Add New Academic Term'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Semester Term"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              options={[
                { value: '1st Semester', label: '1st Semester' },
                { value: '2nd Semester', label: '2nd Semester' },
                { value: 'Summer Term', label: 'Summer Term' },
              ]}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Term Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              <FormInput
                label="Term End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_current"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary"
              />
              <label htmlFor="is_current" className="text-sm font-medium text-slate-700">
                Set as Active Current Semester
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
                {submitting ? 'Saving...' : editingSemester ? 'Save Changes' : 'Create Term'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && semesterToDelete && (
        <ConfirmDialog
          title="Delete Academic Term"
          message={`Are you sure you want to delete "${semesterToDelete.name}"?`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Term'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSemesterToDelete(null);
          }}
        />
      )}
    </div>
  );
}
