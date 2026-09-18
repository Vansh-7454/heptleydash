'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { LeadStatus } from '@/types';

export default function EditLeadModal() {
  const { editingLead, setEditingLead, editLead, salesMembers, role } = useDashboard();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interestedService, setInterestedService] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [assignedSalesMemberId, setAssignedSalesMemberId] = useState('');
  const [dealEstimate, setDealEstimate] = useState('0');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingLead) {
      setName(editingLead.name);
      setCompany(editingLead.company);
      setEmail(editingLead.email);
      setPhone(editingLead.phone);
      setInterestedService(editingLead.interestedService);
      setSource(editingLead.source);
      setStatus(editingLead.status);
      setAssignedSalesMemberId(editingLead.assignedSalesMemberId);
      setDealEstimate(String(editingLead.dealEstimate || 0));
      setNotes(editingLead.notes || '');
    }
  }, [editingLead]);

  if (!editingLead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const assigned = salesMembers.find((m) => m.memberId === assignedSalesMemberId);
    const assignedSalesMemberName = assigned ? assigned.name : editingLead.assignedSalesMemberName;

    setIsLoading(true);
    try {
      await editLead(editingLead.id, {
        name,
        company,
        email,
        phone,
        interestedService,
        source,
        status,
        assignedSalesMemberId,
        assignedSalesMemberName,
        dealEstimate: Number(dealEstimate) || 0,
        notes,
      });

      setEditingLead(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update lead.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!editingLead}
      onClose={() => setEditingLead(null)}
      title={`Edit Lead (${editingLead.leadId})`}
      subtitle="Update prospect status, negotiation stage, and assigned representative"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setEditingLead(null)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Lead
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
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Stage Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Proposal', label: 'Proposal' },
              { value: 'Won', label: 'Won' },
              { value: 'Lost', label: 'Lost' },
            ]}
          />

          <Input
            label="Deal Estimate (₹)"
            type="number"
            value={dealEstimate}
            onChange={(e) => setDealEstimate(e.target.value)}
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

        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </form>
    </Modal>
  );
}
