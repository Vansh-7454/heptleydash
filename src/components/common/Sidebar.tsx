'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { AdminTab, SalesTab } from '@/types';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  UserCheck,
  UserPlus,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';

export default function Sidebar() {
  const {
    role,
    setRole,
    activeAdminTab,
    setActiveAdminTab,
    activeSalesTab,
    setActiveSalesTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
    isSidebarCollapsed,
    toggleSidebar,
    setDetailedCustomerView,
    currentSalesMember,
    userProfile,
  } = useDashboard();

  const handleNav = (action: () => void) => {
    setDetailedCustomerView(null);
    action();
    setIsMobileNavOpen(false);
  };

  const adminMainItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Briefcase size={18} /> },
    { id: 'sales-members', label: 'Sales Members', icon: <Users size={18} /> },
  ];

  const salesMainItems: { id: SalesTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
    { id: 'my-customers', label: 'My Customers', icon: <UserCheck size={18} /> },
    { id: 'add-customer', label: 'Add Customer', icon: <UserPlus size={18} /> },
  ];

  const sidebarWidth = isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  const navContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: isSidebarCollapsed ? '1rem 0.5rem' : '1.25rem 0.875rem',
      }}
    >
      <div>
        {/* Sidebar Brand Header with Collapse Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-default)',
            marginBottom: '1rem',
          }}
        >
          {isSidebarCollapsed ? (
            <button
              onClick={toggleSidebar}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.15rem',
                boxShadow: '0 2px 6px var(--brand-accent-glow)',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Expand sidebar"
            >
              h
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-accent)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    boxShadow: '0 2px 6px var(--brand-accent-glow)',
                  }}
                >
                  h
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-primary)',
                      display: 'block',
                      lineHeight: 1.1,
                    }}
                  >
                    heptley<span style={{ color: 'var(--brand-accent)' }}>.</span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Business Portal
                  </span>
                </div>
              </div>

              {/* Desktop Collapse / Expand Button */}
              <button
                onClick={toggleSidebar}
                className="btn-subtle"
                style={{
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          )}
        </div>

        {/* Main Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {role === 'admin'
            ? adminMainItems.map((item) => {
                const isActive = activeAdminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(() => setActiveAdminTab(item.id))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: isSidebarCollapsed ? '0.65rem' : '0.625rem 0.875rem',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--brand-accent-subtle)' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span style={{ color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                    {isActive && !isSidebarCollapsed && (
                      <span
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-accent)',
                        }}
                      />
                    )}
                  </button>
                );
              })
            : salesMainItems.map((item) => {
                const isActive = activeSalesTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(() => setActiveSalesTab(item.id))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: isSidebarCollapsed ? '0.65rem' : '0.625rem 0.875rem',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--brand-accent-subtle)' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span style={{ color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                    {isActive && !isSidebarCollapsed && (
                      <span
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-accent)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
        </nav>

        {/* Separator before Settings */}
        <div style={{ height: '1px', backgroundColor: 'var(--border-default)', margin: '1rem 0' }} />

        {/* Settings and Profile Navigation Item */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button
            onClick={() => handleNav(() => (role === 'admin' ? setActiveAdminTab('settings') : setActiveSalesTab('settings')))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: isSidebarCollapsed ? '0.65rem' : '0.625rem 0.875rem',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: (role === 'admin' ? activeAdminTab === 'settings' : activeSalesTab === 'settings') ? 600 : 500,
              color: (role === 'admin' ? activeAdminTab === 'settings' : activeSalesTab === 'settings') ? 'var(--brand-accent)' : 'var(--text-secondary)',
              backgroundColor: (role === 'admin' ? activeAdminTab === 'settings' : activeSalesTab === 'settings') ? 'var(--brand-accent-subtle)' : 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
            }}
            title={isSidebarCollapsed ? 'Settings' : undefined}
          >
            <Settings size={18} style={{ color: (role === 'admin' ? activeAdminTab === 'settings' : activeSalesTab === 'settings') ? 'var(--brand-accent)' : 'var(--text-muted)' }} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div
        style={{
          borderTop: '1px solid var(--border-default)',
          paddingTop: '0.875rem',
        }}
      >
        <div
          onClick={() => handleNav(() => (role === 'admin' ? setActiveAdminTab('profile') : setActiveSalesTab('profile')))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: isSidebarCollapsed ? '0.4rem 0' : '0.4rem 0.5rem',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title={isSidebarCollapsed ? (role === 'admin' ? userProfile.name : 'Sales Representative') : undefined}
        >
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
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {role === 'admin' ? 'AD' : 'SR'}
          </div>

          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {role === 'admin' ? userProfile.name : 'Sales Representative'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {role === 'admin' ? 'Super Admin' : 'Sales Operations'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          width: sidebarWidth,
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          minHeight: 'calc(100vh - var(--header-height))',
          flexShrink: 0,
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {navContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileNavOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 99,
          }}
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            style={{
              width: '260px',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
