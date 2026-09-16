'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { CustomerContractStatus } from '@/types';
import {
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  Briefcase,
  User,
  Download,
} from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

export default function CustomersView() {
  const {
    customers,
    salesMembers,
    setIsAddCustomerModalOpen,
    setDetailedCustomerView,
    setEditingCustomer,
    deleteCustomer,
    showToast,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepFilter, setSelectedRepFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      customer.name.toLowerCase().includes(query) ||
      customer.company.toLowerCase().includes(query) ||
      customer.customerId.toLowerCase().includes(query) ||
      customer.service.toLowerCase().includes(query);

    const matchesRep =
      selectedRepFilter === 'all' || customer.salesMemberId === selectedRepFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' || customer.status === selectedStatusFilter;

    return matchesSearch && matchesRep && matchesStatus;
  });

  const handleExportCustomers = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToCsv(
      `heptley_customers_${today}`,
      filteredCustomers,
      [
        { key: 'customerId', label: 'Customer ID' },
        { key: 'name', label: 'Client Name' },
        { key: 'company', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'location', label: 'Location' },
        { key: 'service', label: 'Service' },
        { key: 'package', label: 'Package Tier' },
        { key: 'status', label: 'Contract Status' },
        { key: 'salesMemberName', label: 'Assigned Member' },
        { key: 'startDate', label: 'Contract Start' },
        { key: 'endDate', label: 'Contract End' },
        { key: 'leadSource', label: 'Lead Source' },
      ]
    );
    showToast(`Exported ${filteredCustomers.length} customer records to CSV!`, 'success');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Customers
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Manage all customers and their assigned sales members.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportCustomers}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Export filtered customers to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setIsAddCustomerModalOpen(true)} className="btn btn-primary">
            <UserPlus size={16} />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Status, Sales Member Filter */}
      <div
        className="card"
        style={{
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.875rem',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            flex: 1,
            minWidth: '220px',
            maxWidth: '340px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search customers, company, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Status:
            </span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="form-select"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', width: 'auto' }}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sales Member Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Rep:
            </span>
            <select
              value={selectedRepFilter}
              onChange={(e) => setSelectedRepFilter(e.target.value)}
              className="form-select"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', width: 'auto' }}
            >
              <option value="all">All Sales Members</option>
              {salesMembers.map((sm) => (
                <option key={sm.id} value={sm.memberId}>
                  {sm.name} ({sm.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Briefcase size={22} />
            </div>
            <div className="empty-state-title">No customers found</div>
            <p className="empty-state-desc">
              {searchQuery || selectedRepFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'No client accounts match your current filter criteria.'
                : 'Get started by adding your first customer.'}
            </p>
            {!(searchQuery || selectedRepFilter !== 'all' || selectedStatusFilter !== 'all') && (
              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                <UserPlus size={14} />
                <span>+ Add Customer</span>
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Service</th>
                <th>Sales Member</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const isMenuOpen = activeMenuId === customer.id;

                return (
                  <tr
                    key={customer.id}
                    onClick={() => setDetailedCustomerView(customer)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Customer Column: Avatar + Name + ID */}
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
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                            {customer.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {customer.customerId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{customer.company}</span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.775rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 500,
                        }}
                      >
                        {customer.service}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}>
                        <User size={13} style={{ color: 'var(--brand-accent)' }} />
                        <span>{customer.salesMemberName}</span>
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {customer.startDate}
                    </td>

                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {customer.endDate}
                    </td>

                    <td>{getStatusBadge(customer.status)}</td>

                    {/* Actions: Direct View Button + Three Dot Menu */}
                    <td
                      style={{ textAlign: 'right', position: 'relative' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          onClick={() => setDetailedCustomerView(customer)}
                          className="btn btn-outline btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.78rem',
                          }}
                          title="Open full customer details"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : customer.id)}
                          className="btn-subtle"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
                          aria-label="More Actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {isMenuOpen && (
                        <div className="dropdown-menu" style={{ top: '100%', right: 0 }}>
                          <button
                            onClick={() => {
                              setDetailedCustomerView(customer);
                              setActiveMenuId(null);
                            }}
                            className="dropdown-item"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setActiveMenuId(null);
                            }}
                            className="dropdown-item"
                          >
                            <Edit2 size={14} />
                            <span>Edit Customer</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove ${customer.name} from directory?`)) {
                                deleteCustomer(customer.customerId);
                              }
                              setActiveMenuId(null);
                            }}
                            className="dropdown-item dropdown-item-danger"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
