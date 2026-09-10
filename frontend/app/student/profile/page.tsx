'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Student } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Edit2, Save, X, BookOpen } from 'lucide-react';
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
        setError(err.message || 'Failed to load profile');
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
      setToastMessage('Contact information updated.');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error && !student) return <EmptyState title="Error" description={error} icon={<BookOpen size={40} />} />;
  if (!student) return <EmptyState title="No Profile" description="Could not load student record." />;

  const tabs = [
    { key: 'personal' as const, label: 'Personal' },
    { key: 'academic' as const, label: 'Academic' },
    { key: 'contact' as const, label: 'Contact' },
    { key: 'emergency' as const, label: 'Emergency' },
  ];

  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-gray-100 last:border-0 text-xs gap-1">
      <span className="sm:w-44 text-gray-500 shrink-0 text-[11px]">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      
      <PageHeader 
        title="Student Profile" 
        subtitle="Personal and academic information."
        actions={
          isEditing ? [
            { label: "Cancel", onClick: () => setIsEditing(false), variant: "default" as const, icon: X },
            { label: saving ? "Saving..." : "Save", onClick: handleSave, variant: "primary" as const, icon: Save }
          ] : [
            { label: "Edit Contact", onClick: () => setIsEditing(true), variant: "default" as const, icon: Edit2 }
          ]
        }
      />

      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />}

      {/* Student Summary */}
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {student.user?.name ? student.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'RD'}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">{student.user?.name}</div>
            <div className="text-xs text-gray-500">
              {student.student_id_number || '2026-00001'} • {student.course?.name || 'BS Information Technology'} • Year {student.year_level || 3} • {student.section?.name || 'BSIT 3-A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="border-b border-gray-200 px-3 flex gap-0 overflow-x-auto text-xs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer font-medium ${
                activeTab === tab.key
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'personal' && (
            <div>
              <InfoRow label="Full Name" value={student.user?.name} />
              <InfoRow label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'October 14, 2004'} />
              <InfoRow label="Nationality" value="Filipino" />
              <InfoRow label="Civil Status" value="Single" />
              <InfoRow label="Place of Birth" value="Cebu City, Philippines" />
              <InfoRow label="Email" value={<span className="font-mono">{student.user?.email}</span>} />
            </div>
          )}

          {activeTab === 'academic' && (
            <div>
              <InfoRow label="Program" value={student.course?.name || 'Bachelor of Science in Information Technology'} />
              <InfoRow label="Department" value="College of Computer Studies" />
              <InfoRow label="Year Level" value={`Year ${student.year_level || 3}`} />
              <InfoRow label="Section" value={student.section?.name || 'BSIT 3-A'} />
              <InfoRow label="Student ID" value={<span className="font-mono">{student.student_id_number || '2026-00001'}</span>} />
              <InfoRow label="Standing" value="Regular" />
              <InfoRow label="Units Earned" value="63.0" />
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              {isEditing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                    <input type="text" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="form-control" placeholder="+63 9XX XXX XXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    <textarea rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="form-control" placeholder="Street, City, Province" />
                  </div>
                </div>
              ) : (
                <div>
                  <InfoRow label="Address" value={formData.address || 'Cebu City, Cebu, Philippines'} />
                  <InfoRow label="Contact Number" value={<span className="font-mono">{formData.contact_number || '+63 917 123 4567'}</span>} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'emergency' && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Primary Contact</div>
              <InfoRow label="Name" value="Elena V. Cruz" />
              <InfoRow label="Relationship" value="Mother" />
              <InfoRow label="Phone" value={<span className="font-mono">+63 918 987 6543</span>} />
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">Secondary Contact</div>
                <InfoRow label="Name" value="Roberto M. Cruz" />
                <InfoRow label="Relationship" value="Father" />
                <InfoRow label="Phone" value={<span className="font-mono">+63 920 555 4321</span>} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
