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
  DollarSign,
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    totalSalesMembers,
    totalCustomers,
    activeCustomers,
    openLeadsCount,
    pendingFollowUpsCount,
    customers,
    salesMembers,
    leads,
    todayFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    activities,
    stats,
    setActiveAdminTab,
    setDetailedCustomerView,
    setIsAddCustomerModalOpen,
    setIsAddMemberModalOpen,
    setIsAddLeadModalOpen,
    setIsAddFollowUpModalOpen,
    markFollowUpComplete,
  } = useDashboard();

  const [lookupQuery, setLookupQuery] = useState('');
  const [followUpTab, setFollowUpTab] = useState<'overdue' | 'today' | 'upcoming'>('today');

  const recentCustomers = customers.slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  // Live real-time financial metrics from MongoDB
  const realTotalRevenue = stats?.totalRevenue ?? customers.reduce((acc, c) => acc + (c.finalAmount || 0), 0);
  const realCollectedRevenue = stats?.totalCollected ?? customers.reduce((acc, c) => acc + (c.amountPaid || 0), 0);
  const realOutstanding = stats?.totalOutstanding ?? Math.max(0, realTotalRevenue - realCollectedRevenue);
  const realRealizationRate = realTotalRevenue > 0 ? Math.round((realCollectedRevenue / realTotalRevenue) * 100) : 0;

  const totalContractValue = realTotalRevenue;
  const totalReceivedValue = realCollectedRevenue;

  const activeFollowUpList =
    followUpTab === 'overdue'
      ? overdueFollowUps
      : followUpTab === 'today'
      ? todayFollowUps
      : upcomingFollowUps;

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
            Monitor overall sales team performance, track customers, active leads, and follow-ups.
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

          <Button
            variant="outline"
            size="sm"
            className="btn-pill"
            leftIcon={<Briefcase size={14} />}
            onClick={() => setIsAddCustomerModalOpen(true)}
          >
            + Add Customer
          </Button>
        </div>
      </div>

      {/* 2. Quick Search Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #9fd8ed',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-md)',
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
              placeholder="Search by customer name, company, or team member..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1.15rem',
                borderRadius: '9999px',
                border: '1.5px solid #9fd8ed',
                backgroundColor: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                color: 'var(--text-primary)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color var(--transition-fast)',
              }}
            />
          </div>

          <button
            type="button"
            className="btn-pill"
            style={{
              padding: '0.7rem 1.6rem',
              backgroundColor: '#bde7f6',
              color: '#021a29',
              border: '1px solid #9fd8ed',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(159, 216, 237, 0.4)',
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
              border: '1.5px solid #9fd8ed',
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

      {/* 3. Real-Time Revenue Realization & Cash Collection (Live from MongoDB) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #9fd8ed',
          padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
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
                color: '#0284c7',
                marginBottom: '0.2rem',
              }}
            >
              <DollarSign size={14} />
              <span>Real-Time Revenue & Financial Ledger</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Cash Realization & Outstanding Receivables
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#e6f4fb',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #9fd8ed',
              }}
            >
              {realRealizationRate}% Realized
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f0f9fd', borderRadius: '14px', border: '1.5px solid #9fd8ed', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)' }}>
            <span style={{ fontSize: '0.8125rem', color: '#073857', fontWeight: 800 }}>Total Contracted Revenue</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0284c7', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              ₹{realTotalRevenue.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#1e3a52', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>Across all active & delivered accounts</span>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ecfdf5', borderRadius: '14px', border: '1.5px solid #a7f3d0', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)' }}>
            <span style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 800 }}>Collected Cash (Realized)</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#065f46', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              ₹{realCollectedRevenue.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>Verified payments in MongoDB</span>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#fffbeb', borderRadius: '14px', border: '1.5px solid #fde68a', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)' }}>
            <span style={{ fontSize: '0.8125rem', color: '#b45309', fontWeight: 800 }}>Outstanding Balance</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#92400e', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              ₹{realOutstanding.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>Remaining contract balance</span>
          </div>
        </div>
      </div>

      {/* 4. 4 Metric Cards (Lightened Sky-Cyan Cards + White Combination) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: Total Customers */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #9fd8ed',
            padding: '1.65rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#e6f4fb',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #9fd8ed',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
                  flexShrink: 0,
                }}
              >
                <Briefcase size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Total Customers
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Client Accounts
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {totalCustomers}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#065f46', backgroundColor: '#ecfdf5', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                {activeCustomers} active
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#f0f9fd', borderRadius: '12px', border: '1px solid #e0f2fe', fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Bookings: <strong style={{ color: '#0284c7', fontWeight: 800 }}>₹{totalContractValue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Card 2: Sales Team */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #9fd8ed',
            padding: '1.65rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f3ff',
                  color: '#7e22ce',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd6fe',
                  boxShadow: '0 2px 6px rgba(126, 34, 206, 0.08)',
                  flexShrink: 0,
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Sales Team
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Active Reps
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {totalSalesMembers}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#6b21a8', backgroundColor: '#f3e8ff', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #e9d5ff' }}>
                members
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#faf5ff', borderRadius: '12px', border: '1px solid #f3e8ff', fontSize: '0.82rem', color: '#021a29', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Team: <strong style={{ color: '#6b21a8', fontWeight: 800 }}>{salesMembers.map(m => m.name).join(', ')}</strong>
          </div>
        </div>

        {/* Card 3: Active Leads */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #9fd8ed',
            padding: '1.65rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #a7f3d0',
                  boxShadow: '0 2px 6px rgba(4, 120, 87, 0.08)',
                  flexShrink: 0,
                }}
              >
                <Target size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Active Leads
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Prospect Pipeline
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {openLeadsCount}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#065f46', backgroundColor: '#ecfdf5', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                open leads
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Won deals: <strong style={{ color: '#047857', fontWeight: 800 }}>{leads.filter(l => l.status === 'Won').length}</strong>
          </div>
        </div>

        {/* Card 4: Pending Follow-ups */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #9fd8ed',
            padding: '1.65rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb',
                  color: overdueFollowUps.length > 0 ? '#dc2626' : '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${overdueFollowUps.length > 0 ? '#fecaca' : '#fde68a'}`,
                  boxShadow: '0 2px 6px rgba(180, 83, 9, 0.08)',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Follow-ups
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Scheduled Tasks
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {pendingFollowUpsCount}
              </span>
              <span style={{ fontSize: '0.82rem', color: overdueFollowUps.length > 0 ? '#991b1b' : '#92400e', backgroundColor: overdueFollowUps.length > 0 ? '#fee2e2' : '#fffbeb', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: `1px solid ${overdueFollowUps.length > 0 ? '#fecaca' : '#fde68a'}` }}>
                {overdueFollowUps.length > 0 ? `${overdueFollowUps.length} overdue` : 'on schedule'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#fffdf5', borderRadius: '12px', border: '1px solid #fef3c7', fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Scheduled today: <strong style={{ color: overdueFollowUps.length > 0 ? '#dc2626' : '#b45309', fontWeight: 800 }}>{todayFollowUps.length}</strong>
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
            border: '1.5px solid #9fd8ed',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
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

          <div className="table-wrapper" style={{ border: '1px solid rgba(159, 216, 237, 0.4)', backgroundColor: '#ffffff' }}>
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
            border: '1.5px solid #9fd8ed',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
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

          <div className="table-wrapper" style={{ border: '1px solid rgba(98, 193, 229, 0.35)', backgroundColor: '#ffffff' }}>
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
