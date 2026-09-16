'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useDashboard } from '@/context/DashboardContext';
import { UserPlus, Hash, CheckCircle2 } from 'lucide-react';

export default function AddSalesMemberModal() {
  const { isAddMemberModalOpen, setIsAddMemberModalOpen, addSalesMember, getNextMemberId } = useDashboard();

  const nextId = getNextMemberId();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) errs.name = 'Full Name is required';

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

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const created = addSalesMember({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
      });

      setSuccessMessage(`Successfully registered ${created.name} (${created.memberId})!`);
      setErrors({});

      setTimeout(() => {
        setSuccessMessage('');
        setIsAddMemberModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          status: 'Active',
        });
      }, 700);
    } catch {
      setErrors({ global: 'Failed to create sales member.' });
    }
  };

  return (
    <Modal
      isOpen={isAddMemberModalOpen}
      onClose={() => setIsAddMemberModalOpen(false)}
      title="Add New Sales Member"
      subtitle="Provision a new team representative in the portal"
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
              Auto-Assigned Sales ID:
            </span>
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--brand-accent)',
              backgroundColor: 'var(--bg-surface)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
            }}
          >
            {nextId}
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

        {successMessage && (
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
            <span>{successMessage}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            placeholder="e.g. Vikram Malhotra"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
          {errors.name && <span className="form-error-msg">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            placeholder="e.g. vikram@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
          {errors.email && <span className="form-error-msg">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            placeholder="e.g. 9876543219"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-input"
          />
          {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
        </div>

        {/* Temporary Password */}
        <div className="form-group">
          <label className="form-label">Initial Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
          />
          <span style={{ fontSize: '0.725rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
            Demo credential for future role-based authentication.
          </span>
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-label">Account Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
            className="form-select"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsAddMemberModalOpen(false)}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <UserPlus size={15} />
            <span>Create Sales Member</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
