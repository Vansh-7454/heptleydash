'use client';

import React from 'react';
import Modal from '@/components/common/Modal';
import { useDashboard } from '@/context/DashboardContext';
import { Mail, Phone, Calendar, CheckCircle2, Briefcase, ExternalLink, User } from 'lucide-react';

export default function MemberDetailsModal() {
  const {
    viewingSalesMember,
    setViewingSalesMember,
    customers,
    openCustomerDetails,
    setDetailedCustomerView,
    setCurrentSalesMember,
    setRole,
  } = useDashboard();

  if (!viewingSalesMember) return null;

  const memberCustomers = customers.filter(
    (c) => c.salesMemberId === viewingSalesMember.memberId
  );

  return (
    <Modal
      isOpen={Boolean(viewingSalesMember)}
      onClose={() => setViewingSalesMember(null)}
      title={viewingSalesMember.name}
      subtitle={`Sales Representative Profile • ${viewingSalesMember.memberId}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Info Ribbon */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.875rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              Sales Member ID
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'var(--brand-accent)',
                fontSize: '0.95rem',
              }}
            >
              {viewingSalesMember.memberId}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              Account Status
            </span>
            <span
              className={`badge ${
                viewingSalesMember.status === 'Active' ? 'badge-active' : 'badge-inactive'
              }`}
              style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
            >
              {viewingSalesMember.status === 'Active' && <CheckCircle2 size={10} />}
              {viewingSalesMember.status}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              Email Address
            </span>
            <span style={{ fontWeight: 500 }}>{viewingSalesMember.email}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              Phone Number
            </span>
            <span style={{ fontWeight: 500 }}>{viewingSalesMember.phone}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              Number of Customers
            </span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {memberCustomers.length} clients
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              Joining Date
            </span>
            <span style={{ fontWeight: 500 }}>{viewingSalesMember.joiningDate || '2026-08-01'}</span>
          </div>
        </div>

        {/* Assigned Customers Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Assigned Customers ({memberCustomers.length})
            </div>
            <button
              onClick={() => {
                setCurrentSalesMember(viewingSalesMember);
                setViewingSalesMember(null);
                setRole('sales');
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>Open Sales Workspace</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {memberCustomers.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
              }}
            >
              No customer accounts currently assigned to this representative.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {memberCustomers.map((customer) => (
                <div
                  key={customer.id}
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--brand-primary)',
                        }}
                      >
                        {customer.customerId}
                      </span>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {customer.name}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {customer.service} • {customer.company}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewingSalesMember(null);
                      setDetailedCustomerView(customer);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            onClick={() => setViewingSalesMember(null)}
            className="btn btn-outline btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
