'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { LeadSource, ProjectStatus, CustomerContractStatus } from '@/types';

export default function EditCustomerModal() {
  const {
    editingCustomer,
    setEditingCustomer,
    editCustomer,
    salesMembers,
    role,
  } = useDashboard();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [service, setService] = useState('');
  const [pkg, setPkg] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('In Progress');
  const [status, setStatus] = useState<CustomerContractStatus>('Active');
  const [salesMemberId, setSalesMemberId] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('Direct Referral');
  const [dealValue, setDealValue] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [amountPaid, setAmountPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setCompany(editingCustomer.company);
      setEmail(editingCustomer.email);
      setPhone(editingCustomer.phone);
      setAlternatePhone(editingCustomer.alternatePhone || '');
      setLocation(editingCustomer.location);
      setWebsite(editingCustomer.website || '');
      setService(editingCustomer.service);
      setPkg(editingCustomer.package);
      setStartDate(editingCustomer.startDate);
      setEndDate(editingCustomer.endDate);
      setProjectStatus(editingCustomer.projectStatus);
      setStatus(editingCustomer.status);
      setSalesMemberId(editingCustomer.salesMemberId);
      setLeadSource(editingCustomer.leadSource);
      setDealValue(String(editingCustomer.dealValue || 0));
      setDiscount(String(editingCustomer.discount || 0));
      setAmountPaid(String(editingCustomer.amountPaid || 0));
      setPaymentMethod(editingCustomer.paymentMethod || 'Bank Transfer');
      setNotes(editingCustomer.notes || '');
      setInternalRemarks(editingCustomer.internalRemarks || '');
    }
  }, [editingCustomer]);

  if (!editingCustomer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const assignedMember = salesMembers.find((m) => m.memberId === salesMemberId);
    const salesMemberName = assignedMember ? assignedMember.name : editingCustomer.salesMemberName;

    setIsLoading(true);
    try {
      const val = Number(dealValue) || 0;
      const disc = Number(discount) || 0;
      const paid = Number(amountPaid) || 0;

      await editCustomer(editingCustomer.id, {
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
        status,
        salesMemberId,
        salesMemberName,
        leadSource,
        dealValue: val,
        discount: disc,
        amountPaid: paid,
        paymentMethod,
        notes,
        internalRemarks,
      });

      setEditingCustomer(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update customer account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!editingCustomer}
      onClose={() => setEditingCustomer(null)}
      title={`Edit Customer (${editingCustomer.customerId})`}
      subtitle="Update client specifications, contract status, or billing values"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setEditingCustomer(null)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Customer Data
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
          <Input label="Contact Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Service"
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
          <Select
            label="Contract Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Onboarding', label: 'Onboarding' },
              { value: 'On Hold', label: 'On Hold' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
          <Input label="Deal Value (₹)" type="number" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
          <Input label="Discount (₹)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <Input label="Amount Paid (₹)" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
        </div>

        {role === 'admin' && (
          <Select
            label="Assigned Sales Member"
            value={salesMemberId}
            onChange={(e) => setSalesMemberId(e.target.value)}
            options={salesMembers.map((m) => ({ value: m.memberId, label: `${m.name} (${m.memberId})` }))}
          />
        )}

        <Input label="Internal Remarks" value={internalRemarks} onChange={(e) => setInternalRemarks(e.target.value)} />
      </form>
    </Modal>
  );
}
