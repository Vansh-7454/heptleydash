'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { FollowUp } from '@/types';
import { Card, Table, Badge, Button, Tabs, ConfirmDialog, Select } from '@/components/ui';
import {
  Clock,
  Plus,
  Phone,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export default function FollowUpsView() {
  const {
    followUps,
    myFollowUps,
    salesMembers,
    role,
    setIsAddFollowUpModalOpen,
    setEditingFollowUp,
    markFollowUpComplete,
    cancelFollowUp,
    deleteFollowUp,
    setActiveAdminTab,
    setActiveSalesTab,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [repFilter, setRepFilter] = useState('all');
  const [deletingItem, setDeletingItem] = useState<FollowUp | null>(null);

  const baseList = role === 'sales' ? myFollowUps : followUps;
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredByRep = baseList.filter(
    (f) => repFilter === 'all' || f.assignedSalesMemberId === repFilter
  );

  const todayList = filteredByRep.filter((f) => f.date === todayStr && f.status !== 'Completed');
  const upcomingList = filteredByRep.filter((f) => f.date > todayStr && f.status !== 'Completed');
  const overdueList = filteredByRep.filter(
    (f) => (f.date < todayStr || f.status === 'Overdue') && f.status !== 'Completed'
  );
  const completedList = filteredByRep.filter((f) => f.status === 'Completed');

  const currentList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'overdue'
      ? overdueList
      : completedList;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone size={14} style={{ color: 'var(--brand-accent)' }} />;
      case 'Meeting':
        return <Calendar size={14} style={{ color: '#9333ea' }} />;
      case 'Email':
        return <Mail size={14} style={{ color: '#2563eb' }} />;
      case 'WhatsApp':
        return <MessageSquare size={14} style={{ color: '#16a34a' }} />;
      default:
        return <Clock size={14} style={{ color: 'var(--text-muted)' }} />;
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
            Follow-ups
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Scheduled tasks and actions that need to happen.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={15} />}
          onClick={() => setIsAddFollowUpModalOpen(true)}
        >
          Create Follow-up
        </Button>
      </div>

      {/* Distinction Banner: Follow-up vs Activity */}
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
          <strong>Follow-up vs Activity:</strong> A <em>Follow-up</em> is a future or pending task that needs to happen (e.g., scheduled client call, consultation review). An <em>Activity</em> is a record of what has already taken place. View historical logs in the{' '}
          <button
            onClick={() => (role === 'admin' ? setActiveAdminTab('activities') : setActiveSalesTab('activities'))}
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
            Activity Timeline
          </button>
          .
        </div>
      </div>

      {/* Tabs & Admin Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Tabs
          tabs={[
            { id: 'today', label: 'Due Today', count: todayList.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingList.length },
            { id: 'overdue', label: 'Overdue Attention', count: overdueList.length },
            { id: 'completed', label: 'Completed History', count: completedList.length },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as any)}
        />

        {role === 'admin' && (
          <div style={{ minWidth: '200px' }}>
            <Select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              containerClassName="mb-0"
              options={[
                { value: 'all', label: 'All Sales Members' },
                ...salesMembers.map((m) => ({ value: m.memberId, label: m.name })),
              ]}
            />
          </div>
        )}
      </div>

      {/* Follow-ups Table */}
      <Card noPadding>
        <Table
          columns={[
            {
              key: 'schedule',
              header: 'Scheduled Date & Time',
              width: '160px',
              render: (f) => (
                <div style={{ fontSize: '0.8125rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.date}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.time} IST</div>
                </div>
              ),
            },
            {
              key: 'entity',
              header: 'Customer / Lead Name',
              render: (f) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {f.entityName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Type: <span style={{ textTransform: 'capitalize' }}>{f.entityType}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'company',
              header: 'Company',
              render: (f) => <span style={{ fontWeight: 500 }}>{f.company}</span>,
            },
            {
              key: 'purpose',
              header: 'Purpose / Note',
              render: (f) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{f.title}</div>
                  {f.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>"{f.note}"</div>}
                </div>
              ),
            },
            {
              key: 'assigned',
              header: 'Assigned Sales Member',
              render: (f) => (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {f.assignedSalesMemberName}
                </span>
              ),
            },
            {
              key: 'type',
              header: 'Type',
              width: '120px',
              render: (f) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                  {getTypeIcon(f.type)}
                  <span>{f.type}</span>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              width: '120px',
              render: (f) => (
                <Badge
                  variant={
                    f.status === 'Completed'
                      ? 'active'
                      : f.status === 'Overdue'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {f.status}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              width: '180px',
              align: 'right',
              render: (f) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  {f.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => markFollowUpComplete(f.id)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', color: '#16a34a', borderColor: '#bbf7d0' }}
                        title="Mark Completed"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => cancelFollowUp(f.id)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', color: '#64748b', borderColor: '#cbd5e1' }}
                        title="Cancel Touchpoint"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setEditingFollowUp(f)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    title="Reschedule / Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingItem(f)}
                    className="btn btn-ghost btn-sm btn-icon-only"
                    style={{ color: '#dc2626' }}
                    title="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ),
            },
          ]}
          data={currentList}
          keyExtractor={(f) => f.id}
          emptyMessage={`No follow-ups found in the "${activeTab}" category.`}
        />
      </Card>

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={async () => {
            if (deletingItem) {
              await deleteFollowUp(deletingItem.id);
              setDeletingItem(null);
            }
          }}
          title="Remove Follow-up?"
          message={`Are you sure you want to remove the follow-up "${deletingItem?.title}"?`}
          confirmLabel="Remove Item"
          variant="danger"
        />
      )}
    </div>
  );
}
