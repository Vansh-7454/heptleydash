'use client';

import React from 'react';
import Modal from '@/components/common/Modal';
import { useDashboard } from '@/context/DashboardContext';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
} from 'lucide-react';

export default function CustomerDetailsModal() {
  const { selectedCustomer, closeCustomerDetails, setEditingCustomer, role } = useDashboard();

  if (!selectedCustomer) return null;

  return (
    <Modal
      isOpen={Boolean(selectedCustomer)}
      onClose={closeCustomerDetails}
      title={selectedCustomer.name}
      subtitle={`Customer ID: ${selectedCustomer.customerId}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Ribbon: Statuses & Quick Edit Button */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              CUSTOMER & PROJECT STATUS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span
                className={`badge ${
                  selectedCustomer.status === 'Active'
                    ? 'badge-active'
                    : selectedCustomer.status === 'Completed'
                    ? 'badge-role-admin'
                    : 'badge-pending'
                }`}
              >
                {selectedCustomer.status === 'Active' && <CheckCircle2 size={11} />}
                {(selectedCustomer.status === 'Onboarding' || selectedCustomer.status === 'On Hold') && <Clock size={11} />}
                <span>{selectedCustomer.status}</span>
              </span>

              <span
                className="badge"
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid var(--border-default)',
                }}
              >
                Project: {selectedCustomer.projectStatus || 'In Progress'}
              </span>

              <span
                className="badge"
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  border: '1px solid var(--border-default)',
                }}
              >
                Standing: {selectedCustomer.customerStatus || 'Active'}
              </span>
            </div>
          </div>

          {role === 'admin' && (
            <button
              onClick={() => {
                setEditingCustomer(selectedCustomer);
                closeCustomerDetails();
              }}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Edit2 size={13} />
              <span>Edit Account</span>
            </button>
          )}
        </div>

        {/* Section 1: Customer Information */}
        <div className="form-section">
          <div className="form-section-title">
            <Building size={16} style={{ color: 'var(--brand-accent)' }} />
            <span>1. Customer Information</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.875rem',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Customer Name</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.name}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Company / Business Name</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.company}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
              <span style={{ color: 'var(--text-primary)' }}>{selectedCustomer.email}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Phone Number</span>
              <span style={{ color: 'var(--text-primary)' }}>{selectedCustomer.phone}</span>
            </div>

            {selectedCustomer.alternatePhone && (
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Alternate Phone</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedCustomer.alternatePhone}</span>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Location / City</span>
              <span style={{ color: 'var(--text-primary)' }}>{selectedCustomer.location}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Service Information */}
        <div className="form-section">
          <div className="form-section-title">
            <Calendar size={16} style={{ color: 'var(--brand-accent)' }} />
            <span>2. Service & Package Details</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.875rem',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Service Type</span>
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  backgroundColor: '#f1f5f9',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block',
                }}
              >
                {selectedCustomer.service}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Package Tier</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.package}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Project Status</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedCustomer.projectStatus || 'In Progress'}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Account Standing</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedCustomer.customerStatus || 'Active'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Sales Information & Contract Dates */}
        <div className="form-section">
          <div className="form-section-title">
            <User size={16} style={{ color: 'var(--brand-accent)' }} />
            <span>3. Sales Assignment & Timeline</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.875rem',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Assigned Representative</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer.salesMemberName}</strong>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--brand-accent)',
                    fontWeight: 700,
                  }}
                >
                  ({selectedCustomer.salesMemberId})
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Contract Timeline</span>
              <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                <span>{selectedCustomer.startDate}</span>
                <span style={{ margin: '0 0.35rem', color: 'var(--text-muted)' }}>→</span>
                <span>{selectedCustomer.endDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Notes & Internal Remarks */}
        {(selectedCustomer.notes || selectedCustomer.internalRemarks) && (
          <div className="form-section">
            <div className="form-section-title">
              <FileText size={16} style={{ color: 'var(--brand-accent)' }} />
              <span>4. Notes & Internal Remarks</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              {selectedCustomer.notes && (
                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Customer Notes
                  </span>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{selectedCustomer.notes}</p>
                </div>
              )}

              {selectedCustomer.internalRemarks && (
                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#b45309', display: 'block', marginBottom: '0.2rem' }}>
                    Internal Remarks
                  </span>
                  <p style={{ color: '#92400e', lineHeight: 1.45 }}>{selectedCustomer.internalRemarks}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button onClick={closeCustomerDetails} className="btn btn-outline btn-sm">
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
