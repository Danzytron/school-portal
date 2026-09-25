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
    const role = (user?.role || '').toLowerCase().trim();
    if (!isLoading && (!isAuthenticated || !user)) {
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
    } else if (!isLoading && user && role !== 'admin' && role !== 'administrator') {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const role = (user?.role || '').toLowerCase().trim();
  if (isLoading || !isAuthenticated || !user || (role !== 'admin' && role !== 'administrator')) {
    return null;
  }

  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
