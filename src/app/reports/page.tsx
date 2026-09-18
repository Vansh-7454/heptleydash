'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import Shell from '@/components/layout/Shell';
import ReportsView from '@/components/reports/ReportsView';
import AccessDenied from '@/components/common/AccessDenied';

export default function ReportsRoute() {
  const { role } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!role) {
      router.replace('/');
    }
  }, [role, router]);

  if (!role) {
    return null;
  }

  // Role guard: Sales members are denied access to company reports
  if (role === 'sales') {
    return (
      <Shell>
        <AccessDenied />
      </Shell>
    );
  }

  return (
    <Shell>
      <ReportsView />
    </Shell>
  );
}
