'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LoadingState from '@/components/ui/LoadingState';

export default function AnnouncementsDispatcher() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
      return;
    }

    const role = (user.role || '').toLowerCase().trim();
    if (role === 'admin' || role === 'administrator') {
      router.replace('/admin/announcements');
    } else if (role === 'teacher' || role === 'faculty') {
      router.replace('/teacher/announcements');
    } else {
      router.replace('/student/announcements');
    }
  }, [user, isAuthenticated, isLoading, router]);

  return null;
}
