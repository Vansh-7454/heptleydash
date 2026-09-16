'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  CheckCheck,
  Layers,
} from 'lucide-react';

interface MonthlyCustomerData {
  month: string;
  count: number;
  activeGrowth: number;
}

const CUSTOMER_GROWTH_DATA: MonthlyCustomerData[] = [
  { month: 'Oct', count: 3, activeGrowth: 3 },
  { month: 'Nov', count: 5, activeGrowth: 4 },
  { month: 'Dec', count: 7, activeGrowth: 6 },
  { month: 'Jan', count: 6, activeGrowth: 5 },
  { month: 'Feb', count: 10, activeGrowth: 8 },
  { month: 'Mar', count: 14, activeGrowth: 11 },
];

export default function AnalyticsChart() {
  const { customers, totalCustomers, activeCustomers } = useDashboard();

  const [activeTab, setActiveTab] = useState<'timeline' | 'distribution'>('timeline');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Dynamic status distribution from real customer state
  const onboardingCount = customers.filter((c) => c.status === 'Onboarding').length;
  const completedCount = customers.filter((c) => c.status === 'Completed').length;
  const onHoldCount = customers.filter((c) => c.status === 'On Hold').length;

  // Dynamic service breakdown from customer state
  const serviceCounts: Record<string, number> = {};
  customers.forEach((c) => {
    serviceCounts[c.service] = (serviceCounts[c.service] || 0) + 1;
  });

  // SVG Chart Calculations
  const data = CUSTOMER_GROWTH_DATA;
  const maxValue = Math.max(...data.map((d) => d.count)) * 1.25 || 15;

  const svgWidth = 650;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (d.count / maxValue) * chartHeight;
    return { x, y, count: d.count, month: d.month };
  });

  // Curved Bezier Path
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${point.x},${point.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`;

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Customer Growth & Lifecycle Analytics
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.725rem',
                fontWeight: 600,
                color: '#16a34a',
                backgroundColor: '#dcfce7',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              <TrendingUp size={12} />
              +28.5% Client Growth
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
            Monthly client acquisition trajectory and portfolio lifecycle distribution.
          </p>
        </div>

        {/* View Switcher: Acquisition Timeline vs Status Distribution */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            gap: '0.25rem',
          }}
        >
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'timeline' ? '#ffffff' : 'transparent',
              color: activeTab === 'timeline' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'timeline' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Customer Growth
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'distribution' ? '#ffffff' : 'transparent',
              color: activeTab === 'distribution' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'distribution' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            Status Breakdown
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'timeline' ? (
        /* 1. Customer Acquisition Trend Chart */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* SVG Canvas */}
          <div style={{ position: 'relative', width: '100%', height: '180px' }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dotted Gridlines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = paddingY + ratio * chartHeight;
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="var(--border-default)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Gradient Fill */}
              <path d={areaPath} fill="url(#customerGradient)" />

              {/* Primary Curve */}
              <path
                d={linePath}
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Dots */}
              {points.map((p, i) => {
                const isHovered = hoveredIdx === i;
                return (
                  <g key={i}>
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={paddingY}
                        x2={p.x}
                        y2={svgHeight - paddingY}
                        stroke="#e11d48"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke="#e11d48"
                      strokeWidth={isHovered ? 3 : 2}
                      style={{ transition: 'all 0.15s ease' }}
                    />

                    {/* Hover Target */}
                    <rect
                      x={p.x - 20}
                      y={0}
                      width={40}
                      height={svgHeight}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIdx !== null && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredIdx].y / svgHeight) * 100}%`,
                  transform: 'translate(-50%, -125%)',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '0.4rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  pointerEvents: 'none',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                }}
              >
                <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.65rem' }}>
                  {points[hoveredIdx].month} 2026
                </div>
                <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.1rem' }}>
                  {points[hoveredIdx].count} New Customers Added
                </div>
              </div>
            )}
          </div>

          {/* Month Labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 1rem',
              marginTop: '-0.25rem',
            }}
          >
            {points.map((p, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: hoveredIdx === i ? 700 : 500,
                  color: hoveredIdx === i ? 'var(--brand-accent)' : 'var(--text-muted)',
                  transition: 'color 0.15s ease',
                }}
              >
                {p.month}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* 2. Customer Status Distribution Visual Bars */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          {/* Segmented Percentage Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                height: '12px',
                width: '100%',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                backgroundColor: '#f1f5f9',
              }}
            >
              <div
                style={{
                  width: `${(activeCustomers / (totalCustomers || 1)) * 100}%`,
                  backgroundColor: '#10b981',
                }}
                title={`Active: ${activeCustomers}`}
              />
              <div
                style={{
                  width: `${(onboardingCount / (totalCustomers || 1)) * 100}%`,
                  backgroundColor: '#38bdf8',
                }}
                title={`Onboarding: ${onboardingCount}`}
              />
              <div
                style={{
                  width: `${(completedCount / (totalCustomers || 1)) * 100}%`,
                  backgroundColor: '#6366f1',
                }}
                title={`Completed: ${completedCount}`}
              />
              <div
                style={{
                  width: `${(onHoldCount / (totalCustomers || 1)) * 100}%`,
                  backgroundColor: '#f59e0b',
                }}
                title={`On Hold: ${onHoldCount}`}
              />
            </div>
          </div>

          {/* Status Breakdown Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#ecfdf5',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #a7f3d0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#047857' }}>
                <CheckCircle2 size={13} />
                <span style={{ fontSize: '0.725rem', fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46', marginTop: '0.25rem' }}>
                {activeCustomers}
              </div>
              <span style={{ fontSize: '0.675rem', color: '#047857' }}>
                {Math.round((activeCustomers / (totalCustomers || 1)) * 100)}% of accounts
              </span>
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bfdbfe',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1d4ed8' }}>
                <Clock size={13} />
                <span style={{ fontSize: '0.725rem', fontWeight: 600 }}>Onboarding</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e40af', marginTop: '0.25rem' }}>
                {onboardingCount}
              </div>
              <span style={{ fontSize: '0.675rem', color: '#1d4ed8' }}>
                {Math.round((onboardingCount / (totalCustomers || 1)) * 100)}% onboarding
              </span>
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#eef2ff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #c7d2fe',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4338ca' }}>
                <CheckCheck size={13} />
                <span style={{ fontSize: '0.725rem', fontWeight: 600 }}>Completed</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3730a3', marginTop: '0.25rem' }}>
                {completedCount}
              </div>
              <span style={{ fontSize: '0.675rem', color: '#4338ca' }}>
                {Math.round((completedCount / (totalCustomers || 1)) * 100)}% finished
              </span>
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#fffbeb',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fde68a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b45309' }}>
                <Layers size={13} />
                <span style={{ fontSize: '0.725rem', fontWeight: 600 }}>On Hold</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#92400e', marginTop: '0.25rem' }}>
                {onHoldCount}
              </div>
              <span style={{ fontSize: '0.675rem', color: '#b45309' }}>
                {Math.round((onHoldCount / (totalCustomers || 1)) * 100)}% pending
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Customer Services Breakdown Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.775rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Customer Services:</span>
          {Object.entries(serviceCounts).map(([svc, count], idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor:
                    idx === 0 ? '#e11d48' : idx === 1 ? '#38bdf8' : idx === 2 ? '#10b981' : '#f59e0b',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                {svc}: <strong>{count}</strong>
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
          <span>Total Client Accounts:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{totalCustomers}</strong>
        </div>
      </div>
    </div>
  );
}
