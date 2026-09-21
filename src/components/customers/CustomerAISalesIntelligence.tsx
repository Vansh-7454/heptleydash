'use client';

import React, { useState } from 'react';
import { Customer } from '@/types';
import { Card, Badge, Button, Select } from '@/components/ui';
import {
  aiService,
  CustomerSummaryResult,
  FollowUpRecommendationResult,
  FollowUpMessageResult,
} from '@/services/aiService';
import { useDashboard } from '@/context/DashboardContext';
import {
  Sparkles,
  Bot,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Clock,
  Send,
  FileText,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface CustomerAISalesIntelligenceProps {
  customer: Customer;
}

export default function CustomerAISalesIntelligence({ customer }: CustomerAISalesIntelligenceProps) {
  const { addFollowUp, showToast, userProfile, role, setActiveAdminTab, setActiveSalesTab, setSelectedAiEntity, setDetailedCustomerView } = useDashboard();

  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'recommendation' | 'message'>('summary');

  // Summary State
  const [summary, setSummary] = useState<CustomerSummaryResult | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Recommendation State
  const [recommendation, setRecommendation] = useState<FollowUpRecommendationResult | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Message State
  const [messagePurpose, setMessagePurpose] = useState<string>('check_in');
  const [messageDraft, setMessageDraft] = useState<FollowUpMessageResult | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Handler: Generate Summary
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await aiService.getCustomerSummary(customer.customerId || customer.id);
      setSummary(res);
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to generate customer summary from AI.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Handler: Generate Follow-up Recommendation
  const handleGetRecommendation = async () => {
    setIsRecLoading(true);
    setRecError(null);
    try {
      const res = await aiService.getFollowUpRecommendation(customer.customerId || customer.id);
      setRecommendation(res);
    } catch (err: any) {
      setRecError(err.message || 'Failed to retrieve follow-up recommendation from AI.');
    } finally {
      setIsRecLoading(false);
    }
  };

  // Handler: Schedule AI Recommended Follow-up
  const handleScheduleRecommendedFollowUp = async () => {
    if (!recommendation) return;
    setIsScheduling(true);
    try {
      // Parse suggested date: tomorrow or in 2 days
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (recommendation.urgency === 'High' ? 1 : 3));
      const dateStr = targetDate.toISOString().split('T')[0];

      await addFollowUp({
        title: recommendation.suggestedFollowUpTitle || `Follow-up with ${customer.name}`,
        entityType: 'customer',
        entityId: customer.id,
        entityName: customer.name,
        company: customer.company,
        assignedSalesMemberId: customer.salesMemberId || userProfile.memberId || 'SM-001',
        assignedSalesMemberName: customer.salesMemberName || userProfile.name,
        date: dateStr,
        time: '11:00',
        type: recommendation.recommendedType || 'Call',
        status: 'Pending',
        note: `AI Recommendation: ${recommendation.reason}. Points: ${recommendation.keyDiscussionPoints.join('; ')}`,
      });
      showToast('Follow-up scheduled successfully in CRM!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule follow-up', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  // Handler: Draft Message
  const handleDraftMessage = async () => {
    setIsMessageLoading(true);
    setMessageError(null);
    try {
      const res = await aiService.getFollowUpMessage(customer.customerId || customer.id, messagePurpose);
      setMessageDraft(res);
    } catch (err: any) {
      setMessageError(err.message || 'Failed to generate follow-up draft message.');
    } finally {
      setIsMessageLoading(false);
    }
  };

  // Handler: Copy Message
  const handleCopyMessage = () => {
    if (!messageDraft) return;
    const textToCopy = `Subject: ${messageDraft.subject}\n\n${messageDraft.message}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showToast('Draft message copied to clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Handler: Open in Main AI Agent
  const handleOpenInAgent = () => {
    setSelectedAiEntity({
      type: 'customer',
      id: customer.customerId || customer.id,
      name: customer.name,
    });
    if (role === 'sales') {
      setActiveSalesTab('ai-assistant');
    } else {
      setActiveAdminTab('ai-assistant');
    }
    setDetailedCustomerView(null);
  };

  return (
    <Card
      style={{
        border: '1px solid var(--border-default)',
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(99, 102, 241, 0.03) 100%)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                AI Sales Intelligence
              </h3>
              <Badge variant="info">Gemini 2.0</Badge>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Live customer analytics, next-best-action prediction, and communication assistance
            </p>
          </div>
        </div>

        {role === 'sales' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bot size={14} />}
              rightIcon={<ExternalLink size={12} />}
              onClick={handleOpenInAgent}
            >
              Open in AI Sales Agent
            </Button>
          </div>
        )}
      </div>

      {/* Sub-tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setActiveSubTab('summary')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: activeSubTab === 'summary' ? 'var(--brand-accent)' : 'transparent',
            color: activeSubTab === 'summary' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          Customer Summary
        </button>

        <button
          onClick={() => setActiveSubTab('recommendation')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: activeSubTab === 'recommendation' ? 'var(--brand-accent)' : 'transparent',
            color: activeSubTab === 'recommendation' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          Follow-up Recommendation
        </button>

        <button
          onClick={() => setActiveSubTab('message')}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: activeSubTab === 'message' ? 'var(--brand-accent)' : 'transparent',
            color: activeSubTab === 'message' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          Draft Message
        </button>
      </div>

      {/* Tab Content Area */}
      <div style={{ padding: '1.5rem' }}>
        {/* SUBTAB 1: ACCOUNT SUMMARY */}
        {activeSubTab === 'summary' && (
          <div>
            {!summary && !isSummaryLoading && !summaryError && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <Bot size={36} style={{ color: 'var(--brand-accent)', opacity: 0.8, margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Analyze Customer Profile & Trajectory
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
                  Generate a multi-factor analysis synthesizing contract terms, payment history, overdue items, and recent interaction logs.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                  onClick={handleGenerateSummary}
                >
                  Generate AI Summary
                </Button>
              </div>
            )}

            {isSummaryLoading && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--brand-accent)', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Analyzing customer records with Gemini...
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Correlating invoices, logs, and schedule data
                </p>
              </div>
            )}

            {summaryError && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--color-error)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  <span>AI Analysis Unavailable</span>
                </div>
                <p style={{ margin: 0 }}>{summaryError}</p>
                <Button variant="outline" size="sm" style={{ marginTop: '0.75rem' }} onClick={handleGenerateSummary}>
                  Try Again
                </Button>
              </div>
            )}

            {summary && !isSummaryLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Synthesized Intelligence for <span style={{ color: 'var(--text-primary)' }}>{summary.customerName}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw size={13} />}
                    onClick={handleGenerateSummary}
                  >
                    Regenerate
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--brand-accent)', fontWeight: 600, fontSize: '0.8rem' }}>
                      <TrendingUp size={14} />
                      <span>Current Situation & Service Status</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                      {summary.currentSituation || summary.serviceStatus}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>
                      <FileText size={14} />
                      <span>Financial Standing</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                      {summary.financialSituation}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#F59E0B', fontWeight: 600, fontSize: '0.8rem' }}>
                      <Clock size={14} />
                      <span>Recent Activity & Touchpoints</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                      {summary.recentActivity}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(239, 68, 68, 0.04)',
                      border: '1px solid rgba(239, 68, 68, 0.18)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#EF4444', fontWeight: 600, fontSize: '0.8rem' }}>
                      <ShieldAlert size={14} />
                      <span>Items Needing Attention</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                      {summary.pendingAttention || 'No immediate critical warnings.'}
                    </p>
                  </div>
                </div>

                {/* Recommended Next Action Callout */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-accent)' }}>
                      AI Recommended Next Action
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0' }}>
                      {summary.recommendedNextAction}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight size={14} />}
                    onClick={() => setActiveSubTab('recommendation')}
                  >
                    Plan Action
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: FOLLOW-UP RECOMMENDATION */}
        {activeSubTab === 'recommendation' && (
          <div>
            {!recommendation && !isRecLoading && !recError && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <Calendar size={36} style={{ color: 'var(--brand-accent)', opacity: 0.8, margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Smart Follow-Up Prioritization
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
                  Let Gemini analyze the customer's timeline, open invoices, and recent notes to suggest the ideal date, channel, and discussion points.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                  onClick={handleGetRecommendation}
                >
                  Evaluate Follow-up Need
                </Button>
              </div>
            )}

            {isRecLoading && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--brand-accent)', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Evaluating customer timeline with Gemini...
                </p>
              </div>
            )}

            {recError && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--color-error)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  <span>Recommendation Error</span>
                </div>
                <p style={{ margin: 0 }}>{recError}</p>
                <Button variant="outline" size="sm" style={{ marginTop: '0.75rem' }} onClick={handleGetRecommendation}>
                  Try Again
                </Button>
              </div>
            )}

            {recommendation && !isRecLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={recommendation.urgency === 'High' ? 'danger' : recommendation.urgency === 'Medium' ? 'warning' : 'active'}>
                      {recommendation.urgency} Urgency
                    </Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Optimal Timing: <strong style={{ color: 'var(--text-primary)' }}>{recommendation.recommendedTiming}</strong>
                    </span>
                    <Badge variant="neutral">Channel: {recommendation.recommendedType}</Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw size={13} />}
                    onClick={handleGetRecommendation}
                  >
                    Refresh
                  </Button>
                </div>

                <div
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {recommendation.suggestedFollowUpTitle || 'Proposed Follow-up'}
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {recommendation.reason}
                  </p>
                </div>

                {recommendation.keyDiscussionPoints?.length > 0 && (
                  <div>
                    <h6 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Key Points to Address
                    </h6>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {recommendation.keyDiscussionPoints.map((point, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scheduling Confirmation Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--brand-accent-subtle)',
                    border: '1px solid var(--brand-accent)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
                      Schedule this follow-up directly into the CRM?
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                      Will create a live follow-up record with the suggested points and assign it to you.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Calendar size={14} />}
                    isLoading={isScheduling}
                    onClick={handleScheduleRecommendedFollowUp}
                  >
                    Schedule in CRM
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: DRAFT MESSAGE */}
        {activeSubTab === 'message' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div style={{ minWidth: '240px', flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Select Message Purpose
                </label>
                <select
                  className="input-field"
                  value={messagePurpose}
                  onChange={(e) => setMessagePurpose(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-md)' }}
                >
                  <option value="check_in">Relationship Check-in</option>
                  <option value="payment_reminder">Payment / Invoice Follow-up</option>
                  <option value="proposal_followup">Contract / Scope Review</option>
                  <option value="onboarding_update">Onboarding Milestone Progress</option>
                  <option value="re_engagement">Re-engagement / Status Inquiry</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles size={14} />}
                isLoading={isMessageLoading}
                onClick={handleDraftMessage}
              >
                Generate Draft
              </Button>
            </div>

            {messageError && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--color-error)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  <span>Draft Error</span>
                </div>
                <p style={{ margin: 0 }}>{messageError}</p>
              </div>
            )}

            {messageDraft && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Channel: <strong style={{ color: 'var(--text-primary)' }}>{messageDraft.channel || 'Email'}</strong>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={isCopied ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                    onClick={handleCopyMessage}
                  >
                    {isCopied ? 'Copied to Clipboard!' : 'Copy Message'}
                  </Button>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject: </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{messageDraft.subject}</span>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                  }}
                >
                  {messageDraft.message}
                </div>

                {messageDraft.keyDetailsIncluded?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Context included:</span>
                    {messageDraft.keyDetailsIncluded.map((tag, i) => (
                      <Badge key={i} variant="neutral">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
