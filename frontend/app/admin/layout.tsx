'use client';

import { ReactNode, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/ui/LoadingState';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user || user.role !== 'admin') {
    return <LoadingState message="Verifying administrative access..." />;
  }

  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
