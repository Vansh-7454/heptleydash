'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button, SearchableSelect } from '@/components/ui';
import { FollowUpType } from '@/types';

export default function AddFollowUpModal() {
  const {
    isAddFollowUpModalOpen,
    setIsAddFollowUpModalOpen,
    addFollowUp,
    customers,
    leads,
    salesMembers,
    role,
    userProfile,
  } = useDashboard();

  const [title, setTitle] = useState('');
  const [entityType, setEntityType] = useState<'customer' | 'lead'>('customer');
  const [selectedEntityId, setSelectedEntityId] = useState(customers[0]?.customerId || customers[0]?.id || '');
  const [date, setDate] = useState('2026-09-17');
  const [time, setTime] = useState('15:00');
  const [type, setType] = useState<FollowUpType>('Call');
  const [assignedSalesMemberId, setAssignedSalesMemberId] = useState(
    role === 'sales' ? userProfile.memberId || 'SM-001' : 'SM-001'
  );
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a subject or purpose for the follow-up.');
      return;
    }

    let entityName = '';
    let company = '';

    if (entityType === 'customer') {
      const c = customers.find((cust) => cust.customerId === selectedEntityId || cust.id === selectedEntityId);
      if (c) {
        entityName = c.name;
        company = c.company;
      }
    } else {
      const l = leads.find((lead) => lead.leadId === selectedEntityId || lead.id === selectedEntityId);
      if (l) {
        entityName = l.name;
        company = l.company;
      }
    }

    const assigned = salesMembers.find((m) => m.memberId === assignedSalesMemberId);
    const assignedSalesMemberName = assigned ? assigned.name : userProfile.name;

    setIsLoading(true);
    try {
      await addFollowUp({
        title,
        entityType,
        entityId: selectedEntityId,
        entityName,
        company,
        assignedSalesMemberId,
        assignedSalesMemberName,
        date,
        time,
        type,
        note,
        status: 'Pending',
      });

      setTitle('');
      setNote('');
      setIsAddFollowUpModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule follow-up.');
    } finally {
      setIsLoading(false);
    }
  };

  const entityOptions =
    entityType === 'customer'
      ? customers.map((c) => ({
          value: c.customerId || c.id,
          label: c.name,
          subLabel: c.company,
          badge: c.customerId,
        }))
      : leads.map((l) => ({
          value: l.leadId || l.id,
          label: l.name,
          subLabel: l.company,
          badge: `${l.leadId} [${l.status}]`,
        }));

  return (
    <Modal
      isOpen={isAddFollowUpModalOpen}
      onClose={() => setIsAddFollowUpModalOpen(false)}
      title="Schedule Follow-up"
      subtitle="Plan customer touchpoint, consultation meeting, or contract renewal review"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setIsAddFollowUpModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Schedule Item
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

        <Input
          label="Subject / Purpose"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Scope walk-through with tech lead"
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.875rem' }}>
          <Select
            label="Target Category"
            value={entityType}
            onChange={(e) => {
              const newType = e.target.value as 'customer' | 'lead';
              setEntityType(newType);
              setSelectedEntityId(newType === 'customer' ? customers[0]?.id || '' : leads[0]?.id || '');
            }}
            options={[
              { value: 'customer', label: 'Customer Account' },
              { value: 'lead', label: 'Prospect Lead' },
            ]}
          />

          <SearchableSelect
            label="Select Account / Contact"
            value={selectedEntityId}
            onChange={(val) => setSelectedEntityId(val)}
            placeholder={entityType === 'customer' ? 'Search or select customer...' : 'Search or select lead...'}
            searchPlaceholder={entityType === 'customer' ? 'Search customer, company or ID...' : 'Search lead, company or status...'}
            options={entityOptions}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          <Select
            label="Interaction Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: 'Call', label: 'Phone Call' },
              { value: 'Meeting', label: 'Video/In-person Meeting' },
              { value: 'Email', label: 'Email Outreach' },
              { value: 'WhatsApp', label: 'WhatsApp Message' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>

        {role === 'admin' && (
          <Select
            label="Assigned Sales Member"
            value={assignedSalesMemberId}
            onChange={(e) => setAssignedSalesMemberId(e.target.value)}
            options={salesMembers.map((m) => ({ value: m.memberId, label: `${m.name} (${m.memberId})` }))}
          />
        )}

        <Input
          label="Agenda Notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Key questions or files to deliver during consultation..."
        />
      </form>
    </Modal>
  );
}
