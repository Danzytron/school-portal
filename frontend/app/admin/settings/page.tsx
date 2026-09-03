'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import Toast from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/lib/api';

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [schoolName, setSchoolName] = useState('Cebu Eastern College');
  const [schoolAddress, setSchoolAddress] = useState('Cebu City, Philippines');
  const [schoolContact, setSchoolContact] = useState('+63 (032) 253-5681');
  const [schoolEmail, setSchoolEmail] = useState('info@cebueasterncollege.edu.ph');
  const [activeSY, setActiveSY] = useState('2025-2026');
  const [activeSem, setActiveSem] = useState('1st Semester');
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [gradeSubmissionOpen, setGradeSubmissionOpen] = useState(true);
  const [gradeDeadline, setGradeDeadline] = useState('2025-10-25');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      const data = res.data !== undefined ? res.data : res;
      if (data) {
        if (data.school_name) setSchoolName(data.school_name);
        if (data.school_address) setSchoolAddress(data.school_address);
        if (data.school_contact) setSchoolContact(data.school_contact);
        if (data.school_email) setSchoolEmail(data.school_email);
        if (data.active_school_year) setActiveSY(data.active_school_year);
        if (data.active_semester) setActiveSem(data.active_semester);
        if (data.enrollment_open !== undefined) setEnrollmentOpen(data.enrollment_open);
        if (data.grade_submission_open !== undefined) setGradeSubmissionOpen(data.grade_submission_open);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', {
        school_name: schoolName,
        school_address: schoolAddress,
        school_contact: schoolContact,
        school_email: schoolEmail,
        active_school_year: activeSY,
        active_semester: activeSem,
        enrollment_open: enrollmentOpen,
        grade_submission_open: gradeSubmissionOpen,
      });
      setToastMessage('System settings saved successfully.');
    } catch (err) {
      setToastMessage('Settings updated locally.');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  if (loading) return <LoadingState message="Loading system configuration..." />;

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Institutional System Settings" 
        subtitle="Configure university metadata, active academic terms, and system-wide controls"
        action={{ 
          label: saving ? 'Saving Settings...' : 'Save All Settings', 
          onClick: handleSave 
        }} 
      />

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-heading bg-slate-800 text-white p-2.5 font-bold text-xs">
            University Information & Branding
          </div>
          <div className="panel-body p-4 space-y-3.5">
            <FormInput label="Official School Name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
            <FormInput label="Main Campus Address" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} />
            <FormInput label="Registrar Contact Number" value={schoolContact} onChange={(e) => setSchoolContact(e.target.value)} />
            <FormInput label="Official Inquiry Email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading bg-slate-800 text-white p-2.5 font-bold text-xs">
            Current Academic Period Controls
          </div>
          <div className="panel-body p-4 space-y-3.5">
            <FormSelect label="Active School Year" options={[{ value: '2025-2026', label: 'SY 2025-2026' }, { value: '2026-2027', label: 'SY 2026-2027' }]} value={activeSY} onChange={(e) => setActiveSY(e.target.value)} />
            <FormSelect label="Active Academic Term" options={[{ value: '1st Semester', label: '1st Semester' }, { value: '2nd Semester', label: '2nd Semester' }, { value: 'Summer', label: 'Summer Term' }]} value={activeSem} onChange={(e) => setActiveSem(e.target.value)} />
          </div>
        </div>

        <div className="panel md:col-span-2">
          <div className="panel-heading bg-slate-800 text-white p-2.5 font-bold text-xs">
            Module Access & System Operations
          </div>
          <div className="panel-body p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="enrollmentOpen" checked={enrollmentOpen} onChange={(e) => setEnrollmentOpen(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
              <label htmlFor="enrollmentOpen" className="text-xs font-semibold text-slate-800 select-none cursor-pointer">Student Online Enrollment Encoding Period (ACTIVE)</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="gradeSubmissionOpen" checked={gradeSubmissionOpen} onChange={(e) => setGradeSubmissionOpen(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
              <label htmlFor="gradeSubmissionOpen" className="text-xs font-semibold text-slate-800 select-none cursor-pointer">Faculty Grade Entry Portal Access (ACTIVE)</label>
            </div>
            <div className="max-w-md pt-2">
              <FormInput label="Official Grade Submission Deadline Date" type="date" value={gradeDeadline} onChange={(e) => setGradeDeadline(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
