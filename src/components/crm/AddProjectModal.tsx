'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import Modal from '@/components/common/Modal';
import { ProjectStage, ProjectPriority } from '@/types';
import { Building, User, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Cloud & DevOps',
  'AI & Healthcare',
  'Enterprise Web',
  'Mobile & Spatial',
  'FinTech & Security',
  'E-Commerce',
  'Automation & ERP',
];

export default function AddProjectModal() {
  const {
    isAddProjectModalOpen,
    setIsAddProjectModalOpen,
    addProject,
    salesMembers,
    currentSalesMember,
  } = useDashboard();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stage, setStage] = useState<ProjectStage>('discovery');
  const [priority, setPriority] = useState<ProjectPriority>('High');
  const [progress, setProgress] = useState(25);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [assignedMemberId, setAssignedMemberId] = useState(
    currentSalesMember?.memberId || 'SM-001'
  );
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    const rep =
      salesMembers.find((s) => s.memberId === assignedMemberId) ||
      salesMembers[0] ||
      currentSalesMember;

    addProject({
      title: title.trim(),
      clientName: clientName.trim(),
      category,
      stage,
      priority,
      progress: Number(progress) || 0,
      dueDate,
      assignedMemberId: rep.memberId,
      assignedMemberName: rep.name,
      description: description.trim(),
    });

    // Reset and close
    setTitle('');
    setClientName('');
    setProgress(25);
    setDescription('');
    setIsAddProjectModalOpen(false);
  };

  return (
    <Modal
      isOpen={isAddProjectModalOpen}
      onClose={() => setIsAddProjectModalOpen(false)}
      title="Create New Client Project"
      subtitle="Register a new deliverable milestone and allocate it to your operations team."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
        {/* Project Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="proj-title">
            Project Title *
          </label>
          <div className="input-group">
            <Tag size={16} className="input-icon" />
            <input
              id="proj-title"
              type="text"
              required
              placeholder="e.g. Serverless Cloud Migration & Autoscaling"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Client / Company Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="proj-client">
            Client / Organization Name *
          </label>
          <div className="input-group">
            <Building size={16} className="input-icon" />
            <input
              id="proj-client"
              type="text"
              required
              placeholder="e.g. ABC Technologies Pvt Ltd"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Category & Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-cat">
              Service Category
            </label>
            <select
              id="proj-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="proj-priority">
              Priority Tier
            </label>
            <select
              id="proj-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
              className="form-input"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Delivery Stage & Initial Progress % */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-stage">
              Initial Delivery Stage
            </label>
            <select
              id="proj-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as ProjectStage)}
              className="form-input"
            >
              <option value="discovery">Discovery & Scoping</option>
              <option value="in_progress">In Execution</option>
              <option value="review">Quality Review</option>
              <option value="approval">Client Approval</option>
              <option value="delivered">Delivered & Live</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="proj-progress">
              Completion Progress: {progress}%
            </label>
            <input
              id="proj-progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Target Delivery Date & Team Member Allocation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-date">
              Target Delivery Date
            </label>
            <div className="input-group">
              <Calendar size={16} className="input-icon" />
              <input
                id="proj-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="proj-rep">
              Allocated Team Member
            </label>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <select
                id="proj-rep"
                value={assignedMemberId}
                onChange={(e) => setAssignedMemberId(e.target.value)}
                className="form-input"
              >
                {salesMembers.map((sm) => (
                  <option key={sm.id} value={sm.memberId}>
                    {sm.name} ({sm.memberId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description / Scope */}
        <div className="form-group">
          <label className="form-label" htmlFor="proj-desc">
            Scope & Deliverables Notes
          </label>
          <div className="input-group" style={{ alignItems: 'flex-start' }}>
            <FileText size={16} className="input-icon" style={{ marginTop: '0.65rem' }} />
            <textarea
              id="proj-desc"
              rows={3}
              placeholder="Milestone goals, architecture requirements, and sprint schedule..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsAddProjectModalOpen(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Project Deliverable
          </button>
        </div>
      </form>
    </Modal>
  );
}
