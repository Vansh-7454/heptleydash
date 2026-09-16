'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import LoginPage from '@/components/auth/LoginPage';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import ToastContainer from '@/components/common/ToastContainer';
import CustomerDetailsView from '@/components/common/CustomerDetailsView';
import ProfileView from '@/components/common/ProfileView';
import SettingsView from '@/components/common/SettingsView';
import AdminDashboardView from '@/components/admin/AdminDashboardView';
import SalesMembersView from '@/components/admin/SalesMembersView';
import CustomersView from '@/components/admin/CustomersView';
import MemberDetailsModal from '@/components/admin/MemberDetailsModal';
import EditMemberModal from '@/components/admin/EditMemberModal';
import AddCustomerModal from '@/components/admin/AddCustomerModal';
import EditCustomerModal from '@/components/admin/EditCustomerModal';
import CustomerDetailsModal from '@/components/common/CustomerDetailsModal';
import SalesDashboardView from '@/components/sales/SalesDashboardView';
import ProjectsKanbanView from '@/components/crm/ProjectsKanbanView';
import TasksView from '@/components/crm/TasksView';
import AddProjectModal from '@/components/crm/AddProjectModal';
import AddTaskModal from '@/components/crm/AddTaskModal';
import CommandPalette from '@/components/common/CommandPalette';

export default function Home() {
  const {
    role,
    activeAdminTab,
    activeSalesTab,
    detailedCustomerView,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  } = useDashboard();

  // 1. Initial State: B2B SaaS Login Page
  if (!role) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // 2. Authenticated / Selected Workspace State
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      {/* Top Header */}
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            maxWidth: '1600px',
            width: '100%',
          }}
        >
          {/* Page-level Detailed Customer Inspection */}
          {detailedCustomerView ? (
            <CustomerDetailsView />
          ) : role === 'admin' ? (
            <>
              {activeAdminTab === 'dashboard' && <AdminDashboardView />}
              {activeAdminTab === 'projects' && <ProjectsKanbanView />}
              {activeAdminTab === 'tasks' && <TasksView />}
              {activeAdminTab === 'sales-members' && <SalesMembersView />}
              {activeAdminTab === 'customers' && <CustomersView />}
              {activeAdminTab === 'settings' && <SettingsView />}
              {activeAdminTab === 'profile' && <ProfileView />}

              {/* Admin Modals */}
              <MemberDetailsModal />
              <EditMemberModal />
              <AddCustomerModal />
              <EditCustomerModal />
              <AddProjectModal />
              <AddTaskModal />
            </>
          ) : (
            <>
              {activeSalesTab === 'projects' && <ProjectsKanbanView />}
              {activeSalesTab === 'tasks' && <TasksView />}
              {activeSalesTab === 'settings' && <SettingsView />}
              {activeSalesTab === 'profile' && <ProfileView />}
              {activeSalesTab !== 'projects' &&
                activeSalesTab !== 'tasks' &&
                activeSalesTab !== 'settings' &&
                activeSalesTab !== 'profile' && <SalesDashboardView />}

              {/* Sales Modals */}
              <EditCustomerModal />
              <AddProjectModal />
              <AddTaskModal />
            </>
          )}

          {/* Shared Modals accessible across both Admin and Sales */}
          <CustomerDetailsModal />
        </main>
      </div>

      {/* Floating SaaS Toast Notification Stack */}
      <ToastContainer />

      {/* Global Spotlight Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
