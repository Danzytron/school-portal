'use client';

import { ReactNode } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/lib/auth';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout role="teacher">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
