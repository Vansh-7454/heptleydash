'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Header() {
  const {
    role,
    setRole,
    activeAdminTab,
    setActiveAdminTab,
    activeSalesTab,
    setActiveSalesTab,
    currentSalesMember,
    salesMembers,
    setCurrentSalesMember,
    isMobileNavOpen,
    setIsMobileNavOpen,
    detailedCustomerView,
    setDetailedCustomerView,
    userProfile,
    showToast,
    setIsCommandPaletteOpen,
  } = useDashboard();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumb and page title
  const getHeaderInfo = () => {
    if (detailedCustomerView) {
      return {
        breadcrumb: 'Portal / Customers / Account',
        title: detailedCustomerView.name,
      };
    }

    if (role === 'admin') {
      switch (activeAdminTab) {
        case 'dashboard':
          return { breadcrumb: 'heptley / Executive', title: 'Dashboard' };
        case 'projects':
          return { breadcrumb: 'heptley / Executive / Operations', title: 'Client Projects & Milestones' };
        case 'tasks':
          return { breadcrumb: 'heptley / Executive / CRM', title: 'Follow-ups & Tasks' };
        case 'sales-members':
          return { breadcrumb: 'heptley / Team', title: 'Sales Members' };
        case 'customers':
          return { breadcrumb: 'heptley / Directory', title: 'Customers' };
        case 'profile':
          return { breadcrumb: 'heptley / User', title: 'Admin Profile' };
        case 'settings':
          return { breadcrumb: 'heptley / System', title: 'Settings' };
        default:
          return { breadcrumb: 'heptley', title: 'Overview' };
      }
    } else {
      switch (activeSalesTab) {
        case 'dashboard':
          return { breadcrumb: 'heptley / Sales', title: 'Sales Dashboard' };
        case 'projects':
          return { breadcrumb: 'heptley / Sales / Operations', title: 'Assigned Client Projects' };
        case 'tasks':
          return { breadcrumb: 'heptley / Sales / CRM', title: 'My Tasks & Follow-ups' };
        case 'my-customers':
          return { breadcrumb: 'heptley / Portfolio', title: 'My Customers' };
        case 'add-customer':
          return { breadcrumb: 'heptley / Accounts', title: 'Add Customer' };
        case 'profile':
          return { breadcrumb: 'heptley / Account', title: 'Profile' };
        case 'settings':
          return { breadcrumb: 'heptley / Preferences', title: 'Settings' };
        default:
          return { breadcrumb: 'heptley', title: 'Workspace' };
      }
    }
  };

  const { breadcrumb, title } = getHeaderInfo();

  const handleNavigate = (tab: 'profile' | 'settings') => {
    setDetailedCustomerView(null);
    if (role === 'admin') {
      setActiveAdminTab(tab);
    } else {
      setActiveSalesTab(tab);
    }
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setDetailedCustomerView(null);
    setRole(null);
    showToast('Logged out of session', 'info');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(255, 255, 255, 0.86)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Mobile hamburger + Breadcrumbs + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Mobile menu hamburger toggle */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="btn-subtle"
          style={{
            display: 'none',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          aria-label="Toggle navigation menu"
          id="mobile-nav-toggle"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {breadcrumb}
          </span>
          <h1
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Representative Picker (if sales), Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Header Search Button Triggering Command Palette */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.38rem 0.65rem 0.38rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            width: '210px',
            transition: 'all 0.15s ease',
          }}
          className="header-search-box"
          title="Search anything (Ctrl+K)"
        >
          <Search size={14} style={{ color: 'var(--text-light)' }} />
          <span style={{ flex: 1, textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Quick search...</span>
          <kbd
            style={{
              padding: '0.15rem 0.4rem',
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              lineHeight: 1,
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications Icon with Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="btn-subtle"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              color: 'var(--text-secondary)',
            }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-accent)',
              }}
            />
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div
              className="dropdown-menu"
              style={{ width: '280px', right: 0, padding: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--brand-accent)', fontWeight: 600 }}>
                  2 new
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.775rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Client Contract Active</div>
                  <div style={{ color: 'var(--text-muted)' }}>ABC Technologies onboarding completed.</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>New Representative</div>
                  <div style={{ color: 'var(--text-muted)' }}>Sales accounts synced in local storage.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-default)' }} />

        {/* User Profile & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color var(--transition-fast)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* User Avatar Initial */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: role === 'admin' ? '#0f172a' : 'var(--brand-accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              {role === 'admin' ? 'AD' : 'SR'}
            </div>

            {/* Name and Role */}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="header-user-text">
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {role === 'admin' ? userProfile.name : 'Sales Representative'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {role === 'admin' ? 'Administrator' : 'Sales Operations'}
              </span>
            </div>

            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* User Dropdown Menu */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.25rem',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {role === 'admin' ? userProfile.name : 'Sales Representative'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {role === 'admin' ? userProfile.email : 'sales@heptley.in'}
                </div>
              </div>

              {/* 1-Click Workspace Switcher */}
              <button
                onClick={() => {
                  if (role === 'admin') {
                    setRole('sales');
                    showToast('Switched to Sales Workspace', 'info');
                  } else {
                    setRole('admin');
                    showToast('Switched to Admin Dashboard', 'info');
                  }
                  setIsDropdownOpen(false);
                }}
                className="dropdown-item"
                style={{
                  color: 'var(--brand-accent)',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={15} />
                <span>Switch to {role === 'admin' ? 'Sales Workspace' : 'Admin Dashboard'}</span>
              </button>

              <button onClick={() => handleNavigate('profile')} className="dropdown-item">
                <User size={15} />
                <span>Profile</span>
              </button>

              <button onClick={() => handleNavigate('settings')} className="dropdown-item">
                <Settings size={15} />
                <span>Settings</span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

              <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-nav-toggle {
            display: flex !important;
          }
          .header-search-box {
            display: none !important;
          }
          .header-user-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
