'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { LeadStatus } from '@/types';

export default function AddLeadModal() {
  const {
    isAddLeadModalOpen,
    setIsAddLeadModalOpen,
    addLead,
    salesMembers,
    role,
    userProfile,
  } = useDashboard();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interestedService, setInterestedService] = useState('Website Development');
  const [source, setSource] = useState('Website Inquiry');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [assignedSalesMemberId, setAssignedSalesMemberId] = useState(
    role === 'sales' ? userProfile.memberId || 'SM-001' : 'SM-001'
  );
  const [dealEstimate, setDealEstimate] = useState('200000');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !company.trim()) {
      setError('Please provide prospect name and company name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError('Provide at least one contact channel (email or phone).');
      return;
    }

    const assigned = salesMembers.find((m) => m.memberId === assignedSalesMemberId);
    const assignedSalesMemberName = assigned ? assigned.name : userProfile.name;

    setIsLoading(true);
    try {
      await addLead({
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

      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setNotes('');
      setIsAddLeadModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create lead.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAddLeadModalOpen}
      onClose={() => setIsAddLeadModalOpen(false)}
      title="Add Inbound Lead"
      subtitle="Capture potential prospect details and assign to sales team pipeline"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setIsAddLeadModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Register Lead
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
          <Input label="Prospect Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Vikram Patel" />
          <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="e.g. Acme Tech" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@acme.com" />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 00000" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Interested Service"
            value={interestedService}
            onChange={(e) => setInterestedService(e.target.value)}
            options={[
              { value: 'Website Development', label: 'Website Development' },
              { value: 'UI/UX Redesign', label: 'UI/UX Redesign' },
              { value: 'Cloud Modernization', label: 'Cloud Modernization' },
              { value: 'Mobile App', label: 'Mobile App' },
              { value: 'ERP Integration', label: 'ERP Integration' },
            ]}
          />

          <Select
            label="Lead Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={[
              { value: 'Website Inquiry', label: 'Website Inquiry' },
              { value: 'Direct Referral', label: 'Direct Referral' },
              { value: 'LinkedIn', label: 'LinkedIn' },
              { value: 'Partner Network', label: 'Partner Network' },
              { value: 'Cold Outreach', label: 'Cold Outreach' },
            ]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Pipeline Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'New', label: 'New Lead' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Proposal', label: 'Proposal Submitted' },
              { value: 'Won', label: 'Closed Won' },
              { value: 'Lost', label: 'Closed Lost' },
            ]}
          />

          <Input
            label="Estimated Deal Value (₹)"
            type="number"
            value={dealEstimate}
            onChange={(e) => setDealEstimate(e.target.value)}
          />
        </div>

        {role === 'admin' && (
          <Select
            label="Assign to Sales Member"
            value={assignedSalesMemberId}
            onChange={(e) => setAssignedSalesMemberId(e.target.value)}
            options={salesMembers.map((m) => ({ value: m.memberId, label: `${m.name} (${m.memberId})` }))}
          />
        )}

        <Input
          label="Prospect Requirements / Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Specific features, budget range, or timeline expectations..."
        />
      </form>
    </Modal>
  );
}
