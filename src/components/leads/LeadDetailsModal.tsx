'use client';

import React, { useState } from 'react';
import { Lead, LeadStatus } from '@/types';
import { Modal, Badge, Button } from '@/components/ui';
import { aiService, LeadAnalysisResult } from '@/services/aiService';
import { useDashboard } from '@/context/DashboardContext';
import {
  Sparkles,
  Bot,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileQuestion,
  User,
  Building,
  Mail,
  Phone,
  Tag,
  DollarSign,
  ArrowRight,
  UserCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStage?: (lead: Lead) => void;
  onConvert?: (lead: Lead) => void;
}

export default function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onAdvanceStage,
  onConvert,
}: LeadDetailsModalProps) {
  const {
    role,
    setActiveAdminTab,
    setActiveSalesTab,
    setSelectedAiEntity,
    showToast,
  } = useDashboard();

  const [analysis, setAnalysis] = useState<LeadAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lead) return null;

  const handleAnalyzeLead = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiService.getLeadAnalysis(lead.leadId || lead.id);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze lead with AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInAgent = () => {
    setSelectedAiEntity({
      type: 'lead',
      id: lead.leadId || lead.id,
      name: lead.name,
    });
    if (role === 'sales') {
      setActiveSalesTab('ai-assistant');
    } else {
      setActiveAdminTab('ai-assistant');
    }
    onClose();
  };

  const getStatusVariant = (status: string) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Lead Profile: ${lead.name}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {lead.status !== 'Won' && lead.status !== 'Lost' && onAdvanceStage && (
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
                onClick={() => {
                  onAdvanceStage(lead);
                }}
              >
                Advance Stage
              </Button>
            )}

            {lead.status !== 'Lost' && onConvert && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserCheck size={14} />}
                onClick={() => {
                  onClose();
                  onConvert(lead);
                }}
              >
                Convert to Customer
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Header Card */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {lead.name}
              </h3>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ({lead.leadId})
              </span>
              <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Building size={14} />
              <span>{lead.company}</span>
              <span>·</span>
              <Tag size={14} />
              <span>Service: <strong style={{ color: 'var(--text-primary)' }}>{lead.interestedService}</strong></span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Estimated Deal Value
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
              ₹{(lead.dealEstimate || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Contact & Assignment Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={12} /> Email
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {lead.email}
            </span>
          </div>

          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={12} /> Phone
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {lead.phone}
            </span>
          </div>

          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={12} /> Assigned Representative
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {lead.assignedSalesMemberName} ({lead.assignedSalesMemberId})
            </span>
          </div>

          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={12} /> Lead Source
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {lead.source}
            </span>
          </div>
        </div>

        {/* Lead Notes */}
        {lead.notes && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Initial Lead Notes / Inbound Request
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
              {lead.notes}
            </p>
          </div>
        )}

        {/* AI LEAD ANALYSIS SECTION */}
        <div
          style={{
            border: '1px solid var(--border-default)',
            background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(99, 102, 241, 0.04) 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  AI Lead Qualification & Strategy
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Extract requirements, uncover hidden gaps, and draft closing questions
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {role === 'sales' && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Bot size={13} />}
                  onClick={handleOpenInAgent}
                >
                  Chat with Agent
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                leftIcon={analysis ? <RefreshCw size={13} /> : <Sparkles size={13} />}
                isLoading={isLoading}
                onClick={handleAnalyzeLead}
              >
                {analysis ? 'Re-analyze' : 'Analyze Lead'}
              </Button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--color-error)',
                fontSize: '0.825rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                <AlertCircle size={14} />
                <span>Analysis Unavailable</span>
              </div>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--brand-accent)', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Evaluating lead qualification with Gemini...
              </p>
            </div>
          )}

          {analysis && !isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary and Next Action */}
              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-accent)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Strategic Assessment
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                  {analysis.leadSummary}
                </p>
              </div>

              {/* Requirements & Missing Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <CheckCircle2 size={13} /> Identified Requirements
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                    {analysis.requirements || 'Standard service scope.'}
                  </p>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <HelpCircle size={13} /> Missing Information / Gaps
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.825rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {analysis.missingInformation?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Questions to Ask */}
              {analysis.suggestedQuestions?.length > 0 && (
                <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <FileQuestion size={14} /> Suggested Qualification Questions for Next Touchpoint
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {analysis.suggestedQuestions.map((q, i) => (
                      <li key={i} style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Action Pill */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
                    Recommended Next Action:
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '0.4rem' }}>
                    {analysis.recommendedNextAction}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
