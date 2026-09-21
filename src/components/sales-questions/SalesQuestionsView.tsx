'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { SalesQuestion } from '@/types';
import { Card, Badge, Button, Input, Select, Modal } from '@/components/ui';
import {
  HelpCircle,
  MessageSquare,
  Search,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Globe,
  Briefcase,
  ChevronRight,
  Filter,
  Trash2,
} from 'lucide-react';

export default function SalesQuestionsView() {
  const {
    currentUser,
    salesQuestions,
    customers,
    websites,
    askSalesQuestion,
    answerSalesQuestion,
    deleteSalesQuestion,
  } = useDashboard();

  const isSales = currentUser?.role === 'sales';
  const canAnswer = currentUser?.role === 'developer' || currentUser?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Ask Question Modal State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');

  // Answering Modal State
  const [answeringQuestion, setAnsweringQuestion] = useState<SalesQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerStatus, setAnswerStatus] = useState<'ANSWERED' | 'IN_PROGRESS' | 'CLOSED'>('ANSWERED');

  // Delete Question Modal State
  const [questionToDelete, setQuestionToDelete] = useState<SalesQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const targetId = questionToDelete.questionId || questionToDelete.id;
      await deleteSalesQuestion(targetId);
      setQuestionToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete question. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Questions
  const filteredQuestions = salesQuestions.filter((q) => {
    // If sales role, only display questions asked by this sales rep
    if (isSales && (currentUser?.salesMemberId || currentUser?.memberId)) {
      const myId = currentUser.salesMemberId || currentUser.memberId;
      if (q.askedBySalesMemberId && q.askedBySalesMemberId !== myId) return false;
      if (q.askedBy && q.askedBy !== myId && !q.askedBySalesMemberId) return false;
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (q.subject && q.subject.toLowerCase().includes(query)) ||
      q.question.toLowerCase().includes(query) ||
      q.questionId.toLowerCase().includes(query) ||
      (q.askedByName && q.askedByName.toLowerCase().includes(query)) ||
      (q.customerName && q.customerName.toLowerCase().includes(query)) ||
      (q.websiteName && q.websiteName.toLowerCase().includes(query));

    const matchesPriority = priorityFilter === 'all' || q.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleOpenAskModal = () => {
    setSubject('');
    setQuestionText('');
    setPriority('MEDIUM');
    setSelectedCustomerId(customers[0]?.customerId || '');
    setSelectedWebsiteId(websites[0]?.websiteId || '');
    setFormError(null);
    setIsAskModalOpen(true);
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!questionText.trim()) {
      setFormError('Please detail the technical question.');
      return;
    }

    setIsLoading(true);
    try {
      await askSalesQuestion({
        subject: subject.trim(),
        question: questionText.trim(),
        priority,
        customerId: selectedCustomerId || undefined,
        websiteId: selectedWebsiteId || undefined,
      });
      setIsAskModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAnswerModal = (q: SalesQuestion) => {
    setAnsweringQuestion(q);
    setAnswerText(q.answer || '');
    setAnswerStatus((q.status as any) || 'ANSWERED');
    setFormError(null);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringQuestion) return;
    setFormError(null);

    if (!answerText.trim()) {
      setFormError('Answer cannot be empty.');
      return;
    }

    setIsLoading(true);
    try {
      await answerSalesQuestion(answeringQuestion.questionId, answerText.trim(), answerStatus);
      setAnsweringQuestion(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit answer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--brand-accent-text)',
              marginBottom: '0.25rem',
            }}
          >
            <HelpCircle size={15} />
            <span>Engineering Collaboration</span>
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.25rem 0',
            }}
          >
            Sales Technical Inquiries & Q&A
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            {isSales
              ? 'Ask technical feasibility questions directly to the developer team and get real-time answers.'
              : 'Provide technical guidance, timeline estimates, and feasibility answers to sales representatives.'}
          </p>
        </div>

        {/* Action button - only sales representatives ask technical questions */}
        {isSales && (
          <Button
            variant="primary"
            size="sm"
            className="btn-pill"
            leftIcon={<Plus size={15} />}
            onClick={handleOpenAskModal}
          >
            Ask Technical Question
          </Button>
        )}
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
              placeholder="Search by subject, question, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              containerClassName="mb-0"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              containerClassName="mb-0"
              style={{ minWidth: '140px' }}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'URGENT', label: 'Urgent Priority' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'LOW', label: 'Low Priority' },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              containerClassName="mb-0"
              style={{ minWidth: '140px' }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'OPEN', label: 'OPEN' },
                { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
                { value: 'ANSWERED', label: 'ANSWERED' },
                { value: 'CLOSED', label: 'CLOSED' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            No Questions Found
          </h3>
          <p style={{ fontSize: '0.875rem', margin: '0.35rem 0 0' }}>
            {isSales
              ? 'You have not submitted any technical questions yet. Click above to submit one.'
              : 'No questions currently matching the selected filters.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredQuestions.map((q) => {
            const isAnswered = q.status === 'ANSWERED' || q.status === 'CLOSED';

            return (
              <Card
                key={q.id || q.questionId}
                style={{
                  padding: '1.5rem',
                  border: isAnswered ? '1.5px solid #cbd5e1' : '1px solid var(--border-default)',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.85rem', color: '#0284c7' }}>
                      {q.questionId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: q.priority === 'URGENT' ? '#fee2e2' : q.priority === 'HIGH' ? '#fee2e2' : q.priority === 'MEDIUM' ? '#ffedd5' : '#f0fdf4',
                        color: q.priority === 'URGENT' ? '#991b1b' : q.priority === 'HIGH' ? '#dc2626' : q.priority === 'MEDIUM' ? '#ea580c' : '#16a34a',
                        border: `1px solid ${q.priority === 'URGENT' ? '#fca5a5' : q.priority === 'HIGH' ? '#fecaca' : q.priority === 'MEDIUM' ? '#fed7aa' : '#bbf7d0'}`,
                      }}
                    >
                      {q.priority}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: isAnswered ? '#dcfce7' : '#fef3c7',
                        color: isAnswered ? '#15803d' : '#b45309',
                        border: `1px solid ${isAnswered ? '#bbf7d0' : '#fde68a'}`,
                      }}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {new Date(q.createdAt).toLocaleDateString()} at{' '}
                      {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {(isSales || currentUser?.role === 'admin') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteError(null);
                          setQuestionToDelete(q);
                        }}
                        style={{
                          height: '28px',
                          padding: '0 0.55rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                          backgroundColor: '#fff1f2',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        title="Delete Technical Question"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </Button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                  {q.subject || q.question.slice(0, 60)}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  {q.question}
                </p>

                {/* Metadata Pills: Asked by, Customer, Website */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <User size={14} color="#64748b" />
                    <span>
                      Asked by: <strong style={{ color: 'var(--text-primary)' }}>{q.askedByName}</strong> ({q.askedBy})
                    </span>
                  </div>

                  {q.customerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Briefcase size={14} color="#0284c7" />
                      <span>
                        Client: <strong style={{ color: 'var(--text-primary)' }}>{q.customerName}</strong>
                      </span>
                    </div>
                  )}

                  {q.websiteName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Globe size={14} color="#059669" />
                      <span>
                        Website: <strong style={{ color: 'var(--text-primary)' }}>{q.websiteName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Developer Answer Box */}
                {q.answer ? (
                  <div
                    style={{
                      marginTop: '1.15rem',
                      padding: '1.15rem 1.25rem',
                      borderRadius: '12px',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #a7f3d0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 800, fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} />
                        <span>Engineering Response by {q.answeredByName || 'Developer'}</span>
                      </div>
                      {q.answeredAt && (
                        <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                          {new Date(q.answeredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', lineHeight: 1.5 }}>
                      {q.answer}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#b45309' }}>
                      <Clock size={14} />
                      <span>Awaiting response from development team</span>
                    </div>

                    {canAnswer && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="btn-pill"
                        leftIcon={<Send size={13} />}
                        onClick={() => handleOpenAnswerModal(q)}
                      >
                        Submit Developer Answer
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Ask Question Modal */}
      <Modal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        title="Ask Technical Inquiry"
        subtitle="Submit a question to the engineering staff for feasibility, timeline, or architecture clarification"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAskModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAskSubmit} isLoading={isLoading}>
              Submit Inquiry
            </Button>
          </>
        }
      >
        <form onSubmit={handleAskSubmit}>
          {formError && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {formError}
            </div>
          )}

          <Input
            label="Inquiry Subject"
            placeholder="e.g. Can we integrate Razorpay Subscriptions for client?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Detailed Question
            </label>
            <textarea
              rows={4}
              placeholder="Explain the client requirement, expected scope, and any technical questions for the developers..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'URGENT', label: 'URGENT (Critical Deal Blocker)' },
                { value: 'HIGH', label: 'HIGH (Deal-blocker / Urgent)' },
                { value: 'MEDIUM', label: 'MEDIUM (Standard Inquiry)' },
                { value: 'LOW', label: 'LOW (General question)' },
              ]}
            />
            <Select
              label="Related Customer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={[
                { value: '', label: 'General / No Specific Customer' },
                ...customers.map((c) => ({
                  value: c.customerId,
                  label: `${c.name} (${c.customerId})`,
                })),
              ]}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Select
              label="Related Website (Optional)"
              value={selectedWebsiteId}
              onChange={(e) => setSelectedWebsiteId(e.target.value)}
              options={[
                { value: '', label: 'None' },
                ...websites.map((w) => ({
                  value: w.websiteId,
                  label: `${w.name} (${w.websiteId})`,
                })),
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Answer Question Modal */}
      <Modal
        isOpen={!!answeringQuestion}
        onClose={() => setAnsweringQuestion(null)}
        title={`Answer: ${answeringQuestion?.questionId}`}
        subtitle={`Responding to ${answeringQuestion?.askedByName} regarding "${answeringQuestion?.subject}"`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnsweringQuestion(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAnswerSubmit} isLoading={isLoading}>
              Publish Answer
            </Button>
          </>
        }
      >
        <form onSubmit={handleAnswerSubmit}>
          {formError && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {formError}
            </div>
          )}

          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Original Question:
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {answeringQuestion?.question}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Developer Answer / Recommendation
            </label>
            <textarea
              rows={5}
              placeholder="Provide technical analysis, implementation steps, timeline estimate, or limitations..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                backgroundColor: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
            <Select
              label="Question Status"
              value={answerStatus}
              onChange={(e) => setAnswerStatus(e.target.value as any)}
              options={[
                { value: 'ANSWERED', label: 'ANSWERED (Response provided)' },
                { value: 'IN_PROGRESS', label: 'IN_PROGRESS (Under technical investigation)' },
                { value: 'CLOSED', label: 'CLOSED (Resolved & closed)' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!questionToDelete}
        onClose={() => {
          if (!isDeleting) setQuestionToDelete(null);
        }}
        title="Delete Technical Question"
        subtitle="This action will permanently delete this question and remove it across all portals."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuestionToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              leftIcon={<Trash2 size={14} />}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deleteError && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.8125rem',
              }}
            >
              {deleteError}
            </div>
          )}

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={20} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: '#9f1239', lineHeight: 1.5 }}>
              Are you sure you want to delete technical inquiry{' '}
              <strong style={{ fontFamily: 'monospace', color: '#881337' }}>
                {questionToDelete?.questionId}
              </strong>
              {questionToDelete?.subject ? ` - "${questionToDelete.subject}"` : ''}?
              <br />
              <span style={{ fontSize: '0.8rem', color: '#be123c', marginTop: '0.25rem', display: 'inline-block' }}>
                This inquiry will be immediately removed in real time from Developer and Admin dashboards.
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
