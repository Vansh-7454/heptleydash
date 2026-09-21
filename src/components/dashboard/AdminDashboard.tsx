'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Badge, Button, Tabs } from '@/components/ui';
import {
  Users,
  Briefcase,
  Target,
  Clock,
  ArrowRight,
  UserPlus,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Search,
  ChevronRight,
  Globe,
  Server,
  Code,
  HelpCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    totalSalesMembers,
    customers,
    salesMembers,
    domains,
    leads,
    stats,
    setActiveAdminTab,
    setDetailedCustomerView,
    setIsAddMemberModalOpen,
  } = useDashboard();

  const [lookupQuery, setLookupQuery] = useState('');

  const recentCustomers = customers.slice(0, 5);

  // Operational metrics calculated strictly from MongoDB data & live context
  const totalSales = stats?.totalSalesMembers ?? stats?.operationalStats?.totalSalesMembers ?? totalSalesMembers;
  const activeDoms = stats?.activeDomains ?? stats?.operationalStats?.activeDomains ?? domains.filter((d) => d.status === 'ACTIVE').length;
  const expiringDoms = stats?.expiringDomains ?? stats?.operationalStats?.expiringDomains ?? domains.filter((d) => d.status === 'EXPIRING_SOON').length;

  // Filtered entity search
  const filteredEntities = lookupQuery.trim()
    ? [
        ...customers
          .filter(
            (c) =>
              c.name.toLowerCase().includes(lookupQuery.toLowerCase()) ||
              c.company.toLowerCase().includes(lookupQuery.toLowerCase()) ||
              c.customerId.toLowerCase().includes(lookupQuery.toLowerCase())
          )
          .map((c) => ({ type: 'Customer' as const, id: c.id, title: `${c.name} · ${c.company}`, code: c.customerId, data: c })),
        ...salesMembers
          .filter(
            (m) =>
              m.name.toLowerCase().includes(lookupQuery.toLowerCase()) ||
              m.memberId.toLowerCase().includes(lookupQuery.toLowerCase()) ||
              m.email.toLowerCase().includes(lookupQuery.toLowerCase())
          )
          .map((m) => ({ type: 'Sales Member' as const, id: m.id, title: `${m.name} (${m.email})`, code: m.memberId, data: m })),
        ...leads
          .filter(
            (l) =>
              l.name.toLowerCase().includes(lookupQuery.toLowerCase()) ||
              l.company.toLowerCase().includes(lookupQuery.toLowerCase()) ||
              l.leadId.toLowerCase().includes(lookupQuery.toLowerCase())
          )
          .map((l) => ({ type: 'Lead' as const, id: l.id, title: `${l.name} · ${l.company}`, code: l.leadId, data: l })),
      ]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--brand-accent-text)',
              marginBottom: '0.35rem',
            }}
          >
            <Shield size={15} />
            <span>Admin Overview</span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Business & Team Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            Operational command center: sales team, customers, websites, domains, and inquiries.
          </p>
        </div>

        {/* Right Status Pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--brand-accent-subtle)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--brand-accent-text)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <span>Administrator</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="btn-pill"
            leftIcon={<UserPlus size={14} />}
            onClick={() => setIsAddMemberModalOpen(true)}
          >
            + Add Sales Member
          </Button>
        </div>
      </div>

      {/* 2. Quick Search Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Quick Search
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.25rem' }}>
          Search customers, sales members, or leads by name, email, or company.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by customer, team member, or lead..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1.15rem',
                borderRadius: '9999px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                color: 'var(--text-primary)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                transition: 'border-color var(--transition-fast)',
              }}
            />
          </div>

          <button
            type="button"
            className="btn-pill"
            style={{
              padding: '0.7rem 1.6rem',
              backgroundColor: '#dbeafe',
              color: '#0369a1',
              border: '1px solid #bfdbfe',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(2, 132, 199, 0.15)',
              transition: 'all var(--transition-fast)',
            }}
            onClick={() => {
              if (filteredEntities.length > 0 && filteredEntities[0].type === 'Customer') {
                setDetailedCustomerView(filteredEntities[0].data);
              } else if (filteredEntities.length > 0 && filteredEntities[0].type === 'Sales Member') {
                setActiveAdminTab('sales-members');
              } else {
                setActiveAdminTab('customers');
              }
            }}
          >
            Search
          </button>
        </div>

        {/* Dropdown search results */}
        {lookupQuery.trim() && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#f0f9fd',
              border: '1px solid var(--border-default)',
            }}
          >
            {filteredEntities.length === 0 ? (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No records matched "{lookupQuery}".
              </span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#0284c7' }}>
                  Matching Records:
                </span>
                {filteredEntities.slice(0, 5).map((item) => (
                  <div
                    key={`${item.type}_${item.id}`}
                    onClick={() => {
                      if (item.type === 'Customer') setDetailedCustomerView(item.data);
                      else if (item.type === 'Sales Member') setActiveAdminTab('sales-members');
                      else setActiveAdminTab('leads');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(159, 216, 237, 0.4)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({item.type}: {item.code})
                      </span>
                    </div>
                    <Badge variant="info">View Details</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 8 Operational CRM Cards (Real Database Backed) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Total Sales Members */}
        <div
          onClick={() => setActiveAdminTab('sales-members')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid var(--border-default)',
            padding: '1.35rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#f5f3ff',
                  color: '#7e22ce',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd6fe',
                  flexShrink: 0,
                }}
              >
                <Users size={19} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Total Sales Members
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Sales Team Reps
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {totalSales}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6b21a8', backgroundColor: '#f3e8ff', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 700, border: '1px solid #e9d5ff' }}>
                team members
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
            <span>Manage Team</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 2: Active Domains */}
        <div
          onClick={() => setActiveAdminTab('websites-domains')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid var(--border-default)',
            padding: '1.35rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #cbd5e1',
                  flexShrink: 0,
                }}
              >
                <Server size={19} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Active Domains
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  DNS & Domain Assets
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {activeDoms}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#334155', backgroundColor: '#f1f5f9', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                of {domains.length} total
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
            <span>Manage Domains</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 8: Domains Expiring Soon */}
        <div
          onClick={() => setActiveAdminTab('websites-domains')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: expiringDoms > 0 ? '1.5px solid #fca5a5' : '1px solid var(--border-default)',
            padding: '1.35rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: expiringDoms > 0 ? '#fef2f2' : '#f0f9ff',
                  color: expiringDoms > 0 ? '#dc2626' : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${expiringDoms > 0 ? '#fecaca' : '#bae6fd'}`,
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={19} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Expiring Soon
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Domains &le; 30 Days
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: expiringDoms > 0 ? '#dc2626' : 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {expiringDoms}
              </span>
              <span style={{ fontSize: '0.78rem', color: expiringDoms > 0 ? '#991b1b' : '#0284c7', backgroundColor: expiringDoms > 0 ? '#fee2e2' : '#e0f2fe', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 700, border: `1px solid ${expiringDoms > 0 ? '#fecaca' : '#bae6fd'}` }}>
                {expiringDoms > 0 ? 'action needed' : 'all healthy'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
            <span>Review Expiries</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* 5. Sales Team Allocation & Recent Accounts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: '1.75rem' }}>
        {/* Section 1: Sales Team Allocation */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid var(--border-default)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Sales Team Overview
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Team members and their assigned customer accounts
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveAdminTab('sales-members')}
            >
              Manage Team ({salesMembers.length})
            </Button>
          </div>

          <div className="table-wrapper" style={{ border: '1px solid var(--border-default)', backgroundColor: '#ffffff' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px', whiteSpace: 'nowrap' }}>Member ID</th>
                  <th>Name & Contact</th>
                  <th style={{ width: '110px', whiteSpace: 'nowrap' }}>Accounts</th>
                  <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '85px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {salesMembers.map((m, idx) => {
                  const assignedCus = customers.filter((c) => c.salesMemberId === m.memberId);
                  return (
                    <tr key={`sm-${m.id || m.memberId || idx}-${idx}`}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0284c7', whiteSpace: 'nowrap' }}>
                        {m.memberId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.email}</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{assignedCus.length}</strong> <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>customers</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="status-pill status-pill-green">{m.status}</span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="btn-pill"
                          onClick={() => setActiveAdminTab('sales-members')}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Recent Customers */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid var(--border-default)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Recent Customers
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Latest customer onboarding and account status
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveAdminTab('customers')}
            >
              All ({customers.length})
            </Button>
          </div>

          <div className="table-wrapper" style={{ border: '1px solid var(--border-default)', backgroundColor: '#ffffff' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '115px', whiteSpace: 'nowrap' }}>Customer ID</th>
                  <th>Company & Account</th>
                  <th style={{ minWidth: '130px' }}>Assigned Rep</th>
                  <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '75px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c, idx) => (
                  <tr key={`rcust-${c.id || c.customerId || idx}-${idx}`}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0284c7', whiteSpace: 'nowrap' }}>
                      {c.customerId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.company}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
                        {c.salesMemberName} ({c.salesMemberId})
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className={`status-pill ${
                          c.status === 'Active'
                            ? 'status-pill-green'
                            : c.status === 'Onboarding'
                            ? 'status-pill-blue'
                            : 'status-pill-red'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setDetailedCustomerView(c)}
                        className="btn btn-ghost btn-sm btn-icon-only"
                        title="View customer details"
                      >
                        <Eye size={15} style={{ color: '#0284c7' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
