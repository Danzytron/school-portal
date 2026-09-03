'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Student } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  User, 
  Edit2, 
  Save, 
  X, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Award,
  Building2
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'contact' | 'emergency'>('personal');
  
  const [formData, setFormData] = useState({
    contact_number: '',
    address: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<Student>('/student/profile');
        const studentData = (response as any).data || response;
        setStudent(studentData);
        setFormData({
          contact_number: studentData.contact_number || '+63 917 123 4567',
          address: studentData.address || 'Cebu City, Cebu, Philippines'
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile', formData);
      if (student) {
        setStudent({ ...student, ...formData });
      }
      setIsEditing(false);
      setToastMessage('Contact information successfully updated in university records.');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Retrieving official student dossier..." />;
  if (error && !student) return <EmptyState title="Error" description={error} icon={<BookOpen size={48} />} />;
  if (!student) return <EmptyState title="No Profile Found" description="Could not load your permanent student record." />;

  const initials = student.user?.name ? student.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'RD';

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <PageHeader 
        title="Student Permanent Dossier & Registrar Records" 
        subtitle="Official student academic registry, personal background, and certified contacts."
        badge="Official Student Record"
        actions={
          isEditing ? [
            {
              label: "Cancel",
              onClick: () => setIsEditing(false),
              variant: "default",
              icon: X
            },
            {
              label: saving ? "Saving Records..." : "Save Changes",
              onClick: handleSave,
              variant: "primary",
              icon: Save
            }
          ] : [
            {
              label: "Update Contact Info",
              onClick: () => setIsEditing(true),
              variant: "default",
              icon: Edit2
            }
          ]
        }
      />

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* 1. Official Student Identity Card */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden border-t-2 border-t-[#1D4ED8]">
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-xl bg-[#1E3A8A] text-white flex flex-col items-center justify-center font-heading font-bold text-2xl border border-blue-400/30 shadow-2xs shrink-0">
            <span>{initials}</span>
            <span className="text-[9px] font-sans text-blue-200 tracking-wider uppercase font-semibold">STUDENT</span>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                SN: {student.student_id_number || '2026-00001'}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Validated Enrollee
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                Good Standing
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
              {student.user?.name}
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-2 text-xs text-slate-600 mt-1">
              <span className="font-semibold text-slate-800">
                {student.course?.name || 'Bachelor of Science in Information Technology'}
              </span>
              <span>•</span>
              <span>Year Level {student.year_level || 3}</span>
              <span>•</span>
              <span>Section {student.section?.name || 'BSIT 3-A'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Rail */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'personal'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Personal Information
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'academic'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Academic Program & Admission
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Residential & Contacts
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'emergency'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Emergency & Family Dossier
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="panel">
        <div className="p-6">
          
          {/* Tab 1: Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-3">
                Certified Civil & Demographic Registry
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Official Full Name</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{student.user?.name}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Date of Birth</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'October 14, 2004'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Citizenship / Nationality</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">Filipino</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Civil Status</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">Single</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Place of Birth</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">Cebu City, Philippines</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Institutional Email</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">{student.user?.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Academic Record & Admission */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-3">
                Curricular Status & Admission History
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Enrolled Program</span>
                  <span className="font-heading font-bold text-slate-900 mt-0.5 block text-sm">
                    {student.course?.name || 'Bachelor of Science in Information Technology'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Curriculum Year: 2024–2028 • CHED CMO Approved
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Academic Department</span>
                  <span className="font-heading font-bold text-slate-900 mt-0.5 block text-sm">
                    College of Computer Studies
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Dean: Dr. Elizabeth Lim, DIT
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Scholastic Standing</span>
                  <span className="font-semibold text-emerald-700 mt-0.5 block">
                    Regular Student • First Honors Dean's List
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    63.0 Academic Units Earned to Date
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Admission Credentials</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    Complete Official Documents Submitted
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    PSA Birth Cert, Form 137/138, Good Moral, Medical
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Residential & Contacts */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-3">
                Official Registered Addresses & Communication
              </h3>

              {isEditing ? (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Telephone / Mobile Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      className="form-control"
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Permanent Residential Address
                    </label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="form-control"
                      placeholder="Street, Barangay, City, Province, Postal Code"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Permanent Home Address</span>
                    <span className="font-semibold text-slate-800 mt-1 block leading-relaxed">
                      {formData.address || 'Cebu City, Cebu, Philippines'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Registered Mobile Number</span>
                    <span className="font-mono font-bold text-slate-900 mt-1 block">
                      {formData.contact_number || '+63 917 123 4567'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Emergency & Family Dossier */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-3">
                Emergency Contacts & Parent / Guardian Dossier
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Primary Emergency Contact</span>
                  <span className="font-heading font-bold text-slate-900 mt-0.5 block text-sm">Elena V. Cruz</span>
                  <span className="text-[11px] text-slate-600 mt-0.5 block">Relationship: Mother</span>
                  <span className="font-mono text-slate-700 mt-1 block font-medium">+63 918 987 6543</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Secondary Contact</span>
                  <span className="font-heading font-bold text-slate-900 mt-0.5 block text-sm">Roberto M. Cruz</span>
                  <span className="text-[11px] text-slate-600 mt-0.5 block">Relationship: Father</span>
                  <span className="font-mono text-slate-700 mt-1 block font-medium">+63 920 555 4321</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
