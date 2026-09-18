'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import Shell from '@/components/layout/Shell';
import SalesMembersView from '@/components/sales-members/SalesMembersView';
import AccessDenied from '@/components/common/AccessDenied';

export default function SalesMembersRoute() {
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

  // Role guard: Sales members are denied access to Sales Members management
  if (role === 'sales') {
    return (
      <Shell>
        <AccessDenied />
      </Shell>
    );
  }

  return (
    <Shell>
      <SalesMembersView />
    </Shell>
  );
}
