'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Badge, Button, Input } from '@/components/ui';
import { User, Mail, Phone, Shield, Building, Save, Hash } from 'lucide-react';

export default function ProfileView() {
  const { userProfile, updateUserProfile, role } = useDashboard();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [designation, setDesignation] = useState(userProfile.designation || '');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize local form fields whenever the authenticated user profile changes
  useEffect(() => {
    setName(userProfile.name);
    setEmail(userProfile.email);
    setPhone(userProfile.phone);
    setDesignation(userProfile.designation || '');
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      updateUserProfile({ name, email, phone, designation });
      setIsLoading(false);
    }, 350);
  };

  const memberId = userProfile.salesMemberId || userProfile.memberId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 0.25rem 0' }}>
          User Profile
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Manage your personal contact info, credentials, and role identity.
        </p>
      </div>

      {/* Identity Summary Card */}
      <Card style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: role === 'admin' ? 'var(--brand-primary)' : 'var(--brand-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
            }}
          >
            {userProfile.name.charAt(0)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {userProfile.name}
              </h3>
              <Badge variant={role === 'admin' ? 'info' : role === 'developer' ? 'success' : 'active'}>
                {role === 'admin' ? 'Executive Admin' : role === 'developer' ? 'Software Developer' : 'Sales Member'}
              </Badge>
              {(userProfile.developerId || memberId) && (
                <Badge variant="neutral">
                  ID: {userProfile.developerId || memberId}
                </Badge>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>{userProfile.email}</span>
              <span>•</span>
              <span>{userProfile.designation || (role === 'admin' ? 'Managing Director' : role === 'developer' ? 'Software Engineer' : 'Senior Account Executive')}</span>
            </div>
          </div>
        </div>

        {/* Identity Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Current User Name
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {userProfile.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Email Address
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {userProfile.email}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Portal Role
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-accent)', marginTop: '0.15rem' }}>
              {role === 'admin' ? 'Administrator' : role === 'developer' ? 'Software Developer' : 'Sales Member'}
            </div>
          </div>

          {(userProfile.developerId || memberId) && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {userProfile.developerId ? 'Developer ID' : 'Sales Member ID'}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                {userProfile.developerId || memberId}
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<User size={16} />}
            />
            <Input
              label="Designation / Role Title"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Account Executive"
              leftIcon={<Building size={16} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail size={16} />}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              leftIcon={<Phone size={16} />}
            />
          </div>

          {memberId && (
            <Input
              label="Assigned Sales Member Identifier"
              value={memberId}
              disabled
              hint="Fixed internal team identifier"
              leftIcon={<Hash size={16} />}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <Button variant="primary" size="md" type="submit" isLoading={isLoading} leftIcon={<Save size={15} />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
