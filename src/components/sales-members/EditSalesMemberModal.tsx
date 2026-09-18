'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';

export default function EditSalesMemberModal() {
  const { editingMember, setEditingMember, editSalesMember } = useDashboard();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setEmail(editingMember.email);
      setPhone(editingMember.phone);
      setStatus(editingMember.status);
    }
  }, [editingMember]);

  if (!editingMember) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setIsLoading(true);
    try {
      await editSalesMember(editingMember.id, { name, email, phone, status });
      setEditingMember(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update member.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!editingMember}
      onClose={() => setEditingMember(null)}
      title={`Edit Sales Member (${editingMember.memberId})`}
      subtitle="Update contact details or change portal access status"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setEditingMember(null)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
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

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Sales Member ID"
            value={editingMember.memberId}
            disabled
          />

          <Select
            label="Portal Status"
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
