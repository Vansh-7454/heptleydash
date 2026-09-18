'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { ActivityType } from '@/types';

export default function LogActivityModal() {
  const {
    isLogActivityModalOpen,
    setIsLogActivityModalOpen,
    logActivity,
    customers,
    leads,
    userProfile,
    role,
    detailedCustomerView,
  } = useDashboard();

  const [type, setType] = useState<ActivityType>('Call');
  const [targetType, setTargetType] = useState<'customer' | 'lead' | 'general'>('customer');
  const [selectedEntityId, setSelectedEntityId] = useState(customers[0]?.customerId || customers[0]?.id || '');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLogActivityModalOpen && detailedCustomerView) {
      setTargetType('customer');
      setSelectedEntityId(detailedCustomerView.customerId || detailedCustomerView.id);
    }
  }, [isLogActivityModalOpen, detailedCustomerView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please provide a brief description of the activity.');
      return;
    }

    let entityName: string | undefined;
    let company: string | undefined;

    if (targetType === 'customer') {
      const c = customers.find((cust) => cust.customerId === selectedEntityId || cust.id === selectedEntityId);
      if (c) {
        entityName = c.name;
        company = c.company;
      }
    } else if (targetType === 'lead') {
      const l = leads.find((lead) => lead.leadId === selectedEntityId || lead.id === selectedEntityId);
      if (l) {
        entityName = l.name;
        company = l.company;
      }
    }

    setIsLoading(true);
    try {
      await logActivity({
        userId: userProfile.id,
        userName: userProfile.name,
        userRole: role || 'sales',
        entityType: targetType !== 'general' ? targetType : undefined,
        entityId: targetType !== 'general' ? selectedEntityId : undefined,
        entityName,
        company,
        type,
        description,
      });

      setDescription('');
      setIsLogActivityModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to log activity.');
    } finally {
      setIsLoading(false);
    }
  };

  const entityOptions =
    targetType === 'customer'
      ? customers.map((c) => ({ value: c.customerId || c.id, label: `${c.name} (${c.company})` }))
      : leads.map((l) => ({ value: l.leadId || l.id, label: `${l.name} (${l.company})` }));

  return (
    <Modal
      isOpen={isLogActivityModalOpen}
      onClose={() => setIsLogActivityModalOpen(false)}
      title="Log Operational Activity"
      subtitle="Register phone call outcomes, client notes, or ad-hoc interactions"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setIsLogActivityModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Log
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Activity Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: 'Call', label: 'Call Logged' },
              { value: 'Email', label: 'Email Outreach' },
              { value: 'Meeting', label: 'Meeting Held' },
              { value: 'Note', label: 'General Note' },
              { value: 'Status Change', label: 'Status Update' },
            ]}
          />

          <Select
            label="Associated With"
            value={targetType}
            onChange={(e) => {
              const val = e.target.value as any;
              setTargetType(val);
              if (val === 'customer') setSelectedEntityId(customers[0]?.id || '');
              if (val === 'lead') setSelectedEntityId(leads[0]?.id || '');
            }}
            options={[
              { value: 'customer', label: 'Customer Account' },
              { value: 'lead', label: 'Prospect Lead' },
              { value: 'general', label: 'Internal Organization' },
            ]}
          />
        </div>

        {targetType !== 'general' && (
          <Select
            label="Select Specific Entity"
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            options={entityOptions}
          />
        )}

        <Input
          label="Activity Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Summary of discussion, key questions answered, next steps..."
          required
        />
      </form>
    </Modal>
  );
}
