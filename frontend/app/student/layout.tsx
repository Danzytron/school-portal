'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const role = (user?.role || '').toLowerCase().trim();
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login');
    } else if (!isLoading && user && role !== 'student' && role !== 'admin' && role !== 'administrator') {
      router.push('/unauthorized');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const role = (user?.role || '').toLowerCase().trim();
  if (isLoading || !isAuthenticated || !user || (role !== 'student' && role !== 'admin' && role !== 'administrator')) {
    return <LoadingState message="Verifying student access..." />;
  }

  return <DashboardLayout role="student">{children}</DashboardLayout>;
}
