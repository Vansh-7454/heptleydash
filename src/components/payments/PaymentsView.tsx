'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Payment } from '@/types';
import { Card, Table, Badge, Button, Input, Select } from '@/components/ui';
import RecordPaymentModal from './RecordPaymentModal';
import { CreditCard, Search, Plus, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { exportPaymentsToExcel } from '@/utils/exportExcel';

export default function PaymentsView() {
  const { payments, customers, setIsRecordPaymentModalOpen, showToast } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);

  // Summary Metrics
  const totalBilled = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = payments.reduce((sum, p) => sum + p.remaining, 0);
  const overdueCount = payments.filter((p) => p.paymentStatus === 'Overdue').length;

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.customerName.toLowerCase().includes(query) ||
      p.company.toLowerCase().includes(query) ||
      p.paymentRef.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (p: Payment) => {
    showToast(`Payment reminder dispatched to ${p.customerName} (${p.company}) for ₹${p.remaining.toLocaleString('en-IN')}`, 'info');
  };


  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const handleExportPaymentsExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportPaymentsToExcel(filteredPayments);
    } catch (err) {
      console.error('Failed to export payments Excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.25rem 0',
            }}
          >
            Payments
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Track customer payments, invoices and payment statuses.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet size={16} style={{ color: '#059669' }} />}
            onClick={handleExportPaymentsExcel}
            isLoading={isExportingExcel}
            style={{
              fontWeight: 700,
              borderColor: '#34d399',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              boxShadow: '0 1px 4px rgba(16, 185, 129, 0.15)',
            }}
          >
            Export Formatted Excel (.xlsx)
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={() => setIsRecordPaymentModalOpen(true)}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Total Contracted Billed
          </span>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.35rem 0 0' }}>
            ₹{totalBilled.toLocaleString('en-IN')}
          </h3>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across all active accounts
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Total Amount Collected
          </span>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#059669', margin: '0.35rem 0 0' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </h3>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>
            {totalBilled > 0 ? `${Math.round((totalCollected / totalBilled) * 100)}% realization rate` : '100%'}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Outstanding Receivable
          </span>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#d97706', margin: '0.35rem 0 0' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </h3>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Due upon milestone delivery
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Overdue Invoices
          </span>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 700, color: overdueCount > 0 ? '#dc2626' : 'var(--text-primary)', margin: '0.35rem 0 0' }}>
            {overdueCount}
          </h3>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: overdueCount > 0 ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
            {overdueCount > 0 ? 'Requires collection follow-up' : 'All accounts in good standing'}
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '420px' }}>
            <Input
              placeholder="Search by customer, company, invoice ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              containerClassName="mb-0"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerClassName="mb-0"
            style={{ minWidth: '180px' }}
            options={[
              { value: 'all', label: 'All Payment Statuses' },
              { value: 'Paid', label: 'Paid in Full' },
              { value: 'Partial', label: 'Partial Balance' },
              { value: 'Pending', label: 'Pending Settlement' },
              { value: 'Overdue', label: 'Overdue Alert' },
            ]}
          />
        </div>
      </Card>

      {/* Payments Table */}
      <Card noPadding>
        <Table
          columns={[
            {
              key: 'paymentRef',
              header: 'Payment / Invoice ID',
              width: '140px',
              render: (p) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-primary)' }}>
                  {p.paymentRef}
                </span>
              ),
            },
            {
              key: 'customer',
              header: 'Customer & Company',
              render: (p) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.customerName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.company}</div>
                </div>
              ),
            },
            {
              key: 'service',
              header: 'Service',
              render: (p) => {
                const customer = customers.find((c) => c.id === p.customerId || c.customerId === p.customerId || c.company === p.company);
                return <span style={{ fontSize: '0.8125rem' }}>{customer?.service || 'Business Solution'}</span>;
              },
            },
            {
              key: 'totalAmount',
              header: 'Total Amount',
              render: (p) => (
                <span style={{ fontWeight: 600 }}>₹{p.totalAmount.toLocaleString('en-IN')}</span>
              ),
            },
            {
              key: 'amountPaid',
              header: 'Amount Paid',
              render: (p) => (
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  ₹{p.amountPaid.toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              key: 'remaining',
              header: 'Remaining Balance',
              render: (p) => (
                <span style={{ color: p.remaining > 0 ? '#d97706' : '#059669', fontWeight: 600 }}>
                  ₹{p.remaining.toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              key: 'paymentStatus',
              header: 'Payment Status',
              width: '120px',
              render: (p) => (
                <Badge
                  variant={
                    p.paymentStatus === 'Paid'
                      ? 'active'
                      : p.paymentStatus === 'Partial'
                      ? 'warning'
                      : p.paymentStatus === 'Overdue'
                      ? 'danger'
                      : 'neutral'
                  }
                >
                  {p.paymentStatus}
                </Badge>
              ),
            },
            {
              key: 'method',
              header: 'Payment Method',
              render: (p) => (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {p.paymentMethod}
                </span>
              ),
            },
            {
              key: 'paymentDate',
              header: 'Payment / Due Date',
              width: '140px',
              render: (p) => (
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: 'var(--text-primary)' }}>Paid: {p.paymentDate}</div>
                  {p.dueDate && <div style={{ color: 'var(--text-muted)' }}>Due: {p.dueDate}</div>}
                </div>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              width: '190px',
              align: 'right',
              render: (p) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <button
                    onClick={() => setSelectedInvoice(p)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                    title="View Invoice"
                  >
                    Invoice
                  </button>
                  {p.remaining > 0 && (
                    <button
                      onClick={() => handleSendReminder(p)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', color: '#d97706', borderColor: '#fde68a' }}
                      title="Send Reminder"
                    >
                      Remind
                    </button>
                  )}
                  <button
                    onClick={() => setIsRecordPaymentModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                    title="Record Payment"
                  >
                    + Pay
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredPayments}
          keyExtractor={(p) => p.id}
          emptyMessage="No payments match the selected filters."
        />
      </Card>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <Card
          style={{
            position: 'fixed',
            inset: '10% auto auto 50%',
            transform: 'translateX(-50%)',
            maxWidth: '520px',
            width: '90%',
            zIndex: 100,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-default)',
            padding: '1.75rem',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Invoice Statement</h3>
              <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--brand-accent)', margin: '0.2rem 0 0' }}>
                {selectedInvoice.paymentRef}
              </p>
            </div>
            <Badge variant={selectedInvoice.paymentStatus === 'Paid' ? 'active' : 'warning'}>
              {selectedInvoice.paymentStatus}
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Billed To:</span>
              <strong>{selectedInvoice.customerName}</strong>
              <div style={{ color: 'var(--text-secondary)' }}>{selectedInvoice.company}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Payment Method:</span>
              <span>{selectedInvoice.paymentMethod}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Total Amount:</span>
              <strong>₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Amount Settled:</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>₹{selectedInvoice.amountPaid.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ gridColumn: 'span 2', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Outstanding Balance:</span>
              <strong style={{ fontSize: '1rem', color: selectedInvoice.remaining > 0 ? '#d97706' : '#059669' }}>
                ₹{selectedInvoice.remaining.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
