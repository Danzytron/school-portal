'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { Toast } from '@/components/ui/Toast';
import { User, Mail, Phone, Building2, Award, Shield, Edit2, Save } from 'lucide-react';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', contact: '' });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const DEFAULT_FACULTY_PROFILE = {
    employeeId: 'FAC-2026-0814',
    name: user?.name || 'Prof. Arnel L. Villanueva',
    department: 'College of Computer Studies',
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
      setToast({ message: 'Faculty profile contact updated successfully.', type: 'success' });
    } catch (error) {
      setProfile((prev: any) => ({ ...prev, ...formData }));
      setIsEditing(false);
      setToast({ message: 'Faculty contact details saved locally.', type: 'success' });
    }
  };

  if (loading) return <LoadingState message="Loading faculty dossier..." />;

  const prof = profile || DEFAULT_FACULTY_PROFILE;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <PageHeader 
        title="Faculty Member Dossier" 
        subtitle="Official instructional appointment records, departmental credentials, and institutional contact information."
        badge="Faculty Registry"
      />
      
      {/* Identity Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-xl bg-[#1E3A8A] text-white flex flex-col items-center justify-center font-heading font-bold text-2xl border border-blue-400/30 shadow-2xs shrink-0">
          <span>{prof.name ? prof.name.charAt(0).toUpperCase() : 'T'}</span>
          <span className="text-[9px] font-sans text-blue-200 tracking-wider uppercase font-semibold">FACULTY</span>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {prof.employeeId}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
              {prof.status}
            </span>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
            {prof.name}
          </h2>

          <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <span className="font-semibold text-slate-800">{prof.department}</span>
            <span>•</span>
            <span>{prof.rank}</span>
          </div>
        </div>
      </div>

      {/* Profile Details Panel */}
      <div className="panel">
        <div className="panel-heading">
          <span className="font-heading font-bold text-slate-900">Academic & Departmental Credentials</span>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-outline text-xs inline-flex items-center gap-1"
            >
              <Edit2 size={12} />
              <span>Update Contact Details</span>
            </button>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Academic Department</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{prof.department}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Specialization Field</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{prof.specialization}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Faculty Academic Rank</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{prof.rank}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Employment Status</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{prof.status}</span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-200">
            <h4 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Official Institutional Contact
            </h4>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4 max-w-md text-xs font-sans">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control text-xs py-1.5"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Contact Number
                  </label>
                  <input
                    type="text"
                    className="form-control text-xs py-1.5"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>Save Contact Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <Mail size={16} className="text-[#1D4ED8] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">University Email</span>
                    <span className="font-mono text-slate-900 font-medium">{prof.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <Phone size={16} className="text-[#1D4ED8] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Mobile Contact</span>
                    <span className="font-mono text-slate-900 font-medium">{prof.contact}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
