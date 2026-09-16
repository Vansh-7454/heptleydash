'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { ShieldCheck, UserCheck, ArrowRight, Layers, Users, Sparkles } from 'lucide-react';

export default function RoleSelectionPortal() {
  const { setRole, salesMembers, setCurrentSalesMember, customers } = useDashboard();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: 'var(--brand-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.75rem',
            letterSpacing: '-0.03em',
            boxShadow: '0 8px 24px var(--brand-accent-glow)',
            marginBottom: '1.25rem',
          }}
        >
          h
        </div>

        <h1
          style={{
            fontSize: '2.125rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '0.35rem',
          }}
        >
          heptley<span style={{ color: 'var(--brand-accent)' }}>.</span>
        </h1>

        <div
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em',
            marginBottom: '0.5rem',
          }}
        >
          Business Management Portal
        </div>

        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--text-muted)',
            maxWidth: '520px',
            lineHeight: 1.5,
            marginBottom: '2.25rem',
          }}
        >
          Select a role or representative below to demo role-based client segregation and team workflows.
        </p>

        {/* Top Grid: Admin and Overview */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Admin Role Card */}
          <button
            onClick={() => setRole('admin')}
            className="card card-hover"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              cursor: 'pointer',
              border: '1.5px solid var(--border-default)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-primary)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={22} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Admin Portal
              </span>
              <span className="badge badge-role-admin" style={{ fontSize: '0.7rem' }}>
                Executive
              </span>
            </div>

            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                marginBottom: '1.5rem',
                flexGrow: 1,
              }}
            >
              Full system control. Add and manage sales representatives, monitor all customers, and oversee enterprise allocations.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--brand-primary)',
              }}
            >
              <span>Launch Admin Dashboard</span>
              <ArrowRight size={16} />
            </div>
          </button>

          {/* Quick Info / Fast Launch Card */}
          <div
            className="card"
            style={{
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <UserCheck size={22} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Sales Reps
              </span>
              <span className="badge badge-role-sales" style={{ fontSize: '0.7rem' }}>
                Role Segregation
              </span>
            </div>

            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                marginBottom: '1.5rem',
                flexGrow: 1,
              }}
            >
              Select any representative below to enter their isolated workspace. Each rep sees only their assigned client portfolio.
            </p>

            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-accent)', fontWeight: 600 }}>
              ↓ Choose a representative below
            </div>
          </div>
        </div>

        {/* Section: Specific Sales Member Selection */}
        <div
          className="card"
          style={{
            width: '100%',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--brand-accent)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Login as Specific Sales Member
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {salesMembers.length} active demo accounts
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {salesMembers.map((member) => {
              const clientCount = customers.filter(
                (c) => c.salesMemberId === member.memberId
              ).length;

              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setCurrentSalesMember(member);
                    setRole('sales');
                  }}
                  className="btn-outline"
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.35rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-accent)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {member.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--brand-accent)',
                      }}
                    >
                      {member.memberId}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.2rem',
                    }}
                  >
                    <span>{clientCount} clients</span>
                    <span style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>Login →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prototype info footnote */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'left',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Layers size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Unified Single-Engine App:</strong> All roles share the same React application and state tree. Adding new sales reps or customers in Admin immediately propagates to the Sales workspaces.
          </span>
        </div>
      </div>
    </div>
  );
}
