'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Table, Badge, Button, Tabs } from '@/components/ui';
import {
  Bell,
  CheckCheck,
  Clock,
  UserPlus,
  CreditCard,
  RefreshCw,
  Target,
  ArrowRight,
} from 'lucide-react';

export default function NotificationsView() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveAdminTab,
    setActiveSalesTab,
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

  const handleNotificationClick = async (notifId: string, targetTab?: string) => {
    await markNotificationRead(notifId);
    if (targetTab) {
      if (role === 'admin') setActiveAdminTab(targetTab as any);
      else setActiveSalesTab(targetTab as any);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
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
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.78rem' }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('followup')}
          className={`btn btn-sm ${filter === 'followup' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.78rem' }}
        >
          Follow-up Reminders ({notifications.filter((n) => n.type.includes('followup')).length})
        </button>
        <button
          onClick={() => setFilter('customer')}
          className={`btn btn-sm ${filter === 'customer' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.78rem' }}
        >
          Customer Updates ({notifications.filter((n) => n.type.includes('customer') || n.type.includes('payment')).length})
        </button>
        <button
          onClick={() => setFilter('lead')}
          className={`btn btn-sm ${filter === 'lead' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.78rem' }}
        >
          Lead Assignments ({notifications.filter((n) => n.type.includes('lead')).length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`btn btn-sm ${filter === 'unread' ? 'btn-danger' : 'btn-outline'}`}
          style={{ fontSize: '0.78rem' }}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 ? (
          <Card style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>No notifications found</p>
            <p style={{ fontSize: '0.8125rem' }}>You're all caught up with your CRM updates.</p>
          </Card>
        ) : (
          filtered.map((notif, idx) => (
            <Card
              key={`notif-${notif.id || idx}-${idx}`}
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: notif.read ? 'var(--bg-surface)' : '#eff6ff',
                borderColor: notif.read ? 'var(--border-default)' : '#bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => handleNotificationClick(notif.id, notif.targetTab)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIconForType(notif.type)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {notif.title}
                    </h4>
                    {!notif.read && <Badge variant="info">New</Badge>}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    {notif.message}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </span>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
