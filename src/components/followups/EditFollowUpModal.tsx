'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Input, Select, Button } from '@/components/ui';
import { FollowUpType, FollowUpStatus } from '@/types';

export default function EditFollowUpModal() {
  const { editingFollowUp, setEditingFollowUp, editFollowUp, salesMembers, role } = useDashboard();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<FollowUpType>('Call');
  const [status, setStatus] = useState<FollowUpStatus>('Pending');
  const [assignedSalesMemberId, setAssignedSalesMemberId] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingFollowUp) {
      setTitle(editingFollowUp.title);
      setDate(editingFollowUp.date);
      setTime(editingFollowUp.time);
      setType(editingFollowUp.type);
      setStatus(editingFollowUp.status);
      setAssignedSalesMemberId(editingFollowUp.assignedSalesMemberId);
      setNote(editingFollowUp.note || '');
    }
  }, [editingFollowUp]);

  if (!editingFollowUp) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const assigned = salesMembers.find((m) => m.memberId === assignedSalesMemberId);
    const assignedSalesMemberName = assigned ? assigned.name : editingFollowUp.assignedSalesMemberName;

    setIsLoading(true);
    try {
      await editFollowUp(editingFollowUp.id, {
        title,
        date,
        time,
        type,
        status,
        assignedSalesMemberId,
        assignedSalesMemberName,
        note,
      });

      setEditingFollowUp(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update follow-up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!editingFollowUp}
      onClose={() => setEditingFollowUp(null)}
      title={`Edit Follow-up (${editingFollowUp.followUpId})`}
      subtitle={`Associated with ${editingFollowUp.entityName} (${editingFollowUp.company})`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setEditingFollowUp(null)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Follow-up
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <Input label="Subject / Purpose" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: 'Call', label: 'Phone Call' },
              { value: 'Meeting', label: 'Meeting' },
              { value: 'Email', label: 'Email' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <Select
            label="Execution Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Overdue', label: 'Overdue' },
              { value: 'Rescheduled', label: 'Rescheduled' },
            ]}
          />

          {role === 'admin' && (
            <Select
              label="Assigned Rep"
              value={assignedSalesMemberId}
              onChange={(e) => setAssignedSalesMemberId(e.target.value)}
              options={salesMembers.map((m) => ({ value: m.memberId, label: `${m.name} (${m.memberId})` }))}
            />
          )}
        </div>

        <Input label="Agenda Notes" value={note} onChange={(e) => setNote(e.target.value)} />
      </form>
    </Modal>
  );
}
