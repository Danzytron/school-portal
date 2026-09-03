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
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'student') {
    return <LoadingState message="Verifying student access..." />;
  }

  return <DashboardLayout role="student">{children}</DashboardLayout>;
}
