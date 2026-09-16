'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { useDashboard } from '@/context/DashboardContext';
import { Save, CheckCircle2 } from 'lucide-react';

export default function EditMemberModal() {
  const { editingSalesMember, setEditingSalesMember, editSalesMember } = useDashboard();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingSalesMember) {
      setFormData({
        name: editingSalesMember.name,
        email: editingSalesMember.email,
        phone: editingSalesMember.phone,
        status: editingSalesMember.status,
      });
      setErrors({});
      setSuccess('');
    }
  }, [editingSalesMember]);

  if (!editingSalesMember) return null;

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

    editSalesMember(editingSalesMember.memberId, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
    });

    setSuccess('Sales member updated successfully!');
    setTimeout(() => {
      setSuccess('');
      setEditingSalesMember(null);
    }, 600);
  };

  return (
    <Modal
      isOpen={Boolean(editingSalesMember)}
      onClose={() => setEditingSalesMember(null)}
      title="Edit Sales Member"
      subtitle={`Modifying profile for ${editingSalesMember.memberId}`}
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

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
          {errors.name && <span className="form-error-msg">{errors.name}</span>}
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
          <label className="form-label">Account Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })
            }
            className="form-select"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={() => setEditingSalesMember(null)}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={15} />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
