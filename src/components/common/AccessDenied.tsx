'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Button } from '@/components/ui';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  const { setActiveSalesTab } = useDashboard();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '1.5rem',
      }}
    >
      <Card
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid #fecaca',
          backgroundColor: '#fff5f5',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
          Access Restricted: Administrator Privileges Required
        </h2>

        <p style={{ fontSize: '0.875rem', color: '#b91c1c', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          This section is designated exclusively for executive administration (managing sales representatives and cross-company analytics). Your account is authenticated as a <strong>Sales Member</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => setActiveSalesTab('dashboard')}
          >
            Return to My Sales Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
