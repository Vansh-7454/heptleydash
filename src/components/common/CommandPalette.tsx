'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Briefcase,
  Users,
  Settings,
  User,
  Building,
  Plus,
  ArrowRight,
  Sparkles,
  Command,
  Download,
} from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Customers' | 'Projects' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const {
    role,
    setRole,
    setActiveAdminTab,
    setActiveSalesTab,
    customers,
    projects,
    setDetailedCustomerView,
    setIsAddCustomerModalOpen,
    setIsAddProjectModalOpen,
    showToast,
  } = useDashboard();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & reset state
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command items
  const allItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav_dashboard',
      category: 'Navigation',
      title: 'Dashboard Overview',
      subtitle: role === 'admin' ? 'Executive analytics and client breakdown' : 'Sales representative portfolio',
      icon: <LayoutDashboard size={16} />,
      action: () => {
        setDetailedCustomerView(null);
        if (role === 'admin') setActiveAdminTab('dashboard');
        else setActiveSalesTab('dashboard');
      },
    },
    {
      id: 'nav_projects',
      category: 'Navigation',
      title: 'Projects & Milestones',
      subtitle: 'Track operational deliverables and sprint progression',
      icon: <FolderKanban size={16} />,
      badge: `${projects.length} Active`,
      action: () => {
        setDetailedCustomerView(null);
        if (role === 'admin') setActiveAdminTab('projects');
        else setActiveSalesTab('projects');
      },
    },
    {
      id: 'nav_tasks',
      category: 'Navigation',
      title: 'Tasks & Follow-ups',
      subtitle: 'Operational follow-up scheduling and meeting agendas',
      icon: <CheckSquare size={16} />,
      action: () => {
        setDetailedCustomerView(null);
        if (role === 'admin') setActiveAdminTab('tasks');
        else setActiveSalesTab('tasks');
      },
    },
    {
      id: 'nav_customers',
      category: 'Navigation',
      title: 'Customer Directory',
      subtitle: 'Manage client accounts, contracts, and service tiers',
      icon: <Briefcase size={16} />,
      badge: `${customers.length} Accounts`,
      action: () => {
        setDetailedCustomerView(null);
        if (role === 'admin') setActiveAdminTab('customers');
        else setActiveSalesTab('my-customers');
      },
    },
    ...(role === 'admin'
      ? [
          {
            id: 'nav_members',
            category: 'Navigation' as const,
            title: 'Sales Team Roster',
            subtitle: 'Team capacity, client allocation, and active reps',
            icon: <Users size={16} />,
            action: () => {
              setDetailedCustomerView(null);
              setActiveAdminTab('sales-members');
            },
          },
        ]
      : []),
    {
      id: 'nav_settings',
      category: 'Navigation',
      title: 'Portal Settings',
      subtitle: 'System preferences, role configuration, and audit settings',
      icon: <Settings size={16} />,
      action: () => {
        setDetailedCustomerView(null);
        if (role === 'admin') setActiveAdminTab('settings');
        else setActiveSalesTab('settings');
      },
    },

    // Quick Actions
    {
      id: 'action_add_customer',
      category: 'Actions',
      title: 'Create New Customer Account',
      subtitle: 'Register new client with service tier and allocated rep',
      icon: <Plus size={16} style={{ color: 'var(--brand-accent)' }} />,
      action: () => {
        setIsAddCustomerModalOpen(true);
      },
    },
    {
      id: 'action_add_project',
      category: 'Actions',
      title: 'Create New Project Deliverable',
      subtitle: 'Allocate sprint milestones to your engineering roster',
      icon: <FolderKanban size={16} style={{ color: '#0284c7' }} />,
      action: () => {
        setIsAddProjectModalOpen(true);
      },
    },
    {
      id: 'action_export_csv',
      category: 'Actions',
      title: 'Export Customers Directory to CSV',
      subtitle: 'Download spreadsheet of all live accounts for audit',
      icon: <Download size={16} style={{ color: '#16a34a' }} />,
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        exportToCsv(
          `heptley_customers_${today}`,
          customers,
          [
            { key: 'customerId', label: 'Customer ID' },
            { key: 'name', label: 'Client Name' },
            { key: 'company', label: 'Company' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'service', label: 'Service' },
            { key: 'package', label: 'Package Tier' },
            { key: 'status', label: 'Status' },
            { key: 'salesMemberName', label: 'Assigned Member' },
          ]
        );
        showToast('Exported customer directory to CSV', 'success');
      },
    },

    // Customers
    ...customers.map((c) => ({
      id: `customer_${c.id}`,
      category: 'Customers' as const,
      title: c.name,
      subtitle: `${c.company} · ${c.service} (${c.status})`,
      icon: <Building size={16} style={{ color: '#6366f1' }} />,
      badge: c.customerId,
      action: () => {
        setDetailedCustomerView(c);
      },
    })),

    // Projects
    ...projects.map((p) => ({
      id: `project_${p.id}`,
      category: 'Projects' as const,
      title: p.title,
      subtitle: `${p.clientName} · ${p.progress}% Complete (${p.stage})`,
      icon: <FolderKanban size={16} style={{ color: '#0284c7' }} />,
      badge: p.projectId,
      action: () => {
        setDetailedCustomerView(null);
        if (role === 'admin') setActiveAdminTab('projects');
        else setActiveSalesTab('projects');
      },
    })),
  ];

  // Filter items by query
  const filteredItems = allItems.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  // Group filtered items by category
  const categories: Array<CommandItem['category']> = ['Navigation', 'Actions', 'Customers', 'Projects'];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        animation: 'paletteFadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Search size={18} style={{ color: 'var(--brand-accent)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, customer, project, or tab..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              width: '100%',
              color: '#0f172a',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
            }}
          />
          <kbd
            style={{
              padding: '0.2rem 0.45rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              color: '#64748b',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          style={{
            padding: '0.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              No results found for &ldquo;<strong>{query}</strong>&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} style={{ marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '0.4rem 0.75rem',
                    }}
                  >
                    {cat}
                  </div>

                  {catItems.map((item) => {
                    const globalIdx = filteredItems.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f8fafc' : 'transparent',
                          border: isSelected ? '1px solid #e2e8f0' : '1px solid transparent',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              backgroundColor: isSelected ? '#ffffff' : '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#334155',
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isSelected ? 'var(--brand-accent)' : '#0f172a',
                              }}
                            >
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.badge && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                          {isSelected && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              ↵
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>
              <kbd style={{ padding: '0.1rem 0.35rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px' }}>↑</kbd>{' '}
              <kbd style={{ padding: '0.1rem 0.35rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px' }}>↓</kbd> navigate
            </span>
            <span>
              <kbd style={{ padding: '0.1rem 0.35rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px' }}>↵</kbd> select
            </span>
            <span>
              <kbd style={{ padding: '0.1rem 0.35rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '3px' }}>esc</kbd> close
            </span>
          </div>

          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            heptley Spotlight
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes paletteFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
