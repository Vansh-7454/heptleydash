'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Trash2,
  Search,
  Mail,
  Phone,
  Eye,
  Edit2,
  Power,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Users,
} from 'lucide-react';

export default function SalesMembersView() {
  const {
    salesMembers,
    customers,
    deleteSalesMember,
    setViewingSalesMember,
    setEditingSalesMember,
    toggleSalesMemberStatus,
    setCurrentSalesMember,
    setRole,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close three-dot menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredMembers = salesMembers.filter((member) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.memberId.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Sales Members
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Manage your sales team and customer assignments.
          </p>
        </div>

      </div>

      {/* Toolbar: Search and Status Filter */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            flex: 1,
            minWidth: '220px',
            maxWidth: '380px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search member, email, or ID..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Inactive')}
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', width: 'auto' }}
          >
            <option value="all">All Statuses ({salesMembers.length})</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={22} />
            </div>
            <div className="empty-state-title">No sales members found</div>
            <p className="empty-state-desc">
              No sales team representatives match your criteria.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ textAlign: 'center' }}>Customers</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const customerCount = customers.filter(
                  (c) => c.salesMemberId === member.memberId
                ).length;
                const isMenuOpen = activeMenuId === member.id;

                return (
                  <tr key={member.id}>
                    {/* Member Column: Avatar + Name + Subtitle SM-00X */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                            {member.name}
                          </span>
                          <span style={{ fontSize: '0.725rem', fontFamily: 'monospace', color: 'var(--brand-accent)', fontWeight: 600 }}>
                            {member.memberId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8125rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {member.memberId}
                      </span>
                    </td>

                    {/* Email */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Mail size={13} style={{ color: 'var(--text-light)' }} />
                        <span>{member.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Phone size={13} style={{ color: 'var(--text-light)' }} />
                        <span>{member.phone}</span>
                      </div>
                    </td>

                    {/* Customers Count */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: '28px',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          color: 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        {customerCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge ${
                          member.status === 'Active' ? 'badge-active' : 'badge-inactive'
                        }`}
                      >
                        {member.status === 'Active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {member.status}
                      </span>
                    </td>

                    {/* Actions: Clean Three-Dot Menu */}
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'inline-block' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : member.id);
                          }}
                          className="btn-subtle"
                          style={{
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-muted)',
                          }}
                          aria-label="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="dropdown-menu"
                            style={{ top: '100%', right: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setViewingSalesMember(member);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                            >
                              <Eye size={14} />
                              <span>View Profile</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingSalesMember(member);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                            >
                              <Edit2 size={14} />
                              <span>Edit Member</span>
                            </button>

                            <button
                              onClick={() => {
                                toggleSalesMemberStatus(member.memberId);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                              style={{ color: member.status === 'Active' ? '#f59e0b' : '#16a34a' }}
                            >
                              <Power size={14} />
                              <span>{member.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to remove sales member ${member.name} (${member.memberId})?`
                                  )
                                ) {
                                  deleteSalesMember(member.memberId);
                                }
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item dropdown-item-danger"
                              style={{ color: '#dc2626' }}
                            >
                              <Trash2 size={14} />
                              <span>Remove Member</span>
                            </button>
                          </div>
                        )}
                      </div>
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
