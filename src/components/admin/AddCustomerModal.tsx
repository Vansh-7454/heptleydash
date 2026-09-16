'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useDashboard } from '@/context/DashboardContext';
import { ProjectStatus, CustomerStatus, LeadSource, CustomerContractStatus } from '@/types';
import { UserPlus, Hash, CheckCircle2 } from 'lucide-react';

export default function AddCustomerModal() {
  const { isAddCustomerModalOpen, setIsAddCustomerModalOpen, addCustomer, getNextCustomerId, salesMembers } = useDashboard();

  const nextCustomerId = getNextCustomerId();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    alternatePhone: '',
    location: '',
    service: 'Website Development',
    package: 'Enterprise Spatial Portal',
    leadSource: 'Website' as LeadSource,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    projectStatus: 'Planning' as ProjectStatus,
    customerStatus: 'Active' as CustomerStatus,
    status: 'Active' as CustomerContractStatus,
    salesMemberId: salesMembers[0]?.memberId || 'SM-001',
    notes: '',
    internalRemarks: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) errs.name = 'Customer Name is required';
    if (!formData.company.trim()) errs.company = 'Company Name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (digitsOnly.length < 10) {
      errs.phone = 'Phone number must be at least 10 digits';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        errs.endDate = 'End date cannot be earlier than start date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const created = addCustomer({
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone.trim(),
        location: formData.location.trim() || 'India',
        service: formData.service,
        package: formData.package,
        leadSource: formData.leadSource,
        startDate: formData.startDate,
        endDate: formData.endDate,
        projectStatus: formData.projectStatus,
        customerStatus: formData.customerStatus,
        status: formData.status,
        salesMemberId: formData.salesMemberId,
        notes: formData.notes.trim(),
        internalRemarks: formData.internalRemarks.trim(),
      });

      setSuccess(`Customer "${created.name}" created with ID ${created.customerId}!`);
      setErrors({});

      setTimeout(() => {
        setSuccess('');
        setIsAddCustomerModalOpen(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          alternatePhone: '',
          location: '',
          service: 'Website Development',
          package: 'Enterprise Spatial Portal',
          leadSource: 'Website' as LeadSource,
          startDate: '2026-10-01',
          endDate: '2026-12-31',
          projectStatus: 'Planning',
          customerStatus: 'Active',
          status: 'Active' as CustomerContractStatus,
          salesMemberId: salesMembers[0]?.memberId || 'SM-001',
          notes: '',
          internalRemarks: '',
        });
      }, 700);
    } catch {
      setErrors({ global: 'Failed to create customer.' });
    }
  };

  return (
    <Modal
      isOpen={isAddCustomerModalOpen}
      onClose={() => setIsAddCustomerModalOpen(false)}
      title="Add New Customer"
      subtitle="Register an account in the enterprise directory"
    >
      <form onSubmit={handleSubmit}>
        {/* Next ID Preview */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hash size={16} style={{ color: 'var(--brand-accent)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Auto-Generated Customer ID:
            </span>
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--brand-primary)',
              backgroundColor: 'var(--bg-surface)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
            }}
          >
            {nextCustomerId}
          </span>
        </div>

        {errors.global && (
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {errors.global}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-active-bg)',
              border: '1px solid var(--status-active-border)',
              color: 'var(--status-active-text)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="form-section">
          <div className="form-section-title">1. Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                placeholder="e.g. Orion Tech Pvt Ltd"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="form-input"
              />
              {errors.company && <span className="form-error-msg">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. contact@oriontech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g. 9811223344"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
              {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Phone</label>
              <input
                type="tel"
                placeholder="e.g. 9811223399"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / City</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Karnataka"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Service */}
        <div className="form-section">
          <div className="form-section-title">2. Service & Timeline</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="form-select"
              >
                <option value="Website Development">Website Development</option>
                <option value="SEO & Growth Marketing">SEO & Growth Marketing</option>
                <option value="Spatial Web App">Spatial Web App</option>
                <option value="Brand Identity & Strategy">Brand Identity & Strategy</option>
                <option value="E-Commerce Platform">E-Commerce Platform</option>
                <option value="Mobile Web Portal">Mobile Web Portal</option>
                <option value="Cloud Migration & Support">Cloud Migration & Support</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Package Tier</label>
              <input
                type="text"
                placeholder="e.g. Enterprise Spatial Portal"
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Acquisition Source</label>
              <select
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value as LeadSource })}
                className="form-select"
              >
                <option value="Website">Website Inbound</option>
                <option value="Inbound Demo">Inbound Demo</option>
                <option value="LinkedIn">LinkedIn Outreach</option>
                <option value="Referral">Client Referral</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Partner">Partner Channel</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="form-input"
              />
              {errors.endDate && <span className="form-error-msg">{errors.endDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Project Status</label>
              <select
                value={formData.projectStatus}
                onChange={(e) =>
                  setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })
                }
                className="form-select"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contract Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as CustomerContractStatus })
                }
                className="form-select"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Sales Assignment */}
        <div className="form-section">
          <div className="form-section-title">3. Sales Assignment</div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assigned Sales Member (Account Owner) *</label>
            <select
              value={formData.salesMemberId}
              onChange={(e) => setFormData({ ...formData, salesMemberId: e.target.value })}
              className="form-select"
            >
              {salesMembers.map((sm) => (
                <option key={sm.id} value={sm.memberId}>
                  {sm.name} ({sm.memberId}) — {sm.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 4: Notes & Internal Remarks */}
        <div className="form-section">
          <div className="form-section-title">4. Notes & Remarks</div>
          <div className="form-group">
            <label className="form-label">Customer Notes</label>
            <textarea
              rows={2}
              placeholder="Client requirements, scope summary..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Internal Remarks</label>
            <textarea
              rows={2}
              placeholder="Internal team notes, priority flags..."
              value={formData.internalRemarks}
              onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsAddCustomerModalOpen(false)}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <UserPlus size={15} />
            <span>Create Customer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
