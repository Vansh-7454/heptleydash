'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { useDashboard } from '@/context/DashboardContext';
import { Customer, ProjectStatus, CustomerStatus, CustomerContractStatus, LeadSource } from '@/types';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditCustomerModal() {
  const { editingCustomer, setEditingCustomer, editCustomer, salesMembers } = useDashboard();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    alternatePhone: '',
    location: '',
    service: 'Website Development',
    package: '',
    leadSource: 'Website' as LeadSource,
    startDate: '',
    endDate: '',
    projectStatus: 'In Progress' as ProjectStatus,
    customerStatus: 'Active' as CustomerStatus,
    status: 'Active' as CustomerContractStatus,
    salesMemberId: '',
    notes: '',
    internalRemarks: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        company: editingCustomer.company || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
        alternatePhone: editingCustomer.alternatePhone || '',
        location: editingCustomer.location || '',
        service: editingCustomer.service || 'Website Development',
        package: editingCustomer.package || '',
        leadSource: (editingCustomer.leadSource || 'Website') as LeadSource,
        startDate: editingCustomer.startDate || '',
        endDate: editingCustomer.endDate || '',
        projectStatus: editingCustomer.projectStatus || 'In Progress',
        customerStatus: editingCustomer.customerStatus || 'Active',
        status: (editingCustomer.status || 'Active') as CustomerContractStatus,
        salesMemberId: editingCustomer.salesMemberId || (salesMembers[0]?.memberId || 'SM-001'),
        notes: editingCustomer.notes || '',
        internalRemarks: editingCustomer.internalRemarks || '',
      });
      setErrors({});
      setSuccess('');
    }
  }, [editingCustomer, salesMembers]);

  if (!editingCustomer) return null;

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

    editCustomer(editingCustomer.customerId, {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      alternatePhone: formData.alternatePhone.trim(),
      location: formData.location.trim(),
      service: formData.service,
      package: formData.package.trim(),
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

    setSuccess('Customer account updated successfully!');
    setTimeout(() => {
      setSuccess('');
      setEditingCustomer(null);
    }, 600);
  };

  return (
    <Modal
      isOpen={Boolean(editingCustomer)}
      onClose={() => setEditingCustomer(null)}
      title="Edit Customer Details"
      subtitle={`Account ID: ${editingCustomer.customerId}`}
    >
      <form onSubmit={handleSubmit}>
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
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / City</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Service & Package */}
        <div className="form-section">
          <div className="form-section-title">2. Service & Contract Status</div>
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
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="text"
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
                  setFormData({
                    ...formData,
                    status: e.target.value as CustomerContractStatus,
                  })
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
          <div className="form-group">
            <label className="form-label">Assigned Sales Member</label>
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
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Internal Remarks</label>
            <textarea
              rows={2}
              value={formData.internalRemarks}
              onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Actions */}
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
            onClick={() => setEditingCustomer(null)}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={15} />
            <span>Save Customer Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
