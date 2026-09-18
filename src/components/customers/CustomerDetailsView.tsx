'use client';

import React, { useState, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Badge, Button, Input, Table } from '@/components/ui';
import EditCustomerModal from './EditCustomerModal';
import {
  ArrowLeft,
  Edit2,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  ArrowUpRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import CustomerAISalesIntelligence from './CustomerAISalesIntelligence';

export default function CustomerDetailsView() {
  const {
    detailedCustomerView,
    setDetailedCustomerView,
    setEditingCustomer,
    followUps,
    markFollowUpComplete,
    setIsAddFollowUpModalOpen,
    activities,
    logActivity,
    payments,
    setIsRecordPaymentModalOpen,
    role,
    userProfile,
    setActiveAdminTab,
    setActiveSalesTab,
    setSelectedAiEntity,
    showToast,
    setIsLogActivityModalOpen,
  } = useDashboard();

  const [newNote, setNewNote] = useState('');
  const [isLoggingNote, setIsLoggingNote] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);

  if (!detailedCustomerView) return null;

  const customer = detailedCustomerView;

  // Timeline activities associated with this customer
  const customerTimeline = activities.filter(
    (a) =>
      a.entityId === customer.id ||
      a.entityId === customer.customerId ||
      (a.entityName && a.entityName.toLowerCase().includes(customer.name.toLowerCase())) ||
      (a.company && a.company.toLowerCase().includes(customer.company.toLowerCase()))
  );

  // Payments associated with this customer
  const customerPayments = payments.filter(
    (p) =>
      p.customerId === customer.id ||
      p.customerId === customer.customerId ||
      (p.customerName && p.customerName.toLowerCase().includes(customer.name.toLowerCase())) ||
      (p.company && p.company.toLowerCase().includes(customer.company.toLowerCase()))
  );

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) {
      showToast('Please type your note in the input box first', 'info');
      noteInputRef.current?.focus();
      return;
    }

    setIsLoggingNote(true);
    try {
      await logActivity({
        userId: userProfile.id,
        userName: userProfile.name,
        userRole: role || 'sales',
        entityType: 'customer',
        entityId: customer.id,
        entityName: customer.name,
        company: customer.company,
        type: 'Note',
        description: `Note added: "${newNote.trim()}"`,
      });
      setNewNote('');
      showToast('Note added to activity timeline!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to log note', 'error');
    } finally {
      setIsLoggingNote(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Back Button & Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={() => setDetailedCustomerView(null)}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.45rem' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Customers Directory</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles size={14} style={{ color: 'var(--brand-accent)' }} />}
            onClick={() => {
              setSelectedAiEntity({
                type: 'customer',
                id: customer.customerId || customer.id,
                name: customer.name,
              });
              if (role === 'sales') {
                setActiveSalesTab('ai-assistant');
              } else {
                setActiveAdminTab('ai-assistant');
              }
              setDetailedCustomerView(null);
            }}
          >
            Ask AI about this customer
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit2 size={14} />}
            onClick={() => setEditingCustomer(customer)}
          >
            Edit Customer
          </Button>
        </div>
      </div>

      {/* Customer Header Summary Banner */}
      <Card style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              {customer.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {customer.name}
                </h2>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ({customer.customerId})
                </span>
                <Badge variant={customer.status === 'Active' ? 'active' : customer.status === 'Onboarding' ? 'info' : 'warning'}>
                  {customer.status}
                </Badge>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {customer.company} · Assigned Representative: <strong style={{ color: 'var(--text-primary)' }}>{customer.salesMemberName}</strong> ({customer.salesMemberId})
              </p>
            </div>
          </div>

          {role === 'admin' ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Total Contract Value
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{customer.finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Balance Outstanding
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: customer.remainingAmount > 0 ? '#b45309' : '#059669' }}>
                  ₹{customer.remainingAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Service Domain
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {customer.service}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Package
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>
                  {customer.package || 'Standard'}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main Grid: Structured Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* SECTION 1: CUSTOMER INFORMATION */}
        <Card title="Customer Information" subtitle="Primary account profile and contact coordinates">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Name</span>
              <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Company</span>
              <strong style={{ color: 'var(--text-primary)' }}>{customer.company}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email</span>
              <a href={`mailto:${customer.email}`} style={{ color: 'var(--brand-accent)' }}>
                {customer.email}
              </a>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.phone}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Alternate Phone</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.alternatePhone || '—'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Location</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.location}</span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Website</span>
              {customer.website ? (
                <a href={customer.website} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>{customer.website}</span>
                  <Globe size={13} />
                </a>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          </div>
        </Card>

        {/* SECTION 2: SERVICE INFORMATION */}
        <Card title="Service Information" subtitle="Project scope, packages, and milestone milestones">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Service Deliverable</span>
              <strong style={{ color: 'var(--text-primary)' }}>{customer.service}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Package Tier</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.package}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Start Date</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.startDate}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>End Date</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.endDate}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Project Status</span>
              <Badge variant={customer.projectStatus === 'Completed' ? 'active' : customer.projectStatus === 'In Progress' ? 'info' : 'warning'}>
                {customer.projectStatus}
              </Badge>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer Status</span>
              <Badge variant="active">{customer.customerStatus}</Badge>
            </div>
          </div>
        </Card>

        {/* SECTION 3: SALES INFORMATION */}
        <Card title="Sales Information" subtitle="Representative allocation and commercial agreement">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Assigned Sales Member</span>
              <strong style={{ color: 'var(--text-primary)' }}>{customer.salesMemberName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                ({customer.salesMemberId})
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Lead Source</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.leadSource}</span>
            </div>
            {role === 'admin' && (
              <>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Deal Gross Value</span>
                  <span style={{ color: 'var(--text-primary)' }}>₹{customer.dealValue.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Discount Applied</span>
                  <span style={{ color: '#ef4444' }}>- ₹{customer.discount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ gridColumn: 'span 2', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Final Contract Amount</span>
                  <strong style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                    ₹{customer.finalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* SECTION 4: PAYMENT INFORMATION (Admin Only) */}
        {role === 'admin' && (
          <Card
            title="Payment Information"
          subtitle="Billing status, received payments, and balances"
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CreditCard size={14} />}
              onClick={() => setIsRecordPaymentModalOpen(true)}
            >
              Record Payment
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Amount Invoiced</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹{customer.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Amount Paid</span>
              <strong style={{ color: '#059669' }}>₹{customer.amountPaid.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Remaining Balance</span>
              <strong style={{ color: customer.remainingAmount > 0 ? '#d97706' : '#059669' }}>
                ₹{customer.remainingAmount.toLocaleString('en-IN')}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Payment Status</span>
              <Badge
                variant={
                  customer.paymentStatus === 'Paid'
                    ? 'active'
                    : customer.paymentStatus === 'Partial'
                    ? 'warning'
                    : customer.paymentStatus === 'Overdue'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {customer.paymentStatus}
              </Badge>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Payment Method</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.paymentMethod}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Last Payment Date</span>
              <span style={{ color: 'var(--text-primary)' }}>{customer.lastPaymentDate || 'No record'}</span>
            </div>
          </div>

          {customerPayments.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Payment Receipts ({customerPayments.length})
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Receipt Ref</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Date</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Method</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPayments.map((p, idx) => (
                      <tr key={`cp-${p.id || p.paymentRef || idx}-${idx}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontWeight: 600 }}>{p.paymentRef}</td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{p.paymentDate}</td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{p.paymentMethod}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                          ₹{p.amountPaid.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Badge variant={p.paymentStatus === 'Paid' ? 'active' : 'warning'}>{p.paymentStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </Card>
        )}
      </div>

      {/* SECTION 5: NOTES & REMARKS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        <Card title="Notes & Client Specifications" subtitle="Account scope and deliverables requirements">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {customer.notes || 'No project notes recorded for this customer.'}
          </p>
        </Card>

        <Card title="Internal Administrative Remarks" subtitle="Confidential notes for Heptley management and reps">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {customer.internalRemarks || 'No internal remarks registered.'}
          </p>
        </Card>
      </div>

      {/* SECTION 6: SCHEDULED FOLLOW-UPS FOR THIS CUSTOMER */}
      <Card
        title="Scheduled Follow-ups"
        subtitle="Pending tasks and scheduled consultations for this account"
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAddFollowUpModalOpen(true)}
          >
            Add Follow-up
          </Button>
        }
      >
        {(() => {
          const customerFollowUps = followUps.filter(
            (f) =>
              f.entityId === customer.id ||
              f.entityId === customer.customerId ||
              (f.entityName && f.entityName.toLowerCase().includes(customer.name.toLowerCase())) ||
              (f.company && f.company.toLowerCase().includes(customer.company.toLowerCase()))
          );

          if (customerFollowUps.length === 0) {
            return (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={22} style={{ margin: '0 auto 0.4rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>No pending follow-ups scheduled for this customer.</p>
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {customerFollowUps.map((f, idx) => (
                <div
                  key={`cf-${f.id || f.followUpId || idx}-${idx}`}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {f.title}
                      </span>
                      <Badge variant={f.status === 'Completed' ? 'active' : f.status === 'Overdue' ? 'danger' : 'warning'}>
                        {f.status}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {f.date} at {f.time} · Channel: {f.type} · Rep: {f.assignedSalesMemberName}
                    </div>
                    {f.note && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        "{f.note}"
                      </div>
                    )}
                  </div>

                  {f.status !== 'Completed' && (
                    <Button variant="outline" size="sm" onClick={() => markFollowUpComplete(f.id)}>
                      Mark Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* SECTION 7: ACTIVITY TIMELINE */}
      <Card
        title="Activity Timeline"
        subtitle="Chronological history of interactions, payments, and contract milestones"
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText size={14} />}
            onClick={() => setIsLogActivityModalOpen(true)}
          >
            Log Detailed Activity
          </Button>
        }
      >
        {/* Quick Log Note Form */}
        <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <Input
            ref={noteInputRef}
            placeholder="Type an internal interaction note or call update for this account..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            containerClassName="mb-0"
            style={{ flex: 1 }}
          />
          <Button variant="primary" size="sm" type="submit" isLoading={isLoggingNote} leftIcon={<Plus size={14} />}>
            Save Note
          </Button>
        </form>

        {customerTimeline.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem' }}>No logged activities found for this account yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1rem' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '19px',
                width: '2px',
                backgroundColor: 'var(--border-default)',
              }}
            />
            {customerTimeline.map((item, idx) => (
              <div key={`ctl-${item.id || idx}-${idx}`} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-accent)',
                    border: '2px solid var(--bg-surface)',
                    marginTop: '0.35rem',
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
                      {item.type} · by {item.userName}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION 8: AI SALES INTELLIGENCE */}
      <CustomerAISalesIntelligence customer={customer} />

    </div>
  );
}
