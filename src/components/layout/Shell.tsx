'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useDashboard } from '@/context/DashboardContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// Central CRM Modals
import AddCustomerModal from '@/components/customers/AddCustomerModal';
import EditCustomerModal from '@/components/customers/EditCustomerModal';
import AddLeadModal from '@/components/leads/AddLeadModal';
import EditLeadModal from '@/components/leads/EditLeadModal';
import AddFollowUpModal from '@/components/followups/AddFollowUpModal';
import EditFollowUpModal from '@/components/followups/EditFollowUpModal';
import AddSalesMemberModal from '@/components/sales-members/AddSalesMemberModal';
import EditSalesMemberModal from '@/components/sales-members/EditSalesMemberModal';
import LogActivityModal from '@/components/activities/LogActivityModal';
import RecordPaymentModal from '@/components/payments/RecordPaymentModal';

export interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { toasts, removeToast } = useDashboard();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Column */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Header />

        <main
          style={{
            flex: 1,
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* Global CRM Modals */}
      <AddCustomerModal />
      <EditCustomerModal />
      <AddLeadModal />
      <EditLeadModal />
      <AddFollowUpModal />
      <EditFollowUpModal />
      <AddSalesMemberModal />
      <EditSalesMemberModal />
      <LogActivityModal />
      <RecordPaymentModal />

      {/* Floating Toast Notification Stack */}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
              }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
