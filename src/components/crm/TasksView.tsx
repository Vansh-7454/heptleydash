'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { CRMTask, TaskPriority, TaskType } from '@/types';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Users,
  Mail,
  FileText,
  Calendar,
  Trash2,
  Building,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export default function TasksView() {
  const {
    tasks,
    customers,
    setDetailedCustomerView,
    toggleTaskComplete,
    deleteTask,
    setIsAddTaskModalOpen,
  } = useDashboard();

  const handleOpenCustomerDetails = (companyOrContact: string) => {
    const matched = customers.find(
      (c) =>
        c.company.toLowerCase().includes(companyOrContact.toLowerCase()) ||
        c.name.toLowerCase().includes(companyOrContact.toLowerCase()) ||
        companyOrContact.toLowerCase().includes(c.company.toLowerCase()) ||
        companyOrContact.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matched) {
      setDetailedCustomerView(matched);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'high' | 'completed'>('all');

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'call':
        return <Phone size={14} style={{ color: '#0284c7' }} />;
      case 'meeting':
        return <Users size={14} style={{ color: '#8b5cf6' }} />;
      case 'email':
        return <Mail size={14} style={{ color: '#10b981' }} />;
      case 'proposal':
        return <FileText size={14} style={{ color: '#e11d48' }} />;
      case 'followup':
      default:
        return <Clock size={14} style={{ color: '#f59e0b' }} />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
            }}
          >
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span
            style={{
              fontSize: '0.675rem',
              fontWeight: 600,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            Low
          </span>
        );
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      (t.company && t.company.toLowerCase().includes(query)) ||
      (t.contactName && t.contactName.toLowerCase().includes(query));

    if (filterTab === 'pending') return matchesSearch && !t.completed;
    if (filterTab === 'high') return matchesSearch && t.priority === 'high' && !t.completed;
    if (filterTab === 'completed') return matchesSearch && t.completed;
    return matchesSearch;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Follow-ups & Tasks
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
              }}
            >
              CRM Activities
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Schedule client calls, proposal reviews, and timely contract follow-up reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={15} />
          <span>+ Schedule Follow-up</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Pending Follow-ups
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {pendingCount}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
            Requires team action
          </span>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            High Priority Urgent
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>
            {highPriorityCount}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
            Due this week
          </span>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Completed Activities
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
            Successfully executed
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterTab('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterTab === 'all' ? 'var(--brand-primary)' : 'transparent',
              color: filterTab === 'all' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterTab === 'pending' ? 'var(--brand-primary)' : 'transparent',
              color: filterTab === 'pending' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab('high')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterTab === 'high' ? '#dc2626' : 'transparent',
              color: filterTab === 'high' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            Urgent ({highPriorityCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterTab === 'completed' ? '#16a34a' : 'transparent',
              color: filterTab === 'completed' ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
          <Search size={14} style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
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
      </div>

      {/* Tasks List */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--brand-accent)', margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No tasks found</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              All client activities in this category are up to date.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: task.completed ? '#f8fafc' : '#ffffff',
                border: '1px solid var(--border-default)',
                gap: '1rem',
                transition: 'all 0.15s ease',
                opacity: task.completed ? 0.75 : 1,
              }}
            >
              {/* Left: Checkbox + Icon + Title & Company */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                <button
                  onClick={() => toggleTaskComplete(task.taskId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: task.completed ? '#16a34a' : 'var(--text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                >
                  {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>

                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(task.type)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </span>
                  {task.company && (
                    <div
                      onClick={() => handleOpenCustomerDetails(task.company || task.contactName || '')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '4px',
                        alignSelf: 'flex-start',
                        marginTop: '0.1rem',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.color = 'var(--brand-accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                      title={`Click to view customer details for ${task.company}`}
                    >
                      <Building size={11} style={{ color: 'var(--brand-accent)' }} />
                      <span style={{ fontWeight: 500 }}>{task.company}</span>
                      {task.contactName && <span>· {task.contactName}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Priority + Due Date + Rep + Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
                {getPriorityBadge(task.priority)}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  <span>Due {task.dueDate}</span>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {task.salesMemberId}
                </span>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete task "${task.title}"?`)) {
                      deleteTask(task.taskId);
                    }
                  }}
                  style={{ color: '#ef4444', opacity: 0.6, cursor: 'pointer', padding: '0.2rem', background: 'none', border: 'none' }}
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
