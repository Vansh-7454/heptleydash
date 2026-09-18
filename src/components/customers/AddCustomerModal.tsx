'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { LeadSource, ProjectStatus, CustomerContractStatus } from '@/types';

export default function AddCustomerModal() {
  const {
    isAddCustomerModalOpen,
    setIsAddCustomerModalOpen,
    addCustomer,
    salesMembers,
    role,
    userProfile,
  } = useDashboard();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [website, setWebsite] = useState('');
  const [service, setService] = useState('Website Development');
  const [pkg, setPkg] = useState('Enterprise Spatial Portal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('In Progress');
  const [status, setStatus] = useState<CustomerContractStatus>('Active');
  const [salesMemberId, setSalesMemberId] = useState(
    role === 'sales' ? userProfile.memberId || 'SM-001' : 'SM-001'
  );
  const [leadSource, setLeadSource] = useState<LeadSource>('Direct Referral');
  const [dealValue, setDealValue] = useState('300000');
  const [discount, setDiscount] = useState('0');
  const [amountPaid, setAmountPaid] = useState('150000');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !company.trim()) {
      setError('Please provide customer name and company name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter contact email.');
      return;
    }

    const assignedMember = salesMembers.find((m) => m.memberId === salesMemberId);
    const salesMemberName = assignedMember ? assignedMember.name : userProfile.name;

    setIsLoading(true);
    try {
      const val = Number(dealValue) || 0;
      const disc = Number(discount) || 0;
      const finalAmt = val - disc;
      const paid = Number(amountPaid) || 0;
      const rem = Math.max(0, finalAmt - paid);

      await addCustomer({
        name,
        company,
        email,
        phone,
        alternatePhone,
        location,
        website,
        service,
        package: pkg,
        startDate,
        endDate,
        projectStatus,
        customerStatus: 'Active',
        status,
        salesMemberId,
        salesMemberName,
        leadSource,
        dealValue: val,
        discount: disc,
        finalAmount: finalAmt,
        totalAmount: finalAmt,
        amountPaid: paid,
        remainingAmount: rem,
        paymentStatus: paid >= finalAmt && finalAmt > 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending',
        paymentMethod,
        lastPaymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
        notes,
        internalRemarks,
      });

      setIsAddCustomerModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register customer account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAddCustomerModalOpen}
      onClose={() => setIsAddCustomerModalOpen(false)}
      title="Onboard New Customer"
      subtitle="Register client profile, contract scope, assigned rep, and commercial details"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setIsAddCustomerModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Complete Onboarding
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Customer Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Input label="Contact Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Primary Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Input label="Alternate Phone" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} />
            <Input label="Location (City, State)" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Input label="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
        </div>

        <div style={{ marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Service & Contract Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Select
              label="Service Deliverable"
              value={service}
              onChange={(e) => setService(e.target.value)}
              options={[
                { value: 'Website Development', label: 'Website Development' },
                { value: 'UI/UX Redesign', label: 'UI/UX Redesign' },
                { value: 'Cloud Modernization', label: 'Cloud Modernization' },
                { value: 'Mobile Web Portal', label: 'Mobile Web Portal' },
                { value: 'E-Commerce Platform', label: 'E-Commerce Platform' },
                { value: 'Fintech Security Portal', label: 'Fintech Security Portal' },
              ]}
            />
            <Input label="Service Package" value={pkg} onChange={(e) => setPkg(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Select
              label="Project Status"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value as any)}
              options={[
                { value: 'Planning', label: 'Planning' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Review', label: 'Review' },
                { value: 'Completed', label: 'Completed' },
                { value: 'On Hold', label: 'On Hold' },
              ]}
            />
            <Select
              label="Contract Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Onboarding', label: 'Onboarding' },
                { value: 'On Hold', label: 'On Hold' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Sales & Financials
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Select
              label="Assigned Sales Member"
              value={salesMemberId}
              onChange={(e) => setSalesMemberId(e.target.value)}
              disabled={role === 'sales'}
              options={salesMembers.map((m) => ({ value: m.memberId, label: `${m.name} (${m.memberId})` }))}
            />
            <Select
              label="Lead Source"
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value as any)}
              options={[
                { value: 'Direct Referral', label: 'Direct Referral' },
                { value: 'Website Inquiry', label: 'Website Inquiry' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Partner Network', label: 'Partner Network' },
                { value: 'Cold Outreach', label: 'Cold Outreach' },
                { value: 'Google Search', label: 'Google Search' },
              ]}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <Input label="Deal Value (₹)" type="number" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
            <Input label="Discount (₹)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            <Input label="Initial Paid (₹)" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          </div>
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)' },
              { value: 'UPI', label: 'UPI / QR' },
              { value: 'Credit Card', label: 'Corporate Card' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
          />
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            4. Notes & Remarks
          </h4>
          <Input label="Customer Project Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key scope elements and requirements..." />
          <Input label="Internal Administrative Remarks" value={internalRemarks} onChange={(e) => setInternalRemarks(e.target.value)} placeholder="Internal instructions for execution team..." />
        </div>
      </form>
    </Modal>
  );
}
