'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  ArrowLeft,
  Edit2,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  FolderKanban,
  CheckSquare,
  Plus,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';

export default function CustomerDetailsView() {
  const {
    detailedCustomerView,
    setDetailedCustomerView,
    setEditingCustomer,
    role,
    projects,
    tasks,
    toggleTaskComplete,
    setIsAddProjectModalOpen,
    setIsAddTaskModalOpen,
    activeAdminTab,
    setActiveAdminTab,
    activeSalesTab,
    setActiveSalesTab,
    showToast,
  } = useDashboard();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'deliverables' | 'tasks' | 'timeline'>('overview');

  if (!detailedCustomerView) return null;

  const customer = detailedCustomerView;

  // Associated deliverables for this customer
  const customerProjects = projects.filter((p) => {
    const cName = customer.name.toLowerCase();
    const cComp = customer.company.toLowerCase();
    const pClient = p.clientName.toLowerCase();
    return (
      pClient.includes(cName) ||
      pClient.includes(cComp) ||
      cComp.includes(pClient) ||
      cName.includes(pClient)
    );
  });

  // Associated tasks for this customer
  const customerTasks = tasks.filter((t) => {
    const cName = customer.name.toLowerCase();
    const cComp = customer.company.toLowerCase();
    const tContact = (t.contactName || '').toLowerCase();
    const tComp = (t.company || '').toLowerCase();
    return (
      (tComp && (tComp.includes(cComp) || cComp.includes(tComp))) ||
      (tContact && (tContact.includes(cName) || cName.includes(tContact)))
    );
  });

  const handleBack = () => {
    setDetailedCustomerView(null);
  };

  const getAvatarStyle = (name: string) => {
    const styles = [
      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
      { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
      { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
      { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
      { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return styles[Math.abs(hash) % styles.length];
  };

  const avatar = getAvatarStyle(customer.company || customer.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Breadcrumbs & Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <button
            onClick={handleBack}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <span style={{ color: 'var(--text-light)' }}>/</span>
          <span
            onClick={handleBack}
            style={{ color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {role === 'admin' ? 'Customer Directory' : 'My Portfolio'}
          </span>
          <ChevronRight size={13} style={{ color: 'var(--text-light)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</span>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CheckSquare size={13} style={{ color: '#0284c7' }} />
            <span>+ Add Task</span>
          </button>
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FolderKanban size={13} style={{ color: 'var(--brand-accent)' }} />
            <span>+ Allocate Project</span>
          </button>
          {role === 'admin' && (
            <button
              onClick={() => setEditingCustomer(customer)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Edit2 size={13} />
              <span>Edit Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Avatar Squircle */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '14px',
              backgroundColor: avatar.bg,
              color: avatar.text,
              border: `1.5px solid ${avatar.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              flexShrink: 0,
            }}
          >
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {customer.name}
              </h1>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--brand-accent)',
                  backgroundColor: 'var(--brand-accent-subtle)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(225, 29, 72, 0.15)',
                }}
              >
                {customer.customerId}
              </span>

              {/* Status Badge */}
              <span
                className={`badge ${
                  customer.status === 'Active'
                    ? 'badge-active'
                    : customer.status === 'Onboarding'
                    ? 'badge-onboarding'
                    : customer.status === 'Completed'
                    ? 'badge-completed'
                    : 'badge-pending'
                }`}
              >
                {customer.status === 'Active' && <CheckCircle2 size={11} />}
                {customer.status === 'Onboarding' && <Clock size={11} />}
                <span>{customer.status}</span>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.company}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                <span>{customer.location || 'India'}</span>
              </span>
              <span>•</span>
              <span style={{ color: 'var(--text-muted)' }}>Created {customer.createdAt || '2026-09-01'}</span>
            </div>
          </div>
        </div>

        {/* Executive Highlights Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Allocated Rep
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <User size={13} style={{ color: 'var(--brand-accent)' }} />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{customer.salesMemberName}</strong>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Service Tier
            </span>
            <strong style={{ fontSize: '0.85rem', color: '#0284c7' }}>{customer.package}</strong>
          </div>
          <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Live Deliverables
            </span>
            <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>{customerProjects.length} Active</strong>
          </div>
        </div>
      </div>

      {/* Segmented Section Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          onClick={() => setActiveSubTab('overview')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeSubTab === 'overview' ? 700 : 500,
            color: activeSubTab === 'overview' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'overview' ? '2px solid var(--brand-accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Building size={15} />
          <span>Account Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('deliverables')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeSubTab === 'deliverables' ? 700 : 500,
            color: activeSubTab === 'deliverables' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'deliverables' ? '2px solid var(--brand-accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <FolderKanban size={15} />
          <span>Projects & Deliverables ({customerProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeSubTab === 'tasks' ? 700 : 500,
            color: activeSubTab === 'tasks' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'tasks' ? '2px solid var(--brand-accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <CheckSquare size={15} />
          <span>Tasks & Agenda ({customerTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeSubTab === 'timeline' ? 700 : 500,
            color: activeSubTab === 'timeline' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'timeline' ? '2px solid var(--brand-accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Activity size={15} />
          <span>Contract Milestones</span>
        </button>
      </div>

      {/* SUB-TAB 1: ACCOUNT OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Card 1: Contact Information */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Building size={17} style={{ color: 'var(--brand-accent)' }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Customer & Contact Details
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Primary Client Name</span>
                <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Organization</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{customer.company}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <a
                  href={`mailto:${customer.email}`}
                  style={{ color: 'var(--brand-accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  {customer.email}
                </a>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Phone Number</span>
                <span style={{ color: 'var(--text-primary)' }}>{customer.phone}</span>
              </div>

              {customer.alternatePhone && (
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Alternate Contact</span>
                  <span style={{ color: 'var(--text-primary)' }}>{customer.alternatePhone}</span>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Operating Region</span>
                <span style={{ color: 'var(--text-primary)' }}>{customer.location || 'India'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Service & Contract Terms */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Calendar size={17} style={{ color: 'var(--brand-accent)' }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Service & Contract Agreement
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Service Type</span>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#f1f5f9',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginTop: '0.15rem',
                  }}
                >
                  {customer.service}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Package Tier</span>
                <strong style={{ color: 'var(--text-primary)' }}>{customer.package}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Contract Duration</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {customer.startDate} → {customer.endDate}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Project Lifecycle Status</span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    marginTop: '0.2rem',
                  }}
                >
                  {customer.projectStatus || 'In Progress'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Account Standing</span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    border: '1px solid var(--border-default)',
                    marginTop: '0.2rem',
                  }}
                >
                  {customer.customerStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Sales Representation */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <User size={17} style={{ color: 'var(--brand-accent)' }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Sales Allocation & Sourcing
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Assigned Representative</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{customer.salesMemberName}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Representative ID</span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    color: 'var(--brand-accent)',
                    fontWeight: 700,
                  }}
                >
                  {customer.salesMemberId}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Lead Source</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.15rem',
                  }}
                >
                  <Sparkles size={12} style={{ color: 'var(--brand-accent)' }} />
                  <span>{customer.leadSource || 'Direct Referral'}</span>
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Account Verification</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    marginTop: '0.15rem',
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Verified B2B Client</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Account Directives & Notes */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileText size={17} style={{ color: 'var(--brand-accent)' }} />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Account Directives & Remarks
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.825rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Customer Specifications
                </span>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    lineHeight: 1.45,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {customer.notes || 'No custom client notes recorded for this account.'}
                </div>
              </div>

              {customer.internalRemarks && (
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Executive Internal Remarks
                  </span>
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      lineHeight: 1.45,
                      color: '#92400e',
                    }}
                  >
                    {customer.internalRemarks}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DELIVERABLES & PROJECTS */}
      {activeSubTab === 'deliverables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Active Client Projects & SOW Deliverables
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Engineering milestones and sprint deliverables assigned to {customer.name} ({customer.company}).
              </p>
            </div>
            <button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} />
              <span>+ Allocate Deliverable</span>
            </button>
          </div>

          {customerProjects.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <FolderKanban size={22} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                No deliverables currently assigned
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
                There are no active production deliverables or sprint milestones scheduled for this client yet.
              </p>
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                <Plus size={14} />
                <span>+ Create Deliverable</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1rem',
              }}
            >
              {customerProjects.map((project) => (
                <div
                  key={project.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {project.projectId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor:
                          project.priority === 'Urgent'
                            ? '#fef2f2'
                            : project.priority === 'High'
                            ? '#fff7ed'
                            : '#f1f5f9',
                        color:
                          project.priority === 'Urgent'
                            ? '#dc2626'
                            : project.priority === 'High'
                            ? '#c2410c'
                            : '#475569',
                      }}
                    >
                      {project.priority} Priority
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                      {project.title}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                      }}
                    >
                      {project.category}
                    </span>
                  </div>

                  {project.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      {project.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Progress Completion</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{project.progress}%</strong>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${project.progress}%`,
                          backgroundColor: project.progress === 100 ? '#16a34a' : 'var(--brand-accent)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer: Stage & Member */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#0284c7' }}>
                      ● {project.stage.replace('_', ' ')}
                    </span>
                    <span>Due {project.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: TASKS & AGENDA */}
      {activeSubTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Customer Follow-ups & Scheduled Tasks
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Meetings, client calls, proposals, and action items scheduled for {customer.name}.
              </p>
            </div>
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} />
              <span>+ Schedule Task</span>
            </button>
          </div>

          {customerTasks.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <CheckSquare size={22} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                No pending tasks for this account
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
                All action items, calls, and customer follow-ups are up to date.
              </p>
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                <Plus size={14} />
                <span>+ Schedule Follow-up</span>
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {customerTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: t.completed ? '#f8fafc' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTaskComplete(t.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--brand-accent)' }}
                      />
                      <div>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: t.completed ? 'line-through' : 'none',
                            display: 'block',
                          }}
                        >
                          {t.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Type: <strong>{t.type}</strong> · Priority: <strong>{t.priority}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Due {t.dueDate}
                      </span>
                      <span
                        className={`badge ${t.completed ? 'badge-completed' : 'badge-pending'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {t.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: CONTRACT & ACTIVITY MILESTONES */}
      {activeSubTab === 'timeline' && (
        <div className="card" style={{ padding: '1.75rem 2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Account Lifecycle & Milestone Audit Trail
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.75rem' }}>
            {/* Timeline Vertical Bar */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                bottom: '8px',
                left: '7px',
                width: '2px',
                backgroundColor: '#e2e8f0',
              }}
            />

            {/* Event 1: Initial Agreement Kickoff */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-1.75rem',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 1px #10b981',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {customer.startDate} · CONTRACT COMMENCEMENT
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                Service Engagement Signed & Activated
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Client entered contractual agreement for <strong>{customer.service}</strong> ({customer.package} tier).
              </p>
            </div>

            {/* Event 2: Team Allocation */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-1.75rem',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-accent)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 1px var(--brand-accent)',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ONBOARDING PHASE
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                Dedicated Account Lead Assigned
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                <strong>{customer.salesMemberName}</strong> ({customer.salesMemberId}) was appointed as the operational account owner.
              </p>
            </div>

            {/* Event 3: Deliverable Milestones */}
            {customerProjects.map((p, idx) => (
              <div key={p.id} style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    border: '3px solid #ffffff',
                    boxShadow: '0 0 0 1px #0284c7',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  MILESTONE DELIVERABLE · {p.projectId}
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                  {p.title} ({p.progress}% Complete)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Current delivery stage: <strong>{p.stage.replace('_', ' ')}</strong> · Assigned engineer: {p.assignedMemberName} · Target due date: {p.dueDate}.
                </p>
              </div>
            ))}

            {/* Event 4: Contract Target Completion */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-1.75rem',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#64748b',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 1px #64748b',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {customer.endDate} · CONTRACT CONCLUSION
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                Target Contract Deliverable Wrap-up
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Final quality review and live delivery sign-off targeted for {customer.endDate}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
