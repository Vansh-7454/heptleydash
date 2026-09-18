'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Activity } from '@/types';
import { Card, Table, Badge, Button, Input, Select } from '@/components/ui';
import LogActivityModal from './LogActivityModal';
import {
  Activity as ActivityIcon,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

export default function ActivitiesView() {
  const {
    activities,
    myActivities,
    salesMembers,
    customers,
    role,
    setIsLogActivityModalOpen,
    setActiveAdminTab,
    setActiveSalesTab,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  const baseActivities = role === 'sales' ? myActivities : activities;

  const filteredActivities = baseActivities.filter((act) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      act.description.toLowerCase().includes(query) ||
      act.userName.toLowerCase().includes(query) ||
      (act.entityName && act.entityName.toLowerCase().includes(query)) ||
      (act.company && act.company.toLowerCase().includes(query));

    const matchesType = typeFilter === 'all' || act.type === typeFilter;
    const matchesUser = userFilter === 'all' || act.userName === userFilter;
    const matchesCustomer =
      customerFilter === 'all' ||
      act.entityId === customerFilter ||
      (act.entityName && act.entityName.toLowerCase().includes(customerFilter.toLowerCase()));

    return matchesSearch && matchesType && matchesUser && matchesCustomer;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone size={14} style={{ color: 'var(--brand-accent)' }} />;
      case 'Email':
        return <Mail size={14} style={{ color: '#2563eb' }} />;
      case 'Meeting':
        return <Calendar size={14} style={{ color: '#9333ea' }} />;
      case 'Note':
        return <FileText size={14} style={{ color: '#b45309' }} />;
      case 'Follow-up':
        return <Clock size={14} style={{ color: '#d97706' }} />;
      case 'Payment':
        return <CreditCard size={14} style={{ color: '#059669' }} />;
      default:
        return <RefreshCw size={14} style={{ color: 'var(--text-muted)' }} />;
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
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.25rem 0',
            }}
          >
            {role === 'sales' ? 'My Activities' : 'Activities'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            {role === 'sales'
              ? 'Record of your interactions, client calls, and portfolio events.'
              : 'Audit record of all team interactions and business events across Heptley.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={15} />}
          onClick={() => setIsLogActivityModalOpen(true)}
        >
          Log Activity
        </Button>
      </div>

      {/* Audit Trail Explanation Banner */}
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
          <strong>Business Audit Trail:</strong> This is a historical log of completed customer touchpoints, calls, emails, and transaction events. Looking for pending future tasks? Check the{' '}
          <button
            onClick={() => (role === 'admin' ? setActiveAdminTab('follow-ups') : setActiveSalesTab('follow-ups'))}
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
            Follow-ups Schedule
          </button>
          .
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: role === 'admin' ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Search activities or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
            containerClassName="mb-0"
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Activity Types' },
              { value: 'Call', label: 'Call' },
              { value: 'Email', label: 'Email' },
              { value: 'Meeting', label: 'Meeting' },
              { value: 'Note', label: 'Note' },
              { value: 'Follow-up', label: 'Follow-up' },
              { value: 'Payment', label: 'Payment' },
              { value: 'Status Change', label: 'Status Change' },
            ]}
          />

          <Select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Accounts' },
              ...Array.from(new Map(customers.map((c) => [c.id, c])).values()).map((c) => ({
                value: c.id,
                label: `${c.name} (${c.company})`,
              })),
            ]}
          />

          {role === 'admin' && (
            <Select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              containerClassName="mb-0"
              options={[
                { value: 'all', label: 'All Team Members' },
                ...Array.from(new Set(salesMembers.map((m) => m.name))).map((name) => ({
                  value: name,
                  label: name,
                })),
              ]}
            />
          )}
        </div>
      </Card>

      {/* Activities Table / Timeline */}
      <Card noPadding>
        <Table
          columns={[
            {
              key: 'timestamp',
              header: 'Date & Time',
              width: '180px',
              render: (act) => (
                <div style={{ fontSize: '0.8125rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Date(act.timestamp).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                  </div>
                </div>
              ),
            },
            {
              key: 'user',
              header: 'Team Member',
              width: '180px',
              render: (act) => (
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.userName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'capitalize' }}>
                    {act.userRole}
                  </span>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Activity Type',
              width: '150px',
              render: (act) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 500 }}>
                  {getActivityIcon(act.type)}
                  <span>{act.type}</span>
                </div>
              ),
            },
            {
              key: 'entity',
              header: 'Customer / Lead',
              width: '200px',
              render: (act) =>
                act.entityName ? (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                      {act.entityName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.company}</div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                ),
            },
            {
              key: 'description',
              header: 'Activity Details / Log',
              render: (act) => (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                  {act.description}
                </p>
              ),
            },
          ]}
          data={filteredActivities}
          keyExtractor={(act) => act.id}
          emptyMessage="No activities match the selected search criteria."
        />
      </Card>
    </div>
  );
}
