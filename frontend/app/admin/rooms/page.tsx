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
import { Plus, Edit2, Trash2, Building } from 'lucide-react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    building: 'Main Academic Building',
    floor: '1',
    capacity: '40',
    type: 'Lecture',
    is_active: true,
  });

  const facilityTypes = [
    { value: 'Lecture', label: 'Lecture Hall / Classroom' },
    { value: 'Laboratory', label: 'Computer / Science Laboratory' },
    { value: 'Auditorium', label: 'Auditorium / Theatre' },
    { value: 'Seminar Room', label: 'Seminar / Conference Room' },
    { value: 'Workshop', label: 'Workshop / Skills Lab' },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/rooms', { per_page: 50 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setRooms(list);
    } catch (err: any) {
      console.error('Failed to fetch rooms', err);
      setToast({ message: 'Failed to load rooms from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      building: 'Main Academic Building',
      floor: '1',
      capacity: '40',
      type: 'Lecture',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (room: any) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      building: room.building || 'Main Academic Building',
      floor: String(room.floor || 1),
      capacity: String(room.capacity || 40),
      type: room.type || 'Lecture',
      is_active: room.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setToast({ message: 'Room name is required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        building: formData.building.trim(),
        floor: formData.floor,
        capacity: parseInt(formData.capacity) || 40,
        type: formData.type,
        is_active: formData.is_active,
      };

      if (editingRoom) {
        await api.put(`/admin/rooms/${editingRoom.id}`, payload);
        setToast({ message: `Room "${payload.name}" updated successfully.`, type: 'success' });
      } else {
        await api.post('/admin/rooms', payload);
        setToast({ message: `Room "${payload.name}" created successfully.`, type: 'success' });
      }
      setShowModal(false);
      await fetchRooms();
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save room.');
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/rooms/${roomToDelete.id}`);
      setToast({ message: `Room "${roomToDelete.name}" deleted successfully.`, type: 'success' });
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
      await fetchRooms();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete room. It may be assigned to class schedules.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const q = search.toLowerCase();
    const name = (r.name || '').toLowerCase();
    const bldg = (r.building || '').toLowerCase();
    const matchesSearch = name.includes(q) || bldg.includes(q);
    const matchesType = !selectedType || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'name',
      label: 'Room Name / ID',
      render: (row: any) => (
        <div className="font-semibold text-brand-primary flex items-center gap-1.5">
          <Building className="w-4 h-4 text-slate-400" />
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'building',
      label: 'Building Location',
      render: (row: any) => <span className="font-medium text-slate-800">{row.building || 'Main Campus'}</span>,
    },
    {
      key: 'floor',
      label: 'Floor',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.floor ? `${row.floor}${row.floor == 1 ? 'st' : row.floor == 2 ? 'nd' : row.floor == 3 ? 'rd' : 'th'} Floor` : '1st Floor'}
        </span>
      ),
    },
    {
      key: 'capacity',
      label: 'Seating Capacity',
      render: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          {row.capacity || 40} Seats
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Facility Type',
      render: (row: any) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          row.type === 'Laboratory' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {row.type || 'Lecture'}
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
            title="Edit Room"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setRoomToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Room"
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
        title="Classroom & Laboratory Facilities"
        subtitle="Manage campus classrooms, computer laboratories, and lecture hall capacities"
        action={{
          label: 'Add New Room',
          icon: <Plus className="w-4 h-4" />,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by room name or building location..." />
          <FormSelect
            label=""
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={[{ value: '', label: 'All Facility Types' }, ...facilityTypes]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading room directory from database..." />
      ) : (
        <DataTable columns={columns} data={filteredRooms} emptyMessage="No classrooms or laboratories found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingRoom ? `Edit Room: ${editingRoom.name}` : 'Add New Facility / Room'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Room Name / Identifier"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. ComLab 1 or Room 301"
                required
              />
              <FormSelect
                label="Facility Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={facilityTypes}
                required
              />
            </div>

            <FormInput
              label="Building Location"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="e.g. IT Computer Center or Main Academic Bldg"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Floor Level"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="e.g. 1, 2, 3"
                required
              />
              <FormInput
                label="Seating Capacity"
                type="number"
                min="5"
                max="500"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                Active Facility (available for scheduling classes)
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
                {submitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && roomToDelete && (
        <ConfirmDialog
          title="Delete Facility"
          message={`Are you sure you want to delete "${roomToDelete.name}"? This action cannot be undone.`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Room'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setRoomToDelete(null);
          }}
        />
      )}
    </div>
  );
}
