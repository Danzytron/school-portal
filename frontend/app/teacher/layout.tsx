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
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'teacher') {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user || user.role !== 'teacher') {
    return <LoadingState message="Verifying faculty access..." />;
  }

  return <DashboardLayout role="teacher">{children}</DashboardLayout>;
}
