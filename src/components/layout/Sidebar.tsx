'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { AdminTab, SalesTab } from '@/types';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  Clock,
  Activity,
  CreditCard,
  BarChart3,
  Bot,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const {
    role,
    userProfile,
    activeAdminTab,
    setActiveAdminTab,
    activeSalesTab,
    setActiveSalesTab,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileNavOpen,
    setIsMobileNavOpen,
    setDetailedCustomerView,
    logout,
  } = useDashboard();

  const handleNavClick = (tab: AdminTab | SalesTab) => {
    setDetailedCustomerView(null);
    if (role === 'admin') {
      setActiveAdminTab(tab as AdminTab);
    } else {
      setActiveSalesTab(tab as SalesTab);
    }
    setIsMobileNavOpen(false);
  };

  const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'sales-members', label: 'Sales Members', icon: <Users size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Briefcase size={18} /> },
    { id: 'leads', label: 'Leads', icon: <Target size={18} /> },
    { id: 'follow-ups', label: 'Follow-ups', icon: <Clock size={18} /> },
    { id: 'activities', label: 'Activities', icon: <Activity size={18} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const salesNavItems: { id: SalesTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'my-leads', label: 'My Leads', icon: <Target size={18} /> },
    { id: 'my-customers', label: 'My Customers', icon: <Briefcase size={18} /> },
    { id: 'follow-ups', label: 'Follow-ups', icon: <Clock size={18} /> },
    { id: 'activities', label: 'Activities', icon: <Activity size={18} /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const currentItems = role === 'admin' ? adminNavItems : salesNavItems;
  const currentActiveTab = role === 'admin' ? activeAdminTab : activeSalesTab;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
          }}
          className="mobile-only"
        />
      )}

      <aside
        style={{
          width: isSidebarCollapsed ? '72px' : '260px',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width var(--transition-normal)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 45,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Top Branding & Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Logo Header */}
          <div
            style={{
              height: '68px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              padding: isSidebarCollapsed ? '0' : '0 1.25rem',
              borderBottom: '1.5px solid var(--border-default)',
              flexShrink: 0,
            }}
          >
            {!isSidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#bde7f6',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #9fd8ed',
                    boxShadow: '0 2px 8px rgba(159, 216, 237, 0.4)',
                  }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                      display: 'block',
                      lineHeight: 1.15,
                    }}
                  >
                    heptley
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      display: 'block',
                      color: '#0284c7',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Business Portal
                  </span>
                </div>
              </div>
            )}

            {isSidebarCollapsed && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#bde7f6',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #9fd8ed',
                  boxShadow: '0 2px 8px rgba(159, 216, 237, 0.4)',
                }}
              >
                <Shield size={20} />
              </div>
            )}

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              className="desktop-only"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Section Header */}
          {!isSidebarCollapsed && (
            <div
              style={{
                padding: '1rem 1.25rem 0.4rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#073857',
                flexShrink: 0,
              }}
            >
              Navigation
            </div>
          )}

          {/* Navigation Links */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', minHeight: 0 }}>
            {currentItems.map((item) => {
              const isActive = currentActiveTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: isSidebarCollapsed ? '0.55rem 0' : '0.5rem 0.9rem',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 800 : 600,
                    color: '#021a29',
                    backgroundColor: isActive ? '#bde7f6' : 'transparent',
                    border: isActive ? '1px solid #9fd8ed' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 2px 10px rgba(159, 216, 237, 0.4)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = '#0284c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#021a29';
                    }
                  }}
                >
                  <span
                    style={{
                      color: isActive ? '#ffffff' : '#073857',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div
          style={{
            flexShrink: 0,
            padding: isSidebarCollapsed ? '0.75rem 0.35rem' : '0.85rem 1.15rem',
            borderTop: '1.5px solid var(--border-default)',
            backgroundColor: '#ffffff',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              gap: '0.65rem',
            }}
          >
            {!isSidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#bde7f6',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(159, 216, 237, 0.4)',
                  }}
                >
                  {role === 'admin' ? 'AD' : userProfile.memberId ? userProfile.memberId.replace('-', '') : 'SM'}
                </div>
                <div style={{ overflow: 'hidden', lineHeight: 1.2 }}>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#021a29',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0,
                    }}
                  >
                    {userProfile.name}
                  </p>
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: '#1e3a52',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: '0.15rem 0 0',
                    }}
                  >
                    {userProfile.email}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all var(--transition-fast)',
              }}
              title="Sign Out"
              aria-label="Sign Out"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
