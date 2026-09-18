'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { SalesMember } from '@/types';
import { Card, Table, Badge, Button, Input, Select, ConfirmDialog } from '@/components/ui';
import AddSalesMemberModal from './AddSalesMemberModal';
import EditSalesMemberModal from './EditSalesMemberModal';
import { Search, UserPlus, Edit2, Power, Eye, Users } from 'lucide-react';

export default function SalesMembersView() {
  const {
    salesMembers,
    customers,
    leads,
    followUps,
    setIsAddMemberModalOpen,
    setEditingMember,
    toggleSalesMemberStatus,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<SalesMember | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [viewingDetailsMember, setViewingDetailsMember] = useState<SalesMember | null>(null);

  // Filtered members
  const filteredMembers = salesMembers.filter((m) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.memberId.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleClick = (member: SalesMember) => {
    setSelectedMemberForAction(member);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (selectedMemberForAction) {
      await toggleSalesMemberStatus(selectedMemberForAction.id);
      setIsConfirmOpen(false);
      setSelectedMemberForAction(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
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
            Sales Members
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage sales team members and view their performance.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus size={15} />}
          onClick={() => setIsAddMemberModalOpen(true)}
        >
          Add Sales Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '420px' }}>
            <Input
              placeholder="Search by name, email, or ID (e.g. SM-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              containerClassName="mb-0"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              containerClassName="mb-0"
              style={{ minWidth: '150px' }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Active', label: 'Active Only' },
                { value: 'Inactive', label: 'Inactive Only' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Sales Members Table */}
      <Card noPadding>
        <Table
          columns={[
            {
              key: 'memberId',
              header: 'Member ID',
              width: '120px',
              render: (m) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-primary)' }}>
                  {m.memberId}
                </span>
              ),
            },
            {
              key: 'name',
              header: 'Name',
              render: (m) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>,
            },
            {
              key: 'contact',
              header: 'Email & Phone',
              render: (m) => (
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: 'var(--text-primary)' }}>{m.email}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{m.phone}</div>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              width: '110px',
              render: (m) => (
                <Badge variant={m.status === 'Active' ? 'active' : 'neutral'}>
                  {m.status}
                </Badge>
              ),
            },
            {
              key: 'customers',
              header: 'Assigned Customers',
              width: '150px',
              render: (m) => {
                const count = customers.filter((c) => c.salesMemberId === m.memberId).length;
                return (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {count} Accounts
                  </span>
                );
              },
            },
            {
              key: 'openLeads',
              header: 'Open Leads',
              width: '110px',
              render: (m) => {
                const count = leads.filter(
                  (l) => l.assignedSalesMemberId === m.memberId && l.status !== 'Won' && l.status !== 'Lost'
                ).length;
                return (
                  <span style={{ fontWeight: 600, color: '#9333ea' }}>
                    {count}
                  </span>
                );
              },
            },
            {
              key: 'pendingFollowUps',
              header: 'Pending Follow-ups',
              width: '140px',
              render: (m) => {
                const count = followUps.filter(
                  (f) => f.assignedSalesMemberId === m.memberId && f.status !== 'Completed'
                ).length;
                return (
                  <span style={{ fontWeight: 600, color: count > 0 ? '#d97706' : 'var(--text-muted)' }}>
                    {count}
                  </span>
                );
              },
            },
            {
              key: 'actions',
              header: 'Actions',
              width: '160px',
              align: 'right',
              render: (m) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <button
                    onClick={() => setViewingDetailsMember(m)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    title="View Performance & Profile"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => setEditingMember(m)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    title="Edit Member"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleToggleClick(m)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    style={{ color: m.status === 'Active' ? '#dc2626' : '#16a34a' }}
                    title={m.status === 'Active' ? 'Deactivate Member' : 'Activate Member'}
                  >
                    <Power size={15} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredMembers}
          keyExtractor={(m) => m.id}
          emptyMessage="No sales members match the selected search or filter."
        />
      </Card>

      {/* Member Performance & Details Modal */}
      {viewingDetailsMember && (
        <ConfirmDialog
          isOpen={!!viewingDetailsMember}
          onClose={() => setViewingDetailsMember(null)}
          onConfirm={() => setViewingDetailsMember(null)}
          title={`Sales Member Performance: ${viewingDetailsMember.name}`}
          message={`ID: ${viewingDetailsMember.memberId} | Email: ${viewingDetailsMember.email} | Phone: ${viewingDetailsMember.phone} | Status: ${viewingDetailsMember.status} | Active Customers: ${customers.filter(c => c.salesMemberId === viewingDetailsMember.memberId).length} | Open Leads: ${leads.filter(l => l.assignedSalesMemberId === viewingDetailsMember.memberId && l.status !== 'Won' && l.status !== 'Lost').length} | Joined: ${viewingDetailsMember.joiningDate}`}
          confirmLabel="Close"
          cancelLabel=""
          variant="primary"
        />
      )}

      {/* Deactivation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={
          selectedMemberForAction?.status === 'Active'
            ? `Deactivate ${selectedMemberForAction?.name}?`
            : `Reactivate ${selectedMemberForAction?.name}?`
        }
        message={
          selectedMemberForAction?.status === 'Active'
            ? `Deactivating ${selectedMemberForAction?.name} (${selectedMemberForAction?.memberId}) will suspend their portal access. Their assigned customer accounts will remain intact.`
            : `Reactivating ${selectedMemberForAction?.name} (${selectedMemberForAction?.memberId}) will restore their full CRM access.`
        }
        confirmLabel={selectedMemberForAction?.status === 'Active' ? 'Deactivate Account' : 'Reactivate'}
        variant={selectedMemberForAction?.status === 'Active' ? 'danger' : 'primary'}
      />
    </div>
  );
}
