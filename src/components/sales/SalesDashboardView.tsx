'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import StatsCard from '@/components/common/StatsCard';
import SalesAddCustomerView from './SalesAddCustomerView';
import { Customer, CustomerContractStatus } from '@/types';
import {
  UserCheck,
  Briefcase,
  Search,
  CheckCircle2,
  Mail,
  Phone,
  UserPlus,
  Eye,
  Calendar,
  Clock,
  Building,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  TrendingUp,
  Download,
} from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

export default function SalesDashboardView() {
  const {
    currentSalesMember,
    myCustomers,
    myActiveCustomers,
    activeSalesTab,
    setActiveSalesTab,
    salesMembers,
    setCurrentSalesMember,
    setDetailedCustomerView,
    setEditingCustomer,
    deleteCustomer,
    showToast,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getAvatarStyle = (name: string) => {
    const styles = [
      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
      { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
      { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
      { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
      { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return styles[Math.abs(hash) % styles.length];
  };

  const filteredMyCustomers = myCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      customer.name.toLowerCase().includes(query) ||
      customer.company.toLowerCase().includes(query) ||
      customer.customerId.toLowerCase().includes(query) ||
      customer.service.toLowerCase().includes(query);

    const matchesStatus =
      selectedStatusFilter === 'all' || customer.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportSalesCustomers = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToCsv(
      `heptley_sales_portfolio_${today}`,
      filteredMyCustomers,
      [
        { key: 'customerId', label: 'Customer ID' },
        { key: 'name', label: 'Client Name' },
        { key: 'company', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'location', label: 'Location' },
        { key: 'service', label: 'Service' },
        { key: 'package', label: 'Package' },
        { key: 'status', label: 'Status' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
      ]
    );
    showToast(`Exported ${filteredMyCustomers.length} client accounts to CSV!`, 'success');
  };

  const getStatusBadge = (status: CustomerContractStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="badge badge-active">
            <CheckCircle2 size={10} />
            <span>Active</span>
          </span>
        );
      case 'Onboarding':
        return (
          <span className="badge badge-onboarding">
            <Clock size={10} />
            <span>Onboarding</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="badge badge-completed">
            <CheckCircle2 size={10} />
            <span>Completed</span>
          </span>
        );
      case 'On Hold':
        return (
          <span className="badge badge-hold">
            <Clock size={10} />
            <span>On Hold</span>
          </span>
        );
      case 'Cancelled':
      default:
        return <span className="badge badge-cancelled">Cancelled</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Personalized Greeting & Rep Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Role Avatar Icon */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.35rem',
              boxShadow: '0 4px 12px var(--brand-accent-glow)',
              flexShrink: 0,
            }}
          >
            <UserCheck size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                {getGreeting()},
              </span>
              <h1
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Sales Portal
              </h1>
              <span
                className="badge badge-role-sales"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                }}
              >
                <span>Sales Workspace</span>
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                <CheckCircle2 size={10} />
                <span>Active Role</span>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginTop: '0.35rem',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={13} style={{ color: 'var(--text-light)' }} />
                <span>Total Portfolio: <strong>{myCustomers.length} accounts</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                <span>Operating Engagements: <strong>{myActiveCustomers} clients</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportSalesCustomers}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Export portfolio to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setActiveSalesTab('add-customer')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserPlus size={14} />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Main View Based on Active Tab */}
      {activeSalesTab === 'add-customer' ? (
        <SalesAddCustomerView />
      ) : (
        <>
          {/* Overview Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <StatsCard
              title="Customer Accounts"
              value={myCustomers.length}
              subtitle="Active business client accounts"
              icon={<Briefcase size={20} />}
              badge={{ text: 'Accounts', type: 'neutral' }}
            />
            <StatsCard
              title="Active Engagements"
              value={myActiveCustomers}
              subtitle="Clients with in-progress service contracts"
              icon={<UserCheck size={20} />}
              badge={{ text: 'Operating', type: 'success' }}
            />
            <StatsCard
              title="Under Onboarding"
              value={`${myCustomers.filter((c) => c.status === 'Onboarding' || c.status === 'On Hold').length} Accounts`}
              subtitle="Accounts undergoing onboarding or review"
              icon={<TrendingUp size={20} />}
              badge={{ text: 'Onboarding', type: 'accent' }}
            />
          </div>

          {/* My Customers Table Card */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
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
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  Customer Accounts & Engagements
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Manage client accounts, track service engagements, and review contract status
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    minWidth: '220px',
                  }}
                >
                  <Search size={15} style={{ color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    placeholder="Search my clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      width: '100%',
                    }}
                  />
                </div>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="form-select"
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8125rem',
                    width: 'auto',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Table or Empty State */}
            <div className="table-container" style={{ border: 'none' }}>
              {filteredMyCustomers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Briefcase size={22} />
                  </div>
                  <div className="empty-state-title">No client accounts found</div>
                  <p className="empty-state-desc">
                    {searchQuery || selectedStatusFilter !== 'all'
                      ? 'No client accounts match your filter criteria.'
                      : 'No customer accounts are currently registered in your sales pipeline.'}
                  </p>
                  <button
                    onClick={() => setActiveSalesTab('add-customer')}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '1rem' }}
                  >
                    <UserPlus size={14} />
                    <span>+ Add First Customer</span>
                  </button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Company</th>
                      <th>Service & Package</th>
                      <th>Contract Timeline</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMyCustomers.map((customer) => (
                      <tr key={customer.id}>
                        {/* Customer Avatar & Name & ID */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {(() => {
                              const av = getAvatarStyle(customer.company || customer.name);
                              return (
                                <div
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    backgroundColor: av.bg,
                                    color: av.text,
                                    border: `1px solid ${av.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    flexShrink: 0,
                                  }}
                                >
                                  {customer.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </div>
                              );
                            })()}
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {customer.name}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {customer.customerId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                            {customer.company}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {customer.location || 'India'}
                          </div>
                        </td>

                        {/* Service & Tier */}
                        <td>
                          <div>
                            <span
                              style={{
                                fontSize: '0.8125rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                fontWeight: 500,
                              }}
                            >
                              {customer.service}
                            </span>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {customer.package}
                            </div>
                          </div>
                        </td>

                        {/* Contract Timeline */}
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              fontSize: '0.775rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <span>{customer.startDate}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                              to {customer.endDate}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>{getStatusBadge(customer.status as CustomerContractStatus)}</td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '0.4rem',
                              position: 'relative',
                            }}
                          >
                            <button
                              onClick={() => setDetailedCustomerView(customer)}
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              title="View full customer file"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>

                            {/* Three-dot dropdown menu */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === customer.id ? null : customer.id);
                              }}
                              className="action-menu-btn"
                              title="More options"
                            >
                              <MoreVertical size={15} />
                            </button>

                            {activeMenuId === customer.id && (
                              <div
                                className="action-menu-dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="action-menu-item"
                                  onClick={() => {
                                    setDetailedCustomerView(customer);
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>View Record</span>
                                </button>
                                <button
                                  className="action-menu-item"
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <Edit2 size={14} />
                                  <span>Edit Customer</span>
                                </button>
                                <button
                                  className="action-menu-item danger"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to delete ${customer.name} (${customer.customerId})?`
                                      )
                                    ) {
                                      deleteCustomer(customer.customerId);
                                    }
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Customer</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
