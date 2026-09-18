'use client';

import React, { useEffect, useState } from 'react';
import { reportService, ReportSummary } from '@/services/reportService';
import { Card, Table, Badge, Button, LoadingState } from '@/components/ui';
import { BarChart3, TrendingUp, Users, CheckCircle2, DollarSign, Download, ArrowUpRight } from 'lucide-react';

export default function ReportsView() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportService.getSummary().then((data) => {
      setSummary(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !summary) {
    return <LoadingState message="Generating executive operations report..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
            Executive Operations & Conversion Reports
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Pipeline conversion progression, team execution compliance, and revenue realization.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={() => window.print()}
        >
          Print Executive Summary
        </Button>
      </div>

      {/* Financial Health Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Contracted Value</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.35rem 0 0' }}>
            ₹{summary.financials.totalBilled.toLocaleString('en-IN')}
          </h3>
          <div style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>All closed contracts</div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Collected Revenue</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', margin: '0.35rem 0 0' }}>
            ₹{summary.financials.totalCollected.toLocaleString('en-IN')}
          </h3>
          <div style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            {summary.financials.collectionRate}% Realized
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Outstanding Receivable</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', margin: '0.35rem 0 0' }}>
            ₹{summary.financials.totalOutstanding.toLocaleString('en-IN')}
          </h3>
          <div style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Due across delivery milestones
          </div>
        </Card>
      </div>

      {/* Section 1: Lead Conversion Funnel */}
      <Card
        title="Lead Conversion Funnel"
        subtitle="Progression of prospective leads into paying customer accounts"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {summary.funnel.map((stage) => (
            <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '130px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {stage.stage}
              </div>
              <div
                style={{
                  flex: 1,
                  height: '24px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(12, stage.percentage)}%`,
                    backgroundColor: stage.stage === 'Won' ? '#10b981' : 'var(--brand-accent)',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <div style={{ width: '100px', textAlign: 'right', fontSize: '0.8125rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{stage.count} leads</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>({stage.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 2: Sales Team Productivity Table */}
      <Card
        title="Sales Team Execution & Performance"
        subtitle="Contract values generated, accounts closed, and follow-up compliance rate"
        noPadding
      >
        <Table
          columns={[
            {
              key: 'memberId',
              header: 'Rep ID',
              width: '120px',
              render: (p) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-primary)' }}>
                  {p.memberId}
                </span>
              ),
            },
            {
              key: 'name',
              header: 'Sales Representative',
              render: (p) => <span style={{ fontWeight: 600 }}>{p.name}</span>,
            },
            {
              key: 'activeAccounts',
              header: 'Active Accounts',
              render: (p) => <span>{p.activeAccounts} Accounts</span>,
            },
            {
              key: 'closedWonCount',
              header: 'Deals Won',
              render: (p) => (
                <Badge variant="active">{p.closedWonCount} Converted</Badge>
              ),
            },
            {
              key: 'totalDealsValue',
              header: 'Total Value Generated',
              render: (p) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{p.totalDealsValue.toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              key: 'followUpRate',
              header: 'SLA Compliance',
              render: (p) => (
                <span style={{ color: '#059669', fontWeight: 600 }}>{p.followUpRate}% On-time</span>
              ),
            },
          ]}
          data={summary.performance}
          keyExtractor={(p) => p.memberId}
        />
      </Card>
    </div>
  );
}
