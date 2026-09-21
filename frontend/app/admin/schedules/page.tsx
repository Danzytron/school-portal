'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import SearchBar from '@/components/ui/SearchBar';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    subject_id: '',
    section_id: '',
    teacher_id: '',
    room_id: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '11:00',
  });

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
  ];

  useEffect(() => {
    fetchLookups();
    fetchSchedules();
  }, []);

  const fetchLookups = async () => {
    try {
      const [subsRes, secsRes, teachsRes, rmsRes] = await Promise.all([
        api.get('/admin/subjects').catch(() => []),
        api.get('/admin/sections').catch(() => []),
        api.get('/admin/teachers').catch(() => []),
        api.get('/admin/rooms').catch(() => []),
      ]);

      setSubjects(Array.isArray(subsRes) ? subsRes : (subsRes?.data || []));
      setSections(Array.isArray(secsRes) ? secsRes : (secsRes?.data || []));
      setTeachers(Array.isArray(teachsRes) ? teachsRes : (teachsRes?.data || []));
      setRooms(Array.isArray(rmsRes) ? rmsRes : (rmsRes?.data || []));
    } catch (e) {
      console.error('Failed to load schedule lookups', e);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/schedules', { per_page: 100 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSchedules(list);
    } catch (err: any) {
      console.error('Failed to fetch schedules', err);
      setToast({ message: 'Failed to load class schedules from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      subject_id: subjects[0]?.id ? String(subjects[0].id) : '1',
      section_id: sections[0]?.id ? String(sections[0].id) : '1',
      teacher_id: teachers[0]?.id ? String(teachers[0].id) : '1',
      room_id: rooms[0]?.id ? String(rooms[0].id) : '1',
      day_of_week: 'Monday',
      start_time: '08:00',
      end_time: '11:00',
    });
    setShowModal(true);
  };

  const openEditModal = (sch: any) => {
    setEditingSchedule(sch);
    setFormData({
      subject_id: String(sch.subject_id || sch.subject?.id || subjects[0]?.id || '1'),
      section_id: String(sch.section_id || sch.section?.id || sections[0]?.id || '1'),
      teacher_id: String(sch.teacher_id || sch.teacher?.id || teachers[0]?.id || '1'),
      room_id: String(sch.room_id || sch.room?.id || rooms[0]?.id || '1'),
      day_of_week: sch.day_of_week || 'Monday',
      start_time: sch.start_time ? sch.start_time.substring(0, 5) : '08:00',
      end_time: sch.end_time ? sch.end_time.substring(0, 5) : '11:00',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        subject_id: parseInt(formData.subject_id),
        section_id: parseInt(formData.section_id),
        teacher_id: parseInt(formData.teacher_id),
        room_id: parseInt(formData.room_id),
        day_of_week: formData.day_of_week,
        start_time: formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time,
      };

      if (editingSchedule) {
        await api.put(`/admin/schedules/${editingSchedule.id}`, payload);
        setToast({ message: 'Class schedule updated successfully.', type: 'success' });
      } else {
        await api.post('/admin/schedules', payload);
        setToast({ message: 'Class schedule created successfully.', type: 'success' });
      }
      setShowModal(false);
      await fetchSchedules();
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save schedule.');
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/schedules/${scheduleToDelete.id}`);
      setToast({ message: 'Class schedule deleted successfully.', type: 'success' });
      setShowDeleteConfirm(false);
      setScheduleToDelete(null);
      await fetchSchedules();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete schedule.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSchedules = schedules.filter(s => {
    const q = search.toLowerCase();
    const subCode = (s.subject?.code || '').toLowerCase();
    const subName = (s.subject?.name || '').toLowerCase();
    const secName = (s.section?.name || '').toLowerCase();
    const teacherName = (s.teacher?.user?.name || '').toLowerCase();
    const roomName = (s.room?.name || '').toLowerCase();
    
    const matchesSearch = subCode.includes(q) || subName.includes(q) || secName.includes(q) || teacherName.includes(q) || roomName.includes(q);
    const matchesDay = !selectedDay || s.day_of_week === selectedDay;
    const matchesSec = !selectedSection || String(s.section_id) === selectedSection;

    return matchesSearch && matchesDay && matchesSec;
  });

  const columns = [
    {
      key: 'subject',
      label: 'Subject Code & Name',
      render: (row: any) => (
        <div>
          <div className="font-semibold text-brand-primary flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.subject?.code || 'N/A'}</span>
          </div>
          <div className="text-xs text-slate-600 truncate max-w-xs">{row.subject?.name || ''}</div>
        </div>
      ),
    },
    {
      key: 'section',
      label: 'Class Section',
      render: (row: any) => (
        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.section?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'teacher',
      label: 'Instructor / Faculty',
      render: (row: any) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.teacher?.user?.name || 'Faculty Member'}</span>
        </div>
      ),
    },
    {
      key: 'day_time',
      label: 'Day & Time Slot',
      render: (row: any) => (
        <div>
          <div className="text-xs font-semibold text-brand-secondary flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.day_of_week}</span>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.start_time?.substring(0, 5)} - {row.end_time?.substring(0, 5)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'room',
      label: 'Room Facility',
      render: (row: any) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{row.room?.name || 'N/A'}</span>
          <span className="text-slate-400">({row.room?.building || 'Main Campus'})</span>
        </div>
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
            title="Edit Schedule"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setScheduleToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Schedule"
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
        title="Master Class Schedule Management"
        subtitle="Manage academic timetable allocations, instructor teaching loads, and room facility schedules"
        action={{
          label: 'Create Class Schedule',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by subject, teacher, section, room..." />
          <FormSelect
            label=""
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            options={[{ value: '', label: 'All Days of Week' }, ...dayOptions]}
          />
          <FormSelect
            label=""
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            options={[{ value: '', label: 'All Class Sections' }, ...sections.map(s => ({ value: String(s.id), label: s.name }))]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading timetable schedules from database..." />
      ) : (
        <DataTable columns={columns} data={filteredSchedules} emptyMessage="No class schedules found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingSchedule ? 'Edit Class Schedule' : 'Create New Class Schedule'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Subject Offering"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              options={subjects.map(s => ({ value: String(s.id), label: `${s.code} - ${s.name} (${s.units || 3} units)` }))}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Class Section"
                value={formData.section_id}
                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                options={sections.map(s => ({ value: String(s.id), label: s.name }))}
                required
              />
              <FormSelect
                label="Assigned Teacher"
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                options={teachers.map(t => ({ value: String(t.id), label: t.user?.name || t.name || `Teacher #${t.id}` }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Room Facility"
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                options={rooms.map(r => ({ value: String(r.id), label: `${r.name} (${r.building || 'Campus'}) - ${r.type || 'Lecture'}` }))}
                required
              />
              <FormSelect
                label="Day of Week"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                options={dayOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              <FormInput
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
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
                {submitting ? 'Saving...' : editingSchedule ? 'Save Changes' : 'Schedule Class'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && scheduleToDelete && (
        <ConfirmDialog
          title="Delete Class Schedule"
          message={`Are you sure you want to remove the schedule for ${scheduleToDelete.subject?.code || 'this subject'} on ${scheduleToDelete.day_of_week}?`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Schedule'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setScheduleToDelete(null);
          }}
        />
      )}
    </div>
  );
}
