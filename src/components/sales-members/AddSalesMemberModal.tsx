'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';

export default function AddSalesMemberModal() {
  const { isAddMemberModalOpen, setIsAddMemberModalOpen, addSalesMember, salesMembers } = useDashboard();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate preview of next ID
  const nextNum = salesMembers.length + 1;
  const nextMemberId = `SM-${String(nextNum).padStart(3, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter the sales member full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a contact phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Initial password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await addSalesMember({ name, email, phone, password, status });
      // Reset
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setStatus('Active');
      setIsAddMemberModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add sales member.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAddMemberModalOpen}
      onClose={() => setIsAddMemberModalOpen(false)}
      title="Add New Sales Member"
      subtitle="Register a sales representative account with portal access & demo credentials"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddMemberModalOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Create Account
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Sales Member 04"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Work Email"
            type="email"
            placeholder="name@heptley.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint="User will be prompted to change on first login"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Assigned Sales Member ID (Auto)"
            value={nextMemberId}
            disabled
            hint="System-generated enterprise identifier"
          />

          <Select
            label="Account Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'Active', label: 'Active - Full CRM Access' },
              { value: 'Inactive', label: 'Inactive - Suspended' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}
