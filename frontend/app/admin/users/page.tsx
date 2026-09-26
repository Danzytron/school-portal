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
import { Plus, Edit2, Trash2, KeyRound, Shield, User } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    is_active: true,
  });

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Teacher / Faculty' },
    { value: 'student', label: 'Student' },
  ];

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 100 };
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', params);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setUsers(list);
    } catch (err: any) {
      console.error('Failed to fetch users', err);
      setToast({ message: 'Failed to load user accounts from database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: 'roldan2026',
      role: 'student',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      is_active: u.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setToast({ message: 'Name and email are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
      };

      if (!editingUser || formData.password.trim()) {
        payload.password = formData.password.trim() || 'roldan2026';
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        setToast({ message: `User "${payload.name}" updated successfully.`, type: 'success' });
      } else {
        await api.post('/admin/users', payload);
        setToast({ message: `User "${payload.name}" created successfully.`, type: 'success' });
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save user account.');
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setToast({ message: `User "${userToDelete.name}" removed successfully.`, type: 'success' });
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete user account.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const columns = [
    {
      key: 'name',
      label: 'Account Holder',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
            {row.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Access Role',
      render: (row: any) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
          row.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
          row.role === 'teacher' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <Shield className="w-3 h-3" />
          <span>{row.role}</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.is_active !== false ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'createdAt',
      label: 'Member Since',
      render: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </span>
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
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setUserToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete User"
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
        title="System Accounts & Access Rights"
        subtitle="Manage user authentication credentials, security privileges, and system roles"
        action={{
          label: 'Create User Account',
          icon: Plus,
          onClick: openAddModal,
        }}
      />

      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email address..." />
          <FormSelect
            label=""
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All System Roles' },
              { value: 'admin', label: 'Administrators Only' },
              { value: 'teacher', label: 'Faculty / Teachers Only' },
              { value: 'student', label: 'Students Only' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading system accounts from database..." />
      ) : (
        <DataTable columns={columns} data={filteredUsers} emptyMessage="No user accounts found." />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingUser ? `Edit Account: ${editingUser.name}` : 'Create New System User'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Alan Turing"
              required
            />

            <FormInput
              label="Institutional Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. user@cebueasterncollege.edu.ph"
              required
            />

            <FormSelect
              label="System Security Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={roleOptions}
              required
            />

            <FormInput
              label={editingUser ? 'New Password (leave blank to keep current)' : 'Account Password'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'roldan2026'}
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
                Active Account (enable system login)
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
                {submitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && userToDelete && (
        <ConfirmDialog
          title="Delete User Account"
          message={`Are you sure you want to delete the account for "${userToDelete.name}" (${userToDelete.email})?`}
          confirmLabel={submitting ? 'Deleting...' : 'Delete Account'}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
}

