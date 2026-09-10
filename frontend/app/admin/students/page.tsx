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
import api from '@/lib/api';

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  
  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      const list = Array.isArray(res) ? res : (res.data || []);
      setStudents(list);
    } catch (err) {
      console.error('Failed to fetch students', err);
      // Mock data fallback
      setStudents([
        { id: 1, studentId: '2021-0001', name: 'Juan Dela Cruz', course: 'BSCS', year: 3, section: 'A', status: 'Enrolled' },
        { id: 2, studentId: '2021-0002', name: 'Maria Clara', course: 'BSIT', year: 3, section: 'B', status: 'Enrolled' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    // Submit logic here
  };

  const columns = [
    { key: 'studentId', label: 'Student ID', render: (row: any) => row.student_id_number || row.studentId },
    { key: 'name', label: 'Name', render: (row: any) => row.user?.name || row.name },
    { key: 'course', label: 'Course', render: (row: any) => row.course?.code || row.course || 'N/A' },
    { key: 'year', label: 'Year', render: (row: any) => row.year_level || row.year || 1 },
    { key: 'section', label: 'Section', render: (row: any) => row.section?.name || row.section || 'N/A' },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.enrollment_status || row.status || 'enrolled'} /> },
  ];

  const actions = (row: any) => (
    <div className="flex gap-2">
      <button onClick={() => { setEditingStudent(row); setShowModal(true); }} className="text-blue-600 hover:underline text-xs">Edit</button>
      <button onClick={() => { setStudentToDelete(row); setShowDeleteConfirm(true); }} className="text-red-600 hover:underline text-xs">Delete</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Student Management" 
        action={{ label: 'Add Student', onClick: () => { setEditingStudent(null); setShowModal(true); } }} 
      />
      
      <div className="bg-white p-3 border border-gray-300 flex justify-between items-center">
        <div className="flex gap-2 w-2/3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search students..." />
          <FormSelect options={[{value: '', label: 'All Courses'}, {value: 'BSCS', label: 'BSCS'}]} value="" onChange={() => {}} />
        </div>
      </div>
      
      {loading ? <LoadingState /> : (
        <DataTable columns={columns} data={students} actions={actions} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSave} className="space-y-3">
          <FormInput label="Student ID" value={editingStudent?.studentId || ''} onChange={() => {}} required />
          <FormInput label="Full Name" value={editingStudent?.name || ''} onChange={() => {}} required />
          <FormSelect label="Course" options={[{value: 'BSCS', label: 'BSCS'}]} value={editingStudent?.course || ''} onChange={() => {}} required />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-default">Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => setShowDeleteConfirm(false)}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.name}?`}
      />
    </div>
  );
}
