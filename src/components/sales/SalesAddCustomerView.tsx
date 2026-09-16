'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { ProjectStatus, CustomerStatus, LeadSource, CustomerContractStatus } from '@/types';
import { UserPlus, Hash, CheckCircle2, User, Building, Layers, ArrowLeft, Target } from 'lucide-react';

export default function SalesAddCustomerView() {
  const { currentSalesMember, addCustomer, getNextCustomerId, setActiveSalesTab } = useDashboard();

  const nextCustomerId = getNextCustomerId();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    alternatePhone: '',
    location: '',
    service: 'Website Development',
    package: 'Growth Tier Sprint',
    leadSource: 'Inbound Demo' as LeadSource,
    startDate: '2026-09-16',
    endDate: '2026-12-16',
    projectStatus: 'In Progress' as ProjectStatus,
    customerStatus: 'Active' as CustomerStatus,
    status: 'Active' as CustomerContractStatus,
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
      errs.email = 'Email Address is required';
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
        package: formData.package.trim(),
        leadSource: formData.leadSource,
        startDate: formData.startDate,
        endDate: formData.endDate,
        projectStatus: formData.projectStatus,
        customerStatus: formData.customerStatus,
        status: formData.status,
        salesMemberId: currentSalesMember.memberId, // Strictly bound to current sales representative session
        notes: formData.notes.trim(),
        internalRemarks: formData.internalRemarks.trim(),
      });

      setSuccess(`Client "${created.name}" (${created.customerId}) successfully added to your portfolio!`);
      setErrors({});

      setTimeout(() => {
        setSuccess('');
        setActiveSalesTab('my-customers'); // Redirect back to My Customers list
      }, 1000);
    } catch {
      setErrors({ global: 'Failed to create customer.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Add Customer to Portfolio
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Register a client account automatically bound to your representative ID ({currentSalesMember.memberId}).
          </p>
        </div>

        <button
          onClick={() => setActiveSalesTab('my-customers')}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          <span>Back to My Customers</span>
        </button>
      </div>

      {errors.global && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.875rem',
          }}
        >
          {errors.global}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-active-bg)',
            border: '1px solid var(--status-active-border)',
            color: 'var(--status-active-text)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Customer Information */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Building size={18} style={{ color: 'var(--brand-accent)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Customer Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Arjun Kapoor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Company / Business Name *</label>
              <input
                type="text"
                placeholder="e.g. Zenith Tech Solutions"
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
                placeholder="e.g. r.kapoor@zenithtech.in"
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
                placeholder="e.g. New Delhi, Delhi"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Service Details */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={18} style={{ color: 'var(--brand-accent)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              2. Service & Engagement
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Service</label>
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
              <label className="form-label">Package</label>
              <input
                type="text"
                placeholder="e.g. Growth Tier Sprint"
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
                <option value="Inbound Demo">Inbound Demo</option>
                <option value="Website">Website Inbound</option>
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

          <div className="form-group">
            <label className="form-label">Customer Notes</label>
            <textarea
              rows={2}
              placeholder="Initial onboarding notes, client goals..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Internal Remarks</label>
            <textarea
              rows={2}
              placeholder="Follow-up notes, reminders..."
              value={formData.internalRemarks}
              onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Section 3: Sales Information (Auto-Assigned & Readonly) */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <User size={18} style={{ color: 'var(--brand-accent)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Sales Information (Auto-Assigned & Locked)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Assigned Sales Member ID
              </span>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--brand-accent)',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {currentSalesMember.memberId}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.2rem', display: 'block' }}>
                Bound strictly to your representative session.
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Sales Representative Name
              </span>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {currentSalesMember.name}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Generated Customer ID
              </span>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--brand-primary)',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {nextCustomerId}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setActiveSalesTab('my-customers')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <UserPlus size={16} />
            <span>Add Customer to My Portfolio</span>
          </button>
        </div>
      </form>
    </div>
  );
}
