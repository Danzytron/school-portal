'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { FormInput } from '@/components/ui/FormInput';
import { Toast } from '@/components/ui/Toast';
import { Lock, Save, ShieldCheck, KeyRound, Shield, UserCheck, Bell } from 'lucide-react';

export default function TeacherSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const getPasswordStrength = () => {
    if (!newPassword) return { label: 'None', color: 'bg-slate-200', width: '0%' };
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;

    if (strength <= 25) return { label: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (strength <= 50) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (strength <= 75) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Institutional Grade', color: 'bg-emerald-600', width: '100%' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentPassword) {
      setError('Current faculty authentication password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New security password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      
      setToastMessage('Faculty security password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update faculty password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <PageHeader 
        title="Faculty Security & Account Settings" 
        subtitle="Manage faculty authentication credentials, password security, and system preferences."
        badge="Faculty Security"
      />

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Security Advisory */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-4 flex items-start gap-3 border-t-2 border-t-[#1D4ED8]">
        <div className="p-2 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 mt-0.5">
          <ShieldCheck size={18} />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed font-sans">
          <span className="font-heading font-bold text-slate-900 block">
            Faculty Access & Grading Authority Compliance
          </span>
          Your faculty account has elevated authorization for encoding scholastic grades and attendance records. Ensure your credentials remain confidential to protect academic integrity.
        </div>
      </div>

      {/* Password Change Panel */}
      <div className="panel">
        <div className="panel-heading">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#1D4ED8]" />
            <span className="font-heading font-bold text-slate-900">Update Security Password</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">256-Bit Cryptographic Hash</span>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-md mb-6 text-xs font-semibold flex items-center gap-2">
              <Shield size={14} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4 max-w-md font-sans">
            <FormInput
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            
            <div className="pt-2 border-t border-slate-100">
              <FormInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
                required
              />
              
              {newPassword && (
                <div className="mt-[-8px] mb-4">
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Password Complexity:</span>
                    <span className="font-bold text-slate-800">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: strength.width }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Must include uppercase, numbers, and special symbols
                  </div>
                </div>
              )}
              
              <FormInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={14} />
                <span>{loading ? 'Updating Credentials...' : 'Save New Password'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
