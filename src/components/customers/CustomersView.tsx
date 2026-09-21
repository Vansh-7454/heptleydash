'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Customer } from '@/types';
import { Card, Table, Badge, Button, Input, Select } from '@/components/ui';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import { Search, Plus, Eye, Edit2, FileSpreadsheet } from 'lucide-react';
import { exportCustomersToExcel } from '@/utils/exportExcel';

export default function CustomersView() {
  const {
    customers,
    myCustomers,
    salesMembers,
    userProfile,
    role,
    setIsAddCustomerModalOpen,
    setDetailedCustomerView,
    setEditingCustomer,
    setActiveAdminTab,
    setActiveSalesTab,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [repFilter, setRepFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'value'>('date');

  // View Scope: Sales sees and exports their personal assigned accounts by default; Admin sees full company directory
  const [viewScope, setViewScope] = useState<'mine' | 'all'>('mine');
  const baseList = (role === 'sales' && viewScope === 'mine') ? myCustomers : customers;

  // Filter and Sort
  const filteredCustomers = baseList
    .filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.customerId.toLowerCase().includes(query) ||
        c.service.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesService = serviceFilter === 'all' || c.service === serviceFilter;
      const matchesRep = repFilter === 'all' || c.salesMemberId === repFilter;

      return matchesSearch && matchesStatus && matchesService && matchesRep;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'value') return b.finalAmount - a.finalAmount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const fileDate = new Date().toISOString().split('T')[0];
      const filename = role === 'sales'
        ? (viewScope === 'all'
            ? `heptley_all_customers_${fileDate}.xlsx`
            : `heptley_${(userProfile?.name || 'sales').replace(/\s+/g, '_')}_assigned_customers_${fileDate}.xlsx`)
        : `heptley_master_customers_${fileDate}.xlsx`;
      await exportCustomersToExcel(filteredCustomers, role || 'sales', filename);
    } catch (err) {
      console.error('Failed to export Excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Customers
            </h2>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#0284c7',
                backgroundColor: '#f0f9ff',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid #bae6fd',
              }}
            >
              {role === 'sales'
                ? (viewScope === 'mine' ? `${myCustomers.length} assigned to me` : `${customers.length} total directory`)
                : `${customers.length} total`}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            {role === 'sales'
              ? 'Manage and track your personal assigned client accounts and active contracts.'
              : 'Manage customers currently being handled by heptley.'}
          </p>
        </div>

        {role === 'sales' && (
          <div
            style={{
              display: 'inline-flex',
              gap: '0.35rem',
              backgroundColor: '#f1f5f9',
              padding: '0.25rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => setViewScope('mine')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewScope === 'mine' ? '#ffffff' : 'transparent',
                color: viewScope === 'mine' ? '#0284c7' : '#64748b',
                boxShadow: viewScope === 'mine' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              My Assigned ({myCustomers.length})
            </button>
            <button
              onClick={() => setViewScope('all')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewScope === 'all' ? '#ffffff' : 'transparent',
                color: viewScope === 'all' ? '#0284c7' : '#64748b',
                boxShadow: viewScope === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              All Directory ({customers.length})
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet size={16} style={{ color: '#059669' }} />}
            onClick={handleExportExcel}
            isLoading={isExportingExcel}
            style={{
              fontWeight: 700,
              borderColor: '#34d399',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              boxShadow: '0 1px 4px rgba(16, 185, 129, 0.15)',
            }}
          >
            {role === 'sales' ? (viewScope === 'mine' ? 'Export My Customers (.xlsx)' : 'Export Directory (.xlsx)') : 'Export Master Excel (.xlsx)'}
          </Button>

          {role !== 'admin' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => setIsAddCustomerModalOpen(true)}
            >
              New Customer
            </Button>
          )}
        </div>
      </div>

      {/* Customer vs Lead Distinction Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: '#1e40af',
        }}
      >
        <span style={{ fontSize: '1rem' }}>📌</span>
        <div>
          <strong>Customer Account vs Lead:</strong> A <em>Customer</em> is an active client who has already signed or purchased an ongoing service with heptley. Prospective deals and qualified opportunities belong in the{' '}
          <button
            onClick={() => (role === 'admin' ? setActiveAdminTab('leads') : setActiveSalesTab('my-leads'))}
            style={{
              color: '#1d4ed8',
              fontWeight: 600,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Leads Pipeline
          </button>
          .
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: role === 'admin' ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Search by customer, company, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
            containerClassName="mb-0"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Onboarding', label: 'Onboarding' },
              { value: 'Completed', label: 'Completed' },
              { value: 'On Hold', label: 'On Hold' },
            ]}
          />

          <Select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Services' },
              { value: 'Website Development', label: 'Website Development' },
              { value: 'UI/UX Redesign', label: 'UI/UX Redesign' },
              { value: 'Cloud Modernization', label: 'Cloud Modernization' },
              { value: 'Mobile Web Portal', label: 'Mobile Web Portal' },
              { value: 'E-Commerce Platform', label: 'E-Commerce Platform' },
              { value: 'Fintech Security Portal', label: 'Fintech Security Portal' },
            ]}
          />

          <Select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Sales Members' },
              ...salesMembers.map((m) => ({ value: m.memberId, label: m.name })),
            ]}
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            containerClassName="mb-0"
            options={[
              { value: 'date', label: 'Sort by: Newest' },
              { value: 'name', label: 'Sort by: Name' },
              ...(role === 'admin' ? [{ value: 'value', label: 'Sort by: Deal Value' }] : []),
            ]}
          />
        </div>
      </Card>

      {/* Customers Table */}
      <Card noPadding>
        <Table
          columns={[
            {
              key: 'customerId',
              header: 'Customer ID',
              width: '120px',
              render: (c) => (
                <span className="table-id-tag">
                  {c.customerId}
                </span>
              ),
            },
            {
              key: 'customer',
              header: 'Customer Name',
              render: (c) => (
                <div>
                  <div className="table-cell-title">{c.name}</div>
                  <div className="table-cell-subtitle">{c.email}</div>
                </div>
              ),
            },
            {
              key: 'company',
              header: 'Company Name',
              render: (c) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{c.company}</span>,
            },
            {
              key: 'service',
              header: 'Service',
              render: (c) => (
                <div>
                  <div className="table-cell-title" style={{ fontSize: '0.82rem' }}>{c.service}</div>
                  <div className="table-cell-subtitle">{c.package}</div>
                </div>
              ),
            },
            {
              key: 'salesMember',
              header: 'Sales Member',
              render: (c) => (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {c.salesMemberName}
                </span>
              ),
            },
            {
              key: 'projectStatus',
              header: 'Project Status',
              width: '125px',
              render: (c) => (
                <Badge
                  variant={
                    c.projectStatus === 'Completed'
                      ? 'active'
                      : c.projectStatus === 'In Progress'
                      ? 'info'
                      : 'warning'
                  }
                >
                  {c.projectStatus}
                </Badge>
              ),
            },
            {
              key: 'status',
              header: 'Contract Status',
              width: '125px',
              render: (c) => (
                <Badge
                  variant={
                    c.status === 'Active'
                      ? 'active'
                      : c.status === 'Completed'
                      ? 'neutral'
                      : c.status === 'On Hold'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {c.status}
                </Badge>
              ),
            },
            ...(role === 'admin'
              ? [
                  {
                    key: 'financials',
                    header: 'Total / Paid / Remaining',
                    width: '180px',
                    render: (c: any) => (
                      <div style={{ fontSize: '0.78rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          Total: ₹{c.finalAmount.toLocaleString('en-IN')}
                        </div>
                        <div style={{ color: '#059669', fontSize: '0.72rem' }}>
                          Paid: ₹{c.amountPaid.toLocaleString('en-IN')}
                        </div>
                        <div style={{ color: c.remainingAmount > 0 ? '#d97706' : 'var(--text-muted)', fontSize: '0.72rem' }}>
                          Rem: ₹{c.remainingAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ),
                  },
                ]
              : []),
            {
              key: 'actions',
              header: 'Actions',
              width: '100px',
              align: 'right',
              render: (c) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  <button
                    onClick={() => setDetailedCustomerView(c)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    title="View Account Details"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => setEditingCustomer(c)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    title="Edit Customer"
                  >
                    <Edit2 size={15} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredCustomers}
          keyExtractor={(c) => c.id}
          emptyMessage="No customer accounts match the selected criteria."
        />
      </Card>
    </div>
  );
}
