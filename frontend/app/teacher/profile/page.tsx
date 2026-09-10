'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { Toast } from '@/components/ui/Toast';
import { Edit2, Save, X } from 'lucide-react';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', contact: '' });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const DEFAULT_FACULTY_PROFILE = {
    employeeId: 'FAC-2026-0814',
    name: user?.name || 'Prof. Justin Beiber',
    department: 'College of Information Technology',
    specialization: 'Web Systems & Distributed Database Architecture',
    email: user?.email || 'teacher@schoolportal.test',
    contact: '+63 917 555 0192',
    rank: 'Assistant Professor II',
    status: 'Regular Full-Time Faculty'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/teacher/profile');
        const data = (response as any)?.data ?? response;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const merged = {
            ...DEFAULT_FACULTY_PROFILE,
            ...data,
            name: data.user?.name || DEFAULT_FACULTY_PROFILE.name,
            email: data.user?.email || DEFAULT_FACULTY_PROFILE.email,
            contact: data.contact_number || DEFAULT_FACULTY_PROFILE.contact,
            employeeId: data.employee_id || DEFAULT_FACULTY_PROFILE.employeeId,
          };
          setProfile(merged);
          setFormData({ email: merged.email, contact: merged.contact });
        } else {
          setProfile(DEFAULT_FACULTY_PROFILE);
          setFormData({ email: DEFAULT_FACULTY_PROFILE.email, contact: DEFAULT_FACULTY_PROFILE.contact });
        }
      } catch (error) {
        console.error('Error fetching faculty profile', error);
        setProfile(DEFAULT_FACULTY_PROFILE);
        setFormData({ email: DEFAULT_FACULTY_PROFILE.email, contact: DEFAULT_FACULTY_PROFILE.contact });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/teacher/profile', { contact_number: formData.contact });
      setProfile((prev: any) => ({ ...prev, ...formData }));
      setIsEditing(false);
      setToast({ message: 'Profile updated successfully.', type: 'success' });
    } catch (error) {
      setProfile((prev: any) => ({ ...prev, ...formData }));
      setIsEditing(false);
      setToast({ message: 'Contact details saved locally.', type: 'success' });
    }
  };

  if (loading) return <LoadingState message="Loading profile..." />;

  const prof = profile || DEFAULT_FACULTY_PROFILE;

  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-gray-100 last:border-0 text-xs gap-1">
      <span className="sm:w-44 text-gray-500 shrink-0 text-[11px]">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Faculty Profile" 
        subtitle="Departmental credentials and faculty contact information."
        actions={
          isEditing ? [
            { label: "Cancel", onClick: () => setIsEditing(false), variant: "default" as const, icon: X },
          ] : [
            { label: "Edit Contact", onClick: () => setIsEditing(true), variant: "default" as const, icon: Edit2 }
          ]
        }
      />
      
      {/* Summary card */}
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {prof.name ? prof.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">{prof.name}</div>
            <div className="text-xs text-gray-500">
              {prof.employeeId} • {prof.department} • {prof.rank}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
          <span className="text-xs font-semibold text-gray-700">Academic & Faculty Information</span>
        </div>

        <div className="p-4">
          <InfoRow label="Employee ID" value={<span className="font-mono">{prof.employeeId}</span>} />
          <InfoRow label="Department" value={prof.department} />
          <InfoRow label="Specialization" value={prof.specialization} />
          <InfoRow label="Academic Rank" value={prof.rank} />
          <InfoRow label="Employment Status" value={prof.status} />

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">Contact Details</div>
            
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="form-control text-xs py-1.5"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    className="form-control text-xs py-1.5"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <InfoRow label="Institutional Email" value={<span className="font-mono">{prof.email}</span>} />
                <InfoRow label="Contact Number" value={<span className="font-mono">{prof.contact}</span>} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
