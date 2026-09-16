'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { ClientProject, ProjectStage } from '@/types';
import {
  Plus,
  Search,
  ArrowRight,
  ArrowLeft,
  Building,
  User,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  FolderKanban,
  CheckSquare,
  Activity,
  AlertCircle,
  Download,
  List,
  LayoutGrid,
  ExternalLink,
} from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

interface StageColumn {
  id: ProjectStage;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STAGES: StageColumn[] = [
  {
    id: 'discovery',
    label: 'Discovery & Scoping',
    sublabel: 'Requirements & Architecture',
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  {
    id: 'in_progress',
    label: 'In Execution',
    sublabel: 'Active Sprint & Engineering',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  {
    id: 'review',
    label: 'Quality Review',
    sublabel: 'QA Testing & Peer Audit',
    color: '#6366f1',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  {
    id: 'approval',
    label: 'Client Approval',
    sublabel: 'Staging Demo & Sign-off',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  {
    id: 'delivered',
    label: 'Delivered & Live',
    sublabel: 'Completed & Operational',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
];

export default function ProjectsKanbanView() {
  const {
    projects,
    customers,
    setDetailedCustomerView,
    updateProjectStage,
    deleteProject,
    setIsAddProjectModalOpen,
    role,
    salesMembers,
    showToast,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const handleOpenClientDetails = (clientName: string) => {
    const matched = customers.find(
      (c) =>
        c.company.toLowerCase().includes(clientName.toLowerCase()) ||
        c.name.toLowerCase().includes(clientName.toLowerCase()) ||
        clientName.toLowerCase().includes(c.company.toLowerCase()) ||
        clientName.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matched) {
      setDetailedCustomerView(matched);
    } else {
      showToast(`Customer account for "${clientName}" not found in directory`, 'info');
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.clientName.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      project.projectId.toLowerCase().includes(query);

    const matchesMember =
      selectedMember === 'all' || project.assignedMemberId === selectedMember;

    const matchesPriority =
      selectedPriority === 'all' || project.priority.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesMember && matchesPriority;
  });

  const handleExportProjects = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToCsv(
      `heptley_projects_${today}`,
      filteredProjects,
      [
        { key: 'projectId', label: 'Project ID' },
        { key: 'title', label: 'Project Title' },
        { key: 'clientName', label: 'Client Organization' },
        { key: 'category', label: 'Service Category' },
        { key: 'stage', label: 'Delivery Stage' },
        { key: 'priority', label: 'Priority' },
        { key: 'progress', label: 'Progress (%)' },
        { key: 'dueDate', label: 'Target Delivery Date' },
        { key: 'assignedMemberName', label: 'Allocated Team Member' },
        { key: 'description', label: 'Scope Notes' },
      ]
    );
    showToast(`Exported ${filteredProjects.length} project deliverables to CSV!`, 'success');
  };

  // Calculate Operational Metrics (Zero currency, pure delivery KPIs)
  const activeProjectsCount = projects.filter((p) => p.stage !== 'delivered').length;
  const inExecutionCount = projects.filter((p) => p.stage === 'in_progress').length;
  const underReviewCount = projects.filter(
    (p) => p.stage === 'review' || p.stage === 'approval'
  ).length;
  const deliveredCount = projects.filter((p) => p.stage === 'delivered').length;

  const avgProgress = activeProjectsCount > 0
    ? Math.round(
        projects
          .filter((p) => p.stage !== 'delivered')
          .reduce((sum, p) => sum + p.progress, 0) / activeProjectsCount
      )
    : 100;

  // Move between stages
  const stageOrder: ProjectStage[] = ['discovery', 'in_progress', 'review', 'approval', 'delivered'];

  const handleMoveStage = (projectId: string, currentStage: ProjectStage, direction: 'next' | 'prev') => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (direction === 'next' && currentIndex < stageOrder.length - 1) {
      updateProjectStage(projectId, stageOrder[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      updateProjectStage(projectId, stageOrder[currentIndex - 1]);
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      case 'high':
        return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'medium':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Client Projects & Milestones
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--brand-accent-subtle)',
                color: 'var(--brand-accent)',
              }}
            >
              Operational Board
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Track client project delivery lifecycles, monitor progress velocity, and advance milestone deliverables.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportProjects}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Export deliverables to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Operational Summary Metric Cards (No money, pure project KPIs) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Total Active Deliverables */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Deliverables
            </span>
            <FolderKanban size={16} style={{ color: 'var(--brand-accent)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {activeProjectsCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Projects</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across all active production stages
          </span>
        </div>

        {/* In Active Execution */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Active Execution
            </span>
            <Activity size={16} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em' }}>
            {inExecutionCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Underway</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Development and sprint delivery
          </span>
        </div>

        {/* Under Review & Sign-off */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quality & Approval
            </span>
            <CheckSquare size={16} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', letterSpacing: '-0.02em' }}>
            {underReviewCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            QA validation & client demo review
          </span>
        </div>

        {/* Delivered / Completed */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed & Live
            </span>
            <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', letterSpacing: '-0.02em' }}>
            {deliveredCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Delivered</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {avgProgress}% average progress across roster
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem 0.75rem',
            flex: '1',
            minWidth: '240px',
            maxWidth: '460px',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects by title, client, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              width: '100%',
              color: 'var(--text-primary)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assigned Member Filter */}
          {role === 'admin' && (
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Team Members</option>
              {salesMembers.map((sm) => (
                <option key={sm.id} value={sm.memberId}>
                  {sm.name}
                </option>
              ))}
            </select>
          )}

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing: {filteredProjects.length} projects
          </span>

          {/* View Mode Segmented Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '0.2rem',
              border: '1px solid #e2e8f0',
              marginLeft: '0.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <LayoutGrid size={13} />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <List size={13} />
              <span>Milestone List</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Content: Kanban Board OR Milestone List */}
      {viewMode === 'list' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Deliverable & Scope</th>
                <th>Client Organization</th>
                <th>Category</th>
                <th>Delivery Stage</th>
                <th>Priority</th>
                <th style={{ width: '150px' }}>Progress</th>
                <th>Target Date</th>
                <th>Allocated Member</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No project deliverables match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const priorityStyle = getPriorityBadgeStyle(project.priority);
                  const stageObj = STAGES.find((s) => s.id === project.stage) || STAGES[0];

                  return (
                    <tr key={project.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {project.projectId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {project.title}
                        </div>
                        {project.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {project.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <div
                          onClick={() => handleOpenClientDetails(project.clientName)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.color = 'var(--brand-accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          title={`Click to view ${project.clientName} customer details`}
                        >
                          <Building size={13} style={{ color: 'var(--brand-accent)' }} />
                          <span>{project.clientName}</span>
                          <ExternalLink size={11} style={{ opacity: 0.6 }} />
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                          {project.category}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: stageObj.bgColor,
                            color: stageObj.color,
                            border: `1px solid ${stageObj.borderColor}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: stageObj.color }} />
                          {stageObj.label}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.text,
                            border: `1px solid ${priorityStyle.border}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${project.progress}%`,
                                backgroundColor:
                                  project.progress === 100
                                    ? '#16a34a'
                                    : project.progress >= 70
                                    ? '#0284c7'
                                    : '#d97706',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '32px' }}>
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{project.dueDate}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                          <User size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{project.assignedMemberName}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          {project.stage !== 'delivered' && (
                            <button
                              type="button"
                              onClick={() => handleMoveStage(project.projectId, project.stage, 'next')}
                              className="btn btn-dark btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              title="Advance stage"
                            >
                              <span>Advance</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteProject(project.projectId)}
                            style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.25rem' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(280px, 1fr))',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          alignItems: 'start',
        }}
      >
        {STAGES.map((stage) => {
          const stageProjects = filteredProjects.filter((p) => p.stage === stage.id);

          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: '#f8fafc',
                border: `1px solid ${stage.borderColor}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '520px',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: `1px solid ${stage.borderColor}`,
                  backgroundColor: '#ffffff',
                  borderTopLeftRadius: 'var(--radius-md)',
                  borderTopRightRadius: 'var(--radius-md)',
                  borderTop: `3px solid ${stage.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: stage.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: stage.bgColor,
                      color: stage.color,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      border: `1px solid ${stage.borderColor}`,
                    }}
                  >
                    {stageProjects.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {stage.sublabel}
                </div>
              </div>

              {/* Column Project Cards */}
              <div
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  flex: 1,
                }}
              >
                {stageProjects.length === 0 ? (
                  <div
                    style={{
                      padding: '2.5rem 1rem',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    No projects in this stage
                  </div>
                ) : (
                  stageProjects.map((project) => {
                    const priorityStyle = getPriorityBadgeStyle(project.priority);

                    return (
                      <div
                        key={project.id}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Card Top: Code & Priority Badge */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              fontFamily: 'monospace',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {project.projectId}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: priorityStyle.bg,
                              color: priorityStyle.text,
                              border: `1px solid ${priorityStyle.border}`,
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                            }}
                          >
                            {project.priority}
                          </span>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <h4
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              margin: '0 0 0.35rem 0',
                              lineHeight: 1.35,
                            }}
                          >
                            {project.title}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              display: 'inline-block',
                            }}
                          >
                            {project.category}
                          </span>
                        </div>

                        {/* Client Company (Clickable to Customer Details) */}
                        <div
                          onClick={() => handleOpenClientDetails(project.clientName)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.15rem 0.35rem',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                            alignSelf: 'flex-start',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.color = 'var(--brand-accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title={`Click to view ${project.clientName} customer details`}
                        >
                          <Building size={13} style={{ color: 'var(--brand-accent)' }} />
                          <span style={{ fontWeight: 600 }}>{project.clientName}</span>
                          <ExternalLink size={10} style={{ opacity: 0.6 }} />
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              marginBottom: '0.25rem',
                            }}
                          >
                            <span>Milestone Progress</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {project.progress}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: '5px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${project.progress}%`,
                                backgroundColor:
                                  project.progress === 100
                                    ? '#16a34a'
                                    : project.progress >= 70
                                    ? '#0284c7'
                                    : project.progress >= 40
                                    ? '#d97706'
                                    : '#64748b',
                                borderRadius: '3px',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>

                        {/* Team Member & Due Date */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <User size={13} />
                            <span>{project.assignedMemberName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} />
                            <span>{project.dueDate}</span>
                          </div>
                        </div>

                        {/* Card Movement Actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '0.2rem',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {stage.id !== 'discovery' && (
                              <button
                                type="button"
                                onClick={() => handleMoveStage(project.projectId, project.stage, 'prev')}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                }}
                                title="Move to previous stage"
                              >
                                <ArrowLeft size={12} />
                                <span>Prev</span>
                              </button>
                            )}

                            {stage.id !== 'delivered' && (
                              <button
                                type="button"
                                onClick={() => handleMoveStage(project.projectId, project.stage, 'next')}
                                className="btn btn-dark btn-sm"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                }}
                                title="Advance to next stage"
                              >
                                <span>Next</span>
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteProject(project.projectId)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#cbd5e1',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                            title="Delete project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
