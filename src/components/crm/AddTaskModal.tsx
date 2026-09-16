'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import Modal from '@/components/common/Modal';
import { TaskPriority, TaskType } from '@/types';

export default function AddTaskModal() {
  const { isAddTaskModalOpen, setIsAddTaskModalOpen, addTask, customers, salesMembers, currentSalesMember } =
    useDashboard();

  const [title, setTitle] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [type, setType] = useState<TaskType>('call');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const matchedCustomer = customers.find((c) => c.customerId === selectedCustomerId);

    addTask({
      title: title.trim(),
      company: matchedCustomer ? matchedCustomer.company : undefined,
      contactName: matchedCustomer ? matchedCustomer.name : undefined,
      type,
      priority,
      dueDate,
      salesMemberId: currentSalesMember.memberId,
      salesMemberName: currentSalesMember.name,
      notes: notes.trim(),
    });

    // Reset and close
    setTitle('');
    setSelectedCustomerId('');
    setNotes('');
    setIsAddTaskModalOpen(false);
  };

  return (
    <Modal
      isOpen={isAddTaskModalOpen}
      onClose={() => setIsAddTaskModalOpen(false)}
      title="Schedule Client Follow-up"
      subtitle="Set a call, meeting, or review activity with deadline and priority."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
        {/* Task Title */}
        <div className="form-group">
          <label className="form-label">Activity Description *</label>
          <input
            type="text"
            required
            placeholder="e.g. Follow-up Call regarding Q4 SOW"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Link to Customer Account */}
        <div className="form-group">
          <label className="form-label">Related Customer Account (Optional)</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="form-select"
          >
            <option value="">-- Unassigned / General CRM Activity --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.customerId}>
                {c.company} ({c.name}) · {c.customerId}
              </option>
            ))}
          </select>
        </div>

        {/* Type & Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <div className="form-group">
            <label className="form-label">Activity Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="form-select"
            >
              <option value="call">Phone Call</option>
              <option value="meeting">Client Meeting</option>
              <option value="email">Email Outreach</option>
              <option value="proposal">Proposal / Review</option>
              <option value="followup">General Follow-up</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="form-select"
            >
              <option value="high">High (Urgent)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Agenda & Context</label>
          <textarea
            rows={3}
            placeholder="Specific questions to ask or documents to prepare..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsAddTaskModalOpen(false)}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Schedule Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
