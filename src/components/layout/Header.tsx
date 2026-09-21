'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
} from 'lucide-react';

export default function Header() {
  const {
    role,
    userProfile,
    activeAdminTab,
    activeSalesTab,
    activeDeveloperTab,
    detailedCustomerView,
    setIsMobileNavOpen,
    unreadNotificationCount,
    logout,
    setActiveAdminTab,
    setActiveSalesTab,
    setActiveDeveloperTab,
  } = useDashboard();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (detailedCustomerView) {
      return {
        breadcrumb: 'Customers / Details',
        title: detailedCustomerView.name,
        company: detailedCustomerView.company,
      };
    }

    const tab = role === 'admin' ? activeAdminTab : role === 'sales' ? activeSalesTab : activeDeveloperTab;
    switch (tab) {
      case 'dashboard':
        return { breadcrumb: 'Workspace', title: role === 'developer' ? 'Developer Dashboard' : 'Dashboard', company: null };
      case 'sales-members':
        return { breadcrumb: 'Management', title: 'Sales Members', company: null };
      case 'websites-domains':
        return { breadcrumb: 'Infrastructure', title: 'Websites & Domains', company: null };
      case 'sales-questions':
        return { breadcrumb: 'Collaboration', title: 'Sales Technical Questions', company: null };
      case 'customers':
      case 'my-customers':
        return { breadcrumb: 'Directory', title: role === 'sales' ? 'My Customers' : 'Customers', company: null };
      case 'leads':
      case 'my-leads':
        return { breadcrumb: 'Pipeline', title: role === 'sales' ? 'My Leads' : 'Leads', company: null };
      case 'follow-ups':
        return { breadcrumb: 'CRM Schedule', title: 'Follow-ups', company: null };
      case 'activities':
        return { breadcrumb: 'Audit Trail', title: 'Activity Timeline', company: null };
      case 'payments':
        return { breadcrumb: 'Finance', title: 'Payments & Invoices', company: null };
      case 'reports':
        return { breadcrumb: 'Analytics', title: 'Executive Reports', company: null };
      case 'ai-assistant':
        return { breadcrumb: 'Intelligence', title: 'AI Sales Agent', company: null };
      case 'notifications':
        return { breadcrumb: 'System', title: 'Notifications Center', company: null };
      case 'settings':
        return { breadcrumb: 'Preferences', title: 'Portal Settings', company: null };
      case 'profile':
        return { breadcrumb: 'Account', title: 'User Profile', company: null };
      default:
        return { breadcrumb: 'Workspace', title: 'Dashboard', company: null };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: Mobile hamburger + System Active Pill Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="mobile-only"
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          aria-label="Open mobile navigation"
        >
          <Menu size={18} />
        </button>

        {/* Console 'System Active' pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--status-active-bg)',
            border: '1px solid var(--status-active-border)',
            color: 'var(--status-active-text)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            }}
          />
          <span>System Active</span>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>heptley</span>
          <span style={{ color: 'var(--brand-primary)' }}>/</span>
          <span>{pageInfo.breadcrumb}</span>
          <span style={{ color: 'var(--brand-primary)' }}>/</span>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{pageInfo.title}</strong>
        </div>
      </div>

      {/* Right: Notifications + User Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* Notifications Icon with Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--border-default)',
              backgroundColor: isNotificationsOpen ? 'var(--brand-accent-subtle)' : 'var(--bg-surface-subtle)',
              color: isNotificationsOpen ? 'var(--brand-accent-text)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--brand-accent)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-surface)',
                  boxShadow: '0 0 6px var(--brand-accent-glow)',
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* User Profile Chip */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.3rem 0.75rem 0.3rem 0.35rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-default)',
              backgroundColor: isUserMenuOpen ? 'var(--bg-surface-hover)' : 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {/* Circular Avatar Circle */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 0 8px var(--brand-accent-glow)',
              }}
            >
              {role === 'admin'
                ? 'AD'
                : role === 'developer'
                ? (userProfile.developerId ? userProfile.developerId.replace('-', '') : 'DEV')
                : userProfile.memberId
                ? userProfile.memberId.replace('-', '')
                : 'SM'}
            </div>

            <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="desktop-only">
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'inline-block',
                  marginRight: '0.35rem',
                }}
              >
                {userProfile.name}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: role === 'admin' ? '#0284c7' : role === 'developer' ? '#15803d' : '#047857',
                  backgroundColor: role === 'admin' ? '#f0f9fd' : role === 'developer' ? '#f0fdf4' : '#ecfdf5',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  border: `1px solid ${role === 'admin' ? '#bfdbfe' : role === 'developer' ? '#bbf7d0' : '#a7f3d0'}`,
                }}
              >
                {role === 'admin'
                  ? 'Admin'
                  : role === 'developer'
                  ? (userProfile.developerId || 'Developer')
                  : (userProfile.salesMemberId || userProfile.memberId || 'Rep')}
              </span>
            </div>

            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.45rem',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}
            >
              <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {userProfile.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (role === 'admin') setActiveAdminTab('profile');
                  else if (role === 'sales') setActiveSalesTab('profile');
                  else setActiveDeveloperTab('profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={15} style={{ color: 'var(--brand-accent-text)' }} />
                <span>My Profile & ID</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (role === 'admin') setActiveAdminTab('settings');
                  else if (role === 'sales') setActiveSalesTab('settings');
                  else setActiveDeveloperTab('settings');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Settings size={15} style={{ color: 'var(--text-muted)' }} />
                <span>Preferences</span>
              </button>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.25rem 0' }} />

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#f87171',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
