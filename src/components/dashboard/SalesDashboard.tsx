'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Badge, Button } from '@/components/ui';
import {
  Briefcase,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Shield,
  Layers,
  Activity as ActivityIcon,
  ChevronRight,
} from 'lucide-react';

export default function SalesDashboard() {
  const {
    userProfile,
    myCustomers,
    myLeads,
    myFollowUps,
    myActivities,
    todayFollowUps,
    overdueFollowUps,
    setActiveSalesTab,
    setDetailedCustomerView,
    setIsAddCustomerModalOpen,
    setIsAddFollowUpModalOpen,
    markFollowUpComplete,
  } = useDashboard();

  const [lookupQuery, setLookupQuery] = useState('');

  // Rep-specific workflow metrics (pure customer, lead & task operations)
  const activeCustomerCount = myCustomers.filter(
    (c) => c.status === 'Active' || c.status === 'Onboarding'
  ).length;

  const openLeads = myLeads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');
  const openLeadsCount = openLeads.length;

  const memberId = userProfile.salesMemberId || userProfile.memberId || 'SM-001';

  // Quick lookup filter
  const filteredLookupResults = lookupQuery.trim()
    ? myCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(lookupQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(lookupQuery.toLowerCase()) ||
          c.customerId.toLowerCase().includes(lookupQuery.toLowerCase()) ||
          c.service.toLowerCase().includes(lookupQuery.toLowerCase())
      )
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
            <Sparkles size={15} />
            <span>Sales Workspace</span>
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
            Sales Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{userProfile.name}</strong>. Track your assigned customers, active leads, and upcoming client follow-ups.
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
            <span>{userProfile.name} ({memberId})</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="btn-pill"
            leftIcon={<Clock size={14} />}
            onClick={() => setIsAddFollowUpModalOpen(true)}
          >
            + Schedule Follow-up
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

      {/* 2. Quick Lookup Card */}
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
          Search My Customers & Leads
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.25rem' }}>
          Quickly find assigned customers, company details, or active leads.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by customer name, company, or service..."
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
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
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
              if (filteredLookupResults.length > 0) {
                setDetailedCustomerView(filteredLookupResults[0]);
              } else {
                setActiveSalesTab('my-customers');
              }
            }}
          >
            Search
          </button>
        </div>

        {/* Fast Query Dropdown Preview */}
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
            {filteredLookupResults.length === 0 ? (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No assigned accounts matched "{lookupQuery}".
              </span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#0284c7' }}>
                  Matching Accounts:
                </span>
                {filteredLookupResults.map((c, idx) => (
                  <div
                    key={`lookup-${c.id || c.customerId || idx}-${idx}`}
                    onClick={() => setDetailedCustomerView(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(98, 193, 229, 0.3)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        {c.company} ({c.customerId})
                      </span>
                    </div>
                    <Badge variant="info">View Customer</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 4 Workflow Metric Cards (Lightened Sky-Cyan Cards + White Combination) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: My Customers */}
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
                  My Customers
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Assigned Accounts
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {myCustomers.length}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#065f46', backgroundColor: '#ecfdf5', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                {activeCustomerCount} active
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#f0f9fd', borderRadius: '12px', border: '1px solid #e0f2fe', fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Portfolio: <strong style={{ color: '#0284c7', fontWeight: 800 }}>{activeCustomerCount} active · {Math.max(0, myCustomers.length - activeCustomerCount)} onboarding</strong>
          </div>
        </div>

        {/* Card 2: Open Leads */}
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
                <Target size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Active Leads
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Pipeline Prospects
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {openLeadsCount}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#6b21a8', backgroundColor: '#f3e8ff', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #e9d5ff' }}>
                in pipeline
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#faf5ff', borderRadius: '12px', border: '1px solid #f3e8ff', fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Pipeline status: <strong style={{ color: '#6b21a8', fontWeight: 800 }}>{myLeads.filter(l => l.status === 'Won').length} won · {openLeadsCount} active</strong>
          </div>
        </div>

        {/* Card 3: Today's Follow-ups */}
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
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #fde68a',
                  boxShadow: '0 2px 6px rgba(180, 83, 9, 0.08)',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Today's Follow-ups
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Scheduled Calls & Tasks
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {todayFollowUps.length}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#92400e', backgroundColor: '#fffbeb', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #fde68a' }}>
                today
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: '#fffdf5', borderRadius: '12px', border: '1px solid #fef3c7', fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Follow-ups: <strong style={{ color: '#b45309', fontWeight: 800 }}>{myFollowUps.length} total scheduled</strong>
          </div>
        </div>

        {/* Card 4: Overdue Follow-ups */}
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
                  backgroundColor: overdueFollowUps.length > 0 ? '#fef2f2' : '#ecfdf5',
                  color: overdueFollowUps.length > 0 ? '#dc2626' : '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${overdueFollowUps.length > 0 ? '#fecaca' : '#a7f3d0'}`,
                  boxShadow: `0 2px 6px ${overdueFollowUps.length > 0 ? 'rgba(220, 38, 38, 0.08)' : 'rgba(4, 120, 87, 0.08)'}`,
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Overdue Tasks
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                  Pending Attention
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#021a29', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {overdueFollowUps.length}
              </span>
              <span style={{ fontSize: '0.82rem', color: overdueFollowUps.length > 0 ? '#991b1b' : '#065f46', backgroundColor: overdueFollowUps.length > 0 ? '#fee2e2' : '#ecfdf5', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontWeight: 800, border: `1px solid ${overdueFollowUps.length > 0 ? '#fecaca' : '#a7f3d0'}` }}>
                {overdueFollowUps.length > 0 ? `${overdueFollowUps.length} urgent` : 'all clear'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: overdueFollowUps.length > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '12px', border: `1px solid ${overdueFollowUps.length > 0 ? '#fee2e2' : '#dcfce7'}`, fontSize: '0.82rem', color: '#021a29', fontWeight: 600 }}>
            Status: <strong style={{ color: overdueFollowUps.length > 0 ? '#dc2626' : '#047857', fontWeight: 800 }}>{overdueFollowUps.length > 0 ? `${overdueFollowUps.length} tasks require follow-up` : 'All tasks up to date'}</strong>
          </div>
        </div>
      </div>

      {/* 5. Recent Customers & Scheduled Follow-ups Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: '1.75rem' }}>
        {/* Table 1: Recent Customers */}
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
                My Assigned Customers
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Active client accounts for {userProfile.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveSalesTab('my-customers')}
            >
              View All ({myCustomers.length})
            </Button>
          </div>

          <div className="table-wrapper" style={{ border: '1px solid rgba(126, 205, 232, 0.35)', backgroundColor: '#ffffff' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '115px', whiteSpace: 'nowrap' }}>Customer ID</th>
                  <th>Customer & Company</th>
                  <th style={{ minWidth: '130px' }}>Service</th>
                  <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '75px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myCustomers.map((c, idx) => (
                  <tr key={`cust-${c.id || c.customerId || idx}-${idx}`}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0284c7', whiteSpace: 'nowrap' }}>
                      {c.customerId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.company}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.service}</td>
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

        {/* Table 1: My Assigned Customers */}
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
                My Assigned Customers
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Active client accounts for {userProfile.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveSalesTab('my-customers')}
            >
              View All ({myCustomers.length})
            </Button>
          </div>

          <div className="table-wrapper" style={{ border: '1px solid rgba(159, 216, 237, 0.4)', backgroundColor: '#ffffff' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '115px', whiteSpace: 'nowrap' }}>Customer ID</th>
                  <th>Customer & Company</th>
                  <th style={{ minWidth: '130px' }}>Service</th>
                  <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '75px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myCustomers.map((c, idx) => (
                  <tr key={`cust-${c.id || c.customerId || idx}-${idx}`}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0284c7', whiteSpace: 'nowrap' }}>
                      {c.customerId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.company}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.service}</td>
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

        {/* Table 2: Today's Follow-ups */}
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
                Today's Follow-ups
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Calls, meetings, and client follow-ups
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="btn-pill"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => setActiveSalesTab('follow-ups')}
            >
              All ({myFollowUps.length})
            </Button>
          </div>

          {todayFollowUps.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={28} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>All follow-ups for today have been completed!</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: '1px solid rgba(159, 216, 237, 0.4)', backgroundColor: '#ffffff' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '130px' }}>Contact</th>
                    <th>Follow-up Task</th>
                    <th style={{ width: '90px', whiteSpace: 'nowrap' }}>Time</th>
                    <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ width: '75px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayFollowUps.map((f, idx) => (
                    <tr key={`tfup-${f.id || f.followUpId || idx}-${idx}`}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.entityName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{f.company}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>{f.title}</div>
                        {f.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{f.note}</div>}
                      </td>
                      <td style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {f.time}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span
                          className={`status-pill ${
                            f.status === 'Completed'
                              ? 'status-pill-green'
                              : f.status === 'Overdue'
                              ? 'status-pill-red'
                              : 'status-pill-blue'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-pill"
                          onClick={() => markFollowUpComplete(f.id)}
                        >
                          Done
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
