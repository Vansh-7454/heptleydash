'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  if (variant === 'pill') {
    return (
      <div className={`tab-pill-list ${className}`.trim()}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`tab-pill ${isActive ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    marginLeft: '0.35rem',
                    padding: '0.1rem 0.4rem',
                    fontSize: '0.7rem',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? 'var(--brand-accent-subtle)' : 'var(--border-default)',
                    color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className={`tabs-nav ${className}`.trim()}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`tab-btn ${isActive ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.72rem',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'var(--brand-accent-subtle)' : 'var(--bg-surface-subtle)',
                  color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Tabs;
