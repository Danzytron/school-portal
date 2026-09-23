'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/ui/LoadingState';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const role = (user?.role || '').toLowerCase().trim();
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login');
    } else if (!isLoading && user && role !== 'teacher' && role !== 'faculty' && role !== 'admin' && role !== 'administrator') {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const role = (user?.role || '').toLowerCase().trim();
  if (isLoading || !isAuthenticated || !user || (role !== 'teacher' && role !== 'faculty' && role !== 'admin' && role !== 'administrator')) {
    return <LoadingState message="Verifying faculty access..." />;
  }

  return <DashboardLayout role="teacher">{children}</DashboardLayout>;
}
