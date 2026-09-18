'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { PaymentMethod } from '@/types';

export default function RecordPaymentModal() {
  const { isRecordPaymentModalOpen, setIsRecordPaymentModalOpen, recordPayment, customers } = useDashboard();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [totalAmount, setTotalAmount] = useState('100000');
  const [amountPaid, setAmountPaid] = useState('100000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomer) {
      setError('Please select a customer account.');
      return;
    }

    const total = Number(totalAmount) || 0;
    const paid = Number(amountPaid) || 0;

    if (paid <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }

    setIsLoading(true);
    try {
      await recordPayment({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        company: selectedCustomer.company,
        totalAmount: total,
        amountPaid: paid,
        remaining: Math.max(0, total - paid),
        paymentStatus: paid >= total ? 'Paid' : 'Partial',
        paymentMethod,
        paymentDate,
        dueDate,
        notes,
      });

      setIsRecordPaymentModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isRecordPaymentModalOpen}
      onClose={() => setIsRecordPaymentModalOpen(false)}
      title="Record Payment Receipt"
      subtitle="Log transaction clearance against customer contract"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setIsRecordPaymentModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Record Payment
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

        <Select
          label="Customer Account"
          value={customerId}
          onChange={(e) => {
            const cid = e.target.value;
            setCustomerId(cid);
            const found = customers.find((c) => c.id === cid);
            if (found) {
              setTotalAmount(String(found.finalAmount));
              setAmountPaid(String(found.remainingAmount || found.finalAmount));
            }
          }}
          options={customers.map((c) => ({
            value: c.id,
            label: `${c.name} - ${c.company} (Remaining: ₹${c.remainingAmount.toLocaleString('en-IN')})`,
          }))}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Input
            label="Total Invoice Amount (₹)"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
          />

          <Input
            label="Amount Paid Today (₹)"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)' },
              { value: 'UPI', label: 'UPI / QR' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Cash', label: 'Cash Receipt' },
            ]}
          />

          <Input
            label="Payment Clearance Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>

        <Input
          label="Transaction Notes / Reference"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. UTR reference number or milestone 2 completion receipt..."
        />
      </form>
    </Modal>
  );
}
