'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function RoomManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/rooms');
      const list = Array.isArray(res) ? res : (res.data || []);
      setRooms(list);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
      setRooms([
        { id: 1, name: 'Room 301', building: 'Main Academic Building', floor: 3, capacity: 40, type: 'Lecture', is_active: true },
        { id: 2, name: 'ComLab 1', building: 'IT Computer Center', floor: 1, capacity: 35, type: 'Laboratory', is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Room Name', render: (row: any) => row.name },
    { key: 'building', label: 'Building Location', render: (row: any) => row.building },
    { key: 'floor', label: 'Floor Level', render: (row: any) => `${row.floor || 1}st Floor` },
    { key: 'capacity', label: 'Capacity', render: (row: any) => `${row.capacity || 40} Seats` },
    { key: 'type', label: 'Facility Type', render: (row: any) => row.type || 'Lecture' },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.is_active !== false ? 'Active' : 'Inactive'} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Classroom & Laboratory Facilities" subtitle="Manage university room assignments, capacities, and facility types" />
      {loading ? <LoadingState message="Loading room directory..." /> : <DataTable columns={columns} data={rooms} />}
    </div>
  );
}
