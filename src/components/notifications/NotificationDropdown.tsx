'use client';

import React, { useRef, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Bell, CheckCheck, Clock, UserPlus, CreditCard, RefreshCw, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui';

export interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveAdminTab,
    setActiveSalesTab,
    setActiveDeveloperTab,
    role,
  } = useDashboard();

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (notifId: string, targetTab?: string) => {
    // If the user was highlighting/selecting text, don't trigger navigation
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }
    }

    await markNotificationRead(notifId);
    if (targetTab) {
      if (role === 'admin') {
        setActiveAdminTab(targetTab as any);
      } else if (role === 'developer') {
        setActiveDeveloperTab(targetTab as any);
      } else {
        setActiveSalesTab(targetTab as any);
      }
    }
    onClose();
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
      case 'payment_received':
        return <CreditCard size={16} style={{ color: '#059669' }} />;
      default:
        return <RefreshCw size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '360px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Notifications
          </h4>
          {unreadNotificationCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              {unreadNotificationCount} new
            </span>
          )}
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            style={{
              fontSize: '0.75rem',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.8125rem' }}>No notifications</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={`nd-${notif.id || idx}-${idx}`}
              onClick={() => handleNotificationClick(notif.id, notif.targetTab)}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: notif.read ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                cursor: 'pointer',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <div
                style={{
                  marginTop: '0.15rem',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getIconForType(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: notif.read ? 500 : 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.15rem',
                  }}
                >
                  {notif.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  {notif.message}
                </p>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-light)',
                    display: 'block',
                    marginTop: '0.35rem',
                  }}
                >
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!notif.read && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-accent)',
                    marginTop: '0.5rem',
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.65rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface-subtle)',
        }}
      >
        <button
          onClick={() => {
            if (role === 'admin') setActiveAdminTab('notifications');
            else setActiveSalesTab('notifications');
            onClose();
          }}
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          View all in notifications center →
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
