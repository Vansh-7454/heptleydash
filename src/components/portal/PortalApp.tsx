'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import LoginPage from '@/components/auth/LoginPage';
import Shell from '@/components/layout/Shell';

// Views
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SalesDashboard from '@/components/dashboard/SalesDashboard';
import SalesMembersView from '@/components/sales-members/SalesMembersView';
import CustomersView from '@/components/customers/CustomersView';
import CustomerDetailsView from '@/components/customers/CustomerDetailsView';
import LeadsView from '@/components/leads/LeadsView';
import FollowUpsView from '@/components/followups/FollowUpsView';
import ActivitiesView from '@/components/activities/ActivitiesView';
import PaymentsView from '@/components/payments/PaymentsView';
import ReportsView from '@/components/reports/ReportsView';
import AIAssistantView from '@/components/ai/AIAssistantView';
import NotificationsView from '@/components/notifications/NotificationsView';
import ProfileView from '@/components/profile/ProfileView';
import SettingsView from '@/components/settings/SettingsView';
import AccessDenied from '@/components/common/AccessDenied';

export default function PortalApp() {
  const { role, activeAdminTab, activeSalesTab, detailedCustomerView } = useDashboard();

  // 1. Unauthenticated state: Professional single login page
  if (!role) {
    return <LoginPage />;
  }

  // 2. Deep Page Navigation: Customer Details View
  if (detailedCustomerView) {
    return (
      <Shell>
        <CustomerDetailsView />
      </Shell>
    );
  }

  // 3. Role Guard: Check if Sales role is attempting to access restricted admin tabs
  const isRestrictedForSales =
    role === 'sales' &&
    ['sales-members', 'reports', 'payments'].includes(activeSalesTab as string);

  if (isRestrictedForSales) {
    return (
      <Shell>
        <AccessDenied />
      </Shell>
    );
  }

  // 4. Authenticated Role-Based View Dispatching
  return (
    <Shell>
      {role === 'admin' ? (
        <>
          {activeAdminTab === 'dashboard' && <AdminDashboard />}
          {activeAdminTab === 'sales-members' && <SalesMembersView />}
          {activeAdminTab === 'customers' && <CustomersView />}
          {activeAdminTab === 'leads' && <LeadsView />}
          {activeAdminTab === 'follow-ups' && <FollowUpsView />}
          {activeAdminTab === 'activities' && <ActivitiesView />}
          {activeAdminTab === 'payments' && <PaymentsView />}
          {activeAdminTab === 'reports' && <ReportsView />}
          {activeAdminTab === 'ai-assistant' && <AIAssistantView />}
          {activeAdminTab === 'notifications' && <NotificationsView />}
          {activeAdminTab === 'profile' && <ProfileView />}
          {activeAdminTab === 'settings' && <SettingsView />}
        </>
      ) : (
        <>
          {activeSalesTab === 'dashboard' && <SalesDashboard />}
          {activeSalesTab === 'my-customers' && <CustomersView />}
          {activeSalesTab === 'my-leads' && <LeadsView />}
          {activeSalesTab === 'follow-ups' && <FollowUpsView />}
          {activeSalesTab === 'activities' && <ActivitiesView />}
          {activeSalesTab === 'ai-assistant' && <AIAssistantView />}
          {activeSalesTab === 'notifications' && <NotificationsView />}
          {activeSalesTab === 'profile' && <ProfileView />}
          {activeSalesTab === 'settings' && <SettingsView />}
        </>
      )}
    </Shell>
  );
}
