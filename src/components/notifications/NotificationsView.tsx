'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Table, Badge, Button, Tabs } from '@/components/ui';
import { getSafeClickProps } from '@/utils/safeClick';
import {
  Bell,
  CheckCheck,
  Clock,
  UserPlus,
  CreditCard,
  RefreshCw,
  Target,
  ArrowRight,
  Globe,
} from 'lucide-react';

export default function NotificationsView() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveAdminTab,
    setActiveSalesTab,
    setActiveDeveloperTab,
    role,
  } = useDashboard();

  const [filter, setFilter] = useState<'all' | 'followup' | 'customer' | 'lead' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'followup') return n.type.includes('followup');
    if (filter === 'customer') return n.type.includes('customer') || n.type.includes('payment');
    if (filter === 'lead') return n.type.includes('lead');
    return true;
  });

  const handleNotificationClick = async (notifId: string) => {
    // If the user was highlighting/selecting text (e.g. to copy), don't trigger navigation
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }
    }

    // Mark as seen in-place without navigating away
    await markNotificationRead(notifId);
  };

  const handleNavigateToRecord = (e: React.MouseEvent, targetTab?: string) => {
    e.stopPropagation();
    if (!targetTab) return;
    if (role === 'admin') setActiveAdminTab(targetTab as any);
    else if (role === 'developer') setActiveDeveloperTab(targetTab as any);
    else setActiveSalesTab(targetTab as any);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'DOMAIN_EXPIRY_30_DAYS':
      case 'domain_expiring_soon':
      case 'domain_expired':
        return <Globe size={16} style={{ color: '#d97706' }} />;
      case 'customer_assigned':
        return <UserPlus size={16} style={{ color: 'var(--brand-accent)' }} />;
      case 'followup_due':
      case 'followup_overdue':
        return <Clock size={16} style={{ color: '#d97706' }} />;
      case 'lead_updated':
        return <Target size={16} style={{ color: '#9333ea' }} />;
      case 'payment_received':
        return <CreditCard size={16} style={{ color: '#059669' }} />;
      default:
        return <RefreshCw size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.25rem 0',
            }}
          >
            Notifications
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Stay updated on follow-ups, assignments and customer activity.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCheck size={14} />}
          onClick={() => markAllNotificationsRead()}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'followup', label: 'Follow-ups', count: notifications.filter((n) => n.type.includes('followup')).length },
          { key: 'customer', label: 'Customers', count: notifications.filter((n) => n.type.includes('customer') || n.type.includes('payment')).length },
          { key: 'lead', label: 'Leads', count: notifications.filter((n) => n.type.includes('lead')).length },
          { key: 'unread', label: 'Unread', count: notifications.filter((n) => !n.read).length },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                border: `1px solid ${isActive ? 'var(--brand-accent)' : 'var(--border-subtle, #e2e8f0)'}`,
                backgroundColor: isActive ? 'var(--brand-accent)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-secondary, #475569)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filtered.length === 0 ? (
          <Card style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>No notifications found</p>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>You're all caught up with your CRM updates.</p>
          </Card>
        ) : (
          filtered.map((notif, idx) => (
            <div
              key={`notif-${notif.id || idx}-${idx}`}
              {...getSafeClickProps(() => handleNotificationClick(notif.id))}
              style={{
                padding: '0.95rem 1.25rem',
                backgroundColor: notif.read ? '#ffffff' : '#f8fafc',
                border: `1px solid ${notif.read ? 'var(--border-subtle, #e2e8f0)' : '#cbd5e1'}`,
                borderLeft: !notif.read ? '3px solid var(--brand-accent)' : '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
                boxShadow: notif.read ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '9px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIconForType(notif.type)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: notif.read ? 600 : 700, color: 'var(--text-primary)', margin: 0 }}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </span>
                {notif.targetTab && (
                  <button
                    type="button"
                    onClick={(e) => handleNavigateToRecord(e, notif.targetTab)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.35rem 0.55rem',
                      borderRadius: '6px',
                      color: 'var(--brand-accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                    title={`Open in ${notif.targetTab}`}
                  >
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
