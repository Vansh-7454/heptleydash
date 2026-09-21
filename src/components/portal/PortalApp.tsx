'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import LoginPage from '@/components/auth/LoginPage';
import Shell from '@/components/layout/Shell';

// Views
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SalesDashboard from '@/components/dashboard/SalesDashboard';
import DeveloperDashboard from '@/components/dashboard/DeveloperDashboard';
import SalesMembersView from '@/components/sales-members/SalesMembersView';
import CustomersView from '@/components/customers/CustomersView';
import CustomerDetailsView from '@/components/customers/CustomerDetailsView';
import LeadsView from '@/components/leads/LeadsView';
import FollowUpsView from '@/components/followups/FollowUpsView';
import ActivitiesView from '@/components/activities/ActivitiesView';
import PaymentsView from '@/components/payments/PaymentsView';
import ReportsView from '@/components/reports/ReportsView';
import WebsitesDomainsView from '@/components/websites/WebsitesDomainsView';
import SalesQuestionsView from '@/components/sales-questions/SalesQuestionsView';
import AIAssistantView from '@/components/ai/AIAssistantView';
import NotificationsView from '@/components/notifications/NotificationsView';
import ProfileView from '@/components/profile/ProfileView';
import SettingsView from '@/components/settings/SettingsView';
import AccessDenied from '@/components/common/AccessDenied';

export default function PortalApp() {
  const {
    role,
    activeAdminTab,
    setActiveAdminTab,
    activeSalesTab,
    activeDeveloperTab,
    detailedCustomerView,
  } = useDashboard();

  // Redirect admin if on removed admin tabs
  React.useEffect(() => {
    if (role === 'admin' && ['follow-ups', 'activities', 'payments'].includes(activeAdminTab as string)) {
      setActiveAdminTab('dashboard');
    }
  }, [role, activeAdminTab, setActiveAdminTab]);

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

  // 3. Role Guard: Check if Sales or Developer role attempts unauthorized admin sections
  const isRestrictedForSales =
    role === 'sales' &&
    ['sales-members', 'reports'].includes(activeSalesTab as string);

  const isRestrictedForDev =
    role === 'developer' &&
    ['sales-members', 'customers', 'leads', 'follow-ups', 'payments', 'reports'].includes(
      activeDeveloperTab as string
    );

  if (isRestrictedForSales || isRestrictedForDev) {
    return (
      <Shell>
        <AccessDenied />
      </Shell>
    );
  }

  // 4. Authenticated Role-Based View Dispatching
  return (
    <Shell>
      {role === 'admin' && (
        <>
          {activeAdminTab === 'dashboard' && <AdminDashboard />}
          {activeAdminTab === 'sales-members' && <SalesMembersView />}
          {activeAdminTab === 'customers' && <CustomersView />}
          {activeAdminTab === 'leads' && <LeadsView />}
          {activeAdminTab === 'websites-domains' && <WebsitesDomainsView />}
          {activeAdminTab === 'sales-questions' && <SalesQuestionsView />}
          {activeAdminTab === 'reports' && <ReportsView />}
          {activeAdminTab === 'notifications' && <NotificationsView />}
          {activeAdminTab === 'profile' && <ProfileView />}
          {activeAdminTab === 'settings' && <SettingsView />}
        </>
      )}

      {role === 'sales' && (
        <>
          {activeSalesTab === 'dashboard' && <SalesDashboard />}
          {activeSalesTab === 'my-customers' && <CustomersView />}
          {activeSalesTab === 'my-leads' && <LeadsView />}
          {activeSalesTab === 'follow-ups' && <FollowUpsView />}
          {activeSalesTab === 'activities' && <ActivitiesView />}
          {activeSalesTab === 'payments' && <PaymentsView />}
          {activeSalesTab === 'websites-domains' && <WebsitesDomainsView />}
          {activeSalesTab === 'sales-questions' && <SalesQuestionsView />}
          {activeSalesTab === 'ai-assistant' && <AIAssistantView />}
          {activeSalesTab === 'notifications' && <NotificationsView />}
          {activeSalesTab === 'profile' && <ProfileView />}
          {activeSalesTab === 'settings' && <SettingsView />}
        </>
      )}

      {role === 'developer' && (
        <>
          {activeDeveloperTab === 'dashboard' && <DeveloperDashboard />}
          {activeDeveloperTab === 'websites-domains' && <WebsitesDomainsView />}
          {activeDeveloperTab === 'sales-questions' && <SalesQuestionsView />}
          {activeDeveloperTab === 'notifications' && <NotificationsView />}
          {activeDeveloperTab === 'profile' && <ProfileView />}
          {activeDeveloperTab === 'settings' && <SettingsView />}
        </>
      )}
    </Shell>
  );
}
