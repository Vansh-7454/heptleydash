'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import StatsCard from '@/components/common/StatsCard';
import AnalyticsChart from './AnalyticsChart';
import {
  Users,
  Briefcase,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  PlusCircle,
  ExternalLink,
  FolderKanban,
  Eye,
} from 'lucide-react';

export default function AdminDashboardView() {
  const {
    totalCustomers,
    activeCustomers,
    totalSalesMembers,
    salesMembers,
    customers,
    projects,
    setIsAddCustomerModalOpen,
    setIsAddProjectModalOpen,
    setActiveAdminTab,
    setDetailedCustomerView,
    setViewingSalesMember,
  } = useDashboard();

  // Take the 5 most recent customers
  const recentCustomers = customers.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Executive Operations Pulse Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(225, 29, 72, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Enterprise Operations Active · v2.6
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              margin: '0 0 0.35rem 0',
            }}
          >
            Good morning, Executive Oversight
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Unified business health: <strong>{totalCustomers} Client Accounts</strong> · <strong>{projects.length} Deliverable Milestones</strong> · <strong>{salesMembers.length} Operational Roster</strong>
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveAdminTab('projects')}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff' }}
          >
            <FolderKanban size={14} style={{ color: '#0284c7' }} />
            <span>Projects Board</span>
          </button>
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff' }}
          >
            <PlusCircle size={14} style={{ color: 'var(--brand-accent)' }} />
            <span>+ New Deliverable</span>
          </button>
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserCheck size={14} />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatsCard
          title="Total Customers"
          value={totalCustomers}
          subtitle={`${activeCustomers} currently active accounts`}
          icon={<Briefcase size={20} />}
          badge={{ text: 'Accounts', type: 'neutral' }}
        />
        <StatsCard
          title="Active Customers"
          value={activeCustomers}
          subtitle="Currently active service engagements"
          icon={<UserCheck size={20} />}
          badge={{ text: 'In Progress', type: 'success' }}
        />
        <StatsCard
          title="Total Sales Members"
          value={totalSalesMembers}
          subtitle={`${salesMembers.filter(s => s.status === 'Active').length} active sales representatives`}
          icon={<Users size={20} />}
          badge={{ text: 'Team', type: 'accent' }}
        />
      </div>

      {/* Performance & Growth Analytics Chart */}
      <AnalyticsChart />

      {/* Two-Column SaaS Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="admin-two-column-grid"
      >
        {/* LEFT / LARGER SECTION: Recent Customers */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Customers
              </h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Latest active business engagements and sales allocations
              </p>
            </div>

            <button
              onClick={() => setActiveAdminTab('customers')}
              className="btn btn-subtle btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>View All ({customers.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Table */}
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Sales Member</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setDetailedCustomerView(customer)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view complete details"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          {customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', fontSize: '0.85rem' }}>
                            {customer.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {customer.customerId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{customer.company}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.775rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 500,
                        }}
                      >
                        {customer.service}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}>
                        <User size={13} style={{ color: 'var(--brand-accent)' }} />
                        <span>{customer.salesMemberName}</span>
                      </div>
                    </td>
                    <td>
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
                        {customer.status === 'Active' && <CheckCircle2 size={10} />}
                        {customer.status === 'Onboarding' && <Clock size={10} />}
                        <span>{customer.status}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailedCustomerView(customer);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.78rem',
                        }}
                        title="View complete customer details"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT / SMALLER SECTION: Sales Team & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sales Team Cards */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Sales Team
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active representative roster
                </span>
              </div>
              <button
                onClick={() => setActiveAdminTab('sales-members')}
                className="btn-subtle"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {salesMembers.map((member) => {
                const count = customers.filter((c) => c.salesMemberId === member.memberId).length;
                return (
                  <div
                    key={member.id}
                    onClick={() => setViewingSalesMember(member)}
                    style={{
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                    title="Click to view member profile"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {member.memberId}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {count} clients
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: '0.8125rem',
                  padding: '0.55rem 0.75rem',
                }}
              >
                <PlusCircle size={15} style={{ color: 'var(--brand-accent)' }} />
                <span>Add Customer</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('customers')}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: '0.8125rem',
                  padding: '0.55rem 0.75rem',
                }}
              >
                <Briefcase size={15} style={{ color: 'var(--text-secondary)' }} />
                <span>View All Customers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .admin-two-column-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
