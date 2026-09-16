'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Calendar,
  CheckCircle2,
  Save,
  Building,
  KeyRound,
  BadgeCheck,
} from 'lucide-react';

export default function ProfileView() {
  const {
    role,
    userProfile,
    updateUserProfile,
    currentSalesMember,
    customers,
    myCustomers,
    showToast,
  } = useDashboard();

  const isAdmin = role === 'admin';

  // Form states
  const [formData, setFormData] = useState({
    name: isAdmin ? userProfile.name : currentSalesMember.name,
    email: isAdmin ? userProfile.email : currentSalesMember.email,
    phone: isAdmin ? userProfile.phone : currentSalesMember.phone,
    title: isAdmin ? (userProfile.title || 'Operations & Business Oversight') : 'Sales Representative',
    department: 'Commercial & Client Services',
    location: 'Bangalore, India',
    timezone: 'Asia/Kolkata (IST +5:30)',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        title: (formData.title || '').trim(),
      });
    }
    setSavedSuccess(true);
    setIsEditing(false);
    showToast('Profile information successfully saved', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const assignedClientsCount = isAdmin
    ? customers.length
    : myCustomers.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px' }}>
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          My Profile
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Manage your personal account credentials, role details, and portfolio preferences.
        </p>
      </div>

      {/* Hero Profile Banner */}
      <div
        className="card"
        style={{
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar Circle */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isAdmin ? '#0f172a' : 'var(--brand-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {formData.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {formData.name}
              </h2>
              <span
                className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-sales'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                <Shield size={12} />
                <span>{isAdmin ? 'System Administrator' : currentSalesMember.memberId}</span>
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={11} />
                <span>Active Account</span>
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {formData.title} • {formData.department}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginTop: '0.625rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} style={{ color: 'var(--text-light)' }} />
                <span>{formData.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={13} style={{ color: 'var(--text-light)' }} />
                <span>{formData.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: 'var(--text-light)' }} />
                <span>Joined August 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'} btn-sm`}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Profile changes saved successfully in local session.</span>
        </div>
      )}

      {/* Grid: Details & Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isEditing ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {isEditing ? (
          /* Edit Form */
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Edit Account Information
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Direct Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Office / Region</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Operating Timezone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Personal & Contact Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <User size={18} style={{ color: 'var(--brand-accent)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Contact Information
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <span>{formData.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Timezone:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{formData.timezone}</span>
                </div>
              </div>
            </div>

            {/* Role & Access Security Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Shield size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Role & System Credentials
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Portal Role:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{role}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Identifier:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-accent)' }}>
                    {isAdmin ? 'ADMIN-01' : currentSalesMember.memberId}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Managed Clients:</span>
                  <strong>{assignedClientsCount} active accounts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Access Scope:</span>
                  <span className="badge badge-active">
                    {isAdmin ? 'Full Executive Oversight' : 'Sales Pipeline Portfolio'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
