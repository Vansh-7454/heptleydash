'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { Lead } from '@/types';
import { CheckCircle, ArrowRight, DollarSign, UserCheck } from 'lucide-react';

interface ConvertLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertLeadModal({ lead, isOpen, onClose }: ConvertLeadModalProps) {
  const { convertLead, salesMembers, role } = useDashboard();

  const [dealValue, setDealValue] = useState(lead?.dealEstimate ? String(lead.dealEstimate) : '250000');
  const [discount, setDiscount] = useState('0');
  const [amountPaid, setAmountPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [packageType, setPackageType] = useState('Enterprise Spatial Portal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(lead?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const val = Number(dealValue) || 0;
      const disc = Number(discount) || 0;
      const paid = Number(amountPaid) || 0;

      await convertLead(lead.id, {
        dealValue: val,
        discount: disc,
        amountPaid: paid,
        paymentMethod,
        package: packageType,
        startDate,
        notes,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to convert lead to customer.');
    } finally {
      setIsLoading(false);
    }
  };

  const val = Number(dealValue) || 0;
  const disc = Number(discount) || 0;
  const finalAmt = Math.max(0, val - disc);
  const paid = Number(amountPaid) || 0;
  const rem = Math.max(0, finalAmt - paid);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Customer Account"
      subtitle={`Promote ${lead.name} (${lead.company}) from sales pipeline to verified client`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<UserCheck size={14} />}
          >
            Confirm & Create Customer
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

        {/* Lead Source Summary Card */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {lead.name} • {lead.company}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
              {lead.leadId}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Email: {lead.email} | Phone: {lead.phone} | Rep: {lead.assignedSalesMemberName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Requested Domain: <strong>{lead.interestedService}</strong>
          </div>
        </div>

        {/* Commercial Terms */}
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Commercial & Onboarding Details
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Service Package"
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            required
          />
          <Input
            label="Onboarding Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Agreed Deal Value (₹)"
            type="number"
            value={dealValue}
            onChange={(e) => setDealValue(e.target.value)}
            required
          />
          <Input
            label="Discount (₹)"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Initial Amount Paid (₹)"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
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

        {/* Real-time Ledger Preview */}
        <div
          style={{
            margin: '0.875rem 0',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#1e40af',
          }}
        >
          <span>Net Total: ₹{finalAmt.toLocaleString('en-IN')}</span>
          <span>Paid: ₹{paid.toLocaleString('en-IN')}</span>
          <span style={{ fontWeight: 700 }}>Balance: ₹{rem.toLocaleString('en-IN')}</span>
        </div>

        <Input
          label="Conversion Remarks / Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes on scope handover, special terms, or kickoff milestones..."
        />
      </form>
    </Modal>
  );
}
