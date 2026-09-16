'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    type?: 'success' | 'neutral' | 'accent';
  };
}

export default function StatsCard({ title, value, subtitle, icon, badge }: StatsCardProps) {
  const getIconContainerStyle = () => {
    switch (badge?.type) {
      case 'success':
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'accent':
        return { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  const iconStyle = getIconContainerStyle();

  return (
    <div
      className="card card-hover"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
        borderTop: badge?.type === 'accent' ? '2px solid var(--brand-accent)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: iconStyle.bg,
            border: `1px solid ${iconStyle.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconStyle.color,
            transition: 'transform var(--transition-fast)',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>

        {badge && (
          <span
            className={`badge ${
              badge.type === 'success'
                ? 'badge-active'
                : badge.type === 'accent'
                ? 'badge-role-admin'
                : 'badge-inactive'
            }`}
            style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
