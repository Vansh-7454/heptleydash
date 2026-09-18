'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div
      className={`card ${className}`.trim()}
      style={{
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <Loader2
        size={28}
        style={{
          color: 'var(--brand-accent)',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
};

export default LoadingState;
