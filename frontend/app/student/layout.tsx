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
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'student') {
      router.push('/unauthorized');
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user || user.role !== 'student') {
    return <LoadingState message="Verifying student access..." />;
  }

  return <DashboardLayout role="student">{children}</DashboardLayout>;
}
