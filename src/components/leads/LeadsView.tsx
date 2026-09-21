'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Lead, LeadStatus } from '@/types';
import { Card, Table, Badge, Button, Input, Select, ConfirmDialog } from '@/components/ui';
import { Search, Plus, Edit2, Eye, Target, UserCheck } from 'lucide-react';
import ConvertLeadModal from './ConvertLeadModal';
import LeadDetailsModal from './LeadDetailsModal';

export default function LeadsView() {
  const {
    leads,
    myLeads,
    role,
    setIsAddLeadModalOpen,
    setEditingLead,
    editLead,
    convertingLead,
    setConvertingLead,
    showToast,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const baseList = role === 'sales' ? myLeads : leads;

  const filteredLeads = baseList.filter((l) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      l.name.toLowerCase().includes(query) ||
      l.company.toLowerCase().includes(query) ||
      l.leadId.toLowerCase().includes(query) ||
      l.interestedService.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Won':
        return 'active';
      case 'Qualified':
        return 'info';
      case 'Proposal':
        return 'proposal';
      case 'Contacted':
        return 'warning';
      case 'Lost':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const NEXT_STAGE_MAP: Record<LeadStatus, LeadStatus | null> = {
    New: 'Contacted',
    Contacted: 'Qualified',
    Qualified: 'Proposal',
    Proposal: 'Won',
    Won: null,
    Lost: null,
  };

  const handleAdvanceStage = async (lead: Lead) => {
    const next = NEXT_STAGE_MAP[lead.status];
    if (!next) return;
    await editLead(lead.id, { status: next });
    showToast(`Lead ${lead.name} moved to stage: ${next}`, 'success');
  };

  const handleConvertLead = (lead: Lead) => {
    setConvertingLead(lead);
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
            {role === 'sales' ? 'My Leads' : 'Leads'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage potential customers and move them through the sales process.
          </p>
        </div>

        {role !== 'admin' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={() => setIsAddLeadModalOpen(true)}
          >
            Add Inbound Lead
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
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
              placeholder="Search by prospect, company, ID, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              containerClassName="mb-0"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              containerClassName="mb-0"
              style={{ minWidth: '180px' }}
              options={[
                { value: 'all', label: 'All Lead Stages' },
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Proposal', label: 'Proposal' },
                { value: 'Won', label: 'Won (Converted)' },
                { value: 'Lost', label: 'Lost' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card noPadding>
        <Table
          columns={[
            {
              key: 'leadId',
              header: 'Lead ID',
              width: '110px',
              render: (l) => (
                <span className="table-id-tag">
                  {l.leadId}
                </span>
              ),
            },
            {
              key: 'name',
              header: 'Lead Name',
              render: (l) => (
                <div>
                  <div className="table-cell-title">{l.name}</div>
                  <div className="table-cell-subtitle">{l.email || l.phone}</div>
                </div>
              ),
            },
            {
              key: 'company',
              header: 'Company Name',
              render: (l) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{l.company}</span>,
            },
            {
              key: 'service',
              header: 'Service Interested',
              render: (l) => <span style={{ fontSize: '0.8125rem' }}>{l.interestedService}</span>,
            },
            {
              key: 'source',
              header: 'Source',
              render: (l) => (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{l.source}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              width: '120px',
              render: (l) => (
                <Badge variant={getStatusBadgeVariant(l.status)}>
                  {l.status}
                </Badge>
              ),
            },
            {
              key: 'assignedMember',
              header: 'Sales Member',
              render: (l) => (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {l.assignedSalesMemberName}
                </span>
              ),
            },
            {
              key: 'followUpDates',
              header: 'Last Contact / Next Task',
              width: '150px',
              render: (l) => (
                <div style={{ fontSize: '0.75rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Last: {l.lastContactDate || 'Never'}
                  </div>
                  <div style={{ color: l.nextFollowUpDate ? 'var(--brand-accent)' : 'var(--text-light)', fontWeight: 500 }}>
                    Next: {l.nextFollowUpDate || 'None'}
                  </div>
                </div>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              width: '180px',
              align: 'right',
              render: (l) => {
                const next = NEXT_STAGE_MAP[l.status];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    {l.isConverted || l.convertedCustomerId ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', backgroundColor: '#d1fae5', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                        Client: {l.convertedCustomerId}
                      </span>
                    ) : (
                      <>
                        {next && (
                          <button
                            onClick={() => handleAdvanceStage(l)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                            title={`Advance to ${next}`}
                          >
                            → {next}
                          </button>
                        )}
                        {role !== 'admin' && (l.status === 'Qualified' || l.status === 'Proposal' || l.status === 'Won') && (
                          <button
                            onClick={() => setConvertingLead(l)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', gap: '0.25rem' }}
                            title="Convert Lead to Customer Account"
                          >
                            <UserCheck size={12} />
                            <span>Convert</span>
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setViewingLead(l)}
                      className="btn btn-ghost btn-sm btn-icon-only"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => setEditingLead(l)}
                      className="btn btn-ghost btn-sm btn-icon-only"
                      title="Edit Lead"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={filteredLeads}
          keyExtractor={(l) => l.id}
          emptyMessage="No leads found for the selected criteria."
        />
      </Card>

      {/* Convert Lead to Customer Modal */}
      <ConvertLeadModal
        lead={convertingLead}
        isOpen={!!convertingLead}
        onClose={() => setConvertingLead(null)}
      />

      {/* Lead Details & AI Qualification Modal */}
      <LeadDetailsModal
        lead={viewingLead}
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        onAdvanceStage={handleAdvanceStage}
        onConvert={handleConvertLead}
      />
    </div>
  );
}
