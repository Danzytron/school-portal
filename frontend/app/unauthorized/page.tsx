'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  const getHomeRoute = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    if (user?.role === 'student') return '/student/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 text-center border-t-4 border-t-rose-600">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>

        <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          You do not have institutional authorization to access this area. Your current account role (
          <span className="font-bold text-slate-900 uppercase font-mono">{user?.role || 'Guest'}</span>
          ) is restricted from viewing this resource.
        </p>

        <div className="space-y-2.5">
          <Link
            href={getHomeRoute()}
            className="w-full btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>Return to Authorized Dashboard</span>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <LogOut size={15} />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
          Cebu Eastern College • Information Security & Role-Based Access Control
        </div>
      </div>
    </div>
  );
}
