'use client';

import React from 'react';

export type BadgeVariant =
  | 'active'
  | 'success'
  | 'pending'
  | 'warning'
  | 'danger'
  | 'info'
  | 'proposal'
  | 'neutral'
  | 'completed';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  withDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  withDot = true,
  className = '',
}) => {
  const variantClass = `badge-${variant === 'completed' || variant === 'success' ? 'active' : variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {withDot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

export default Badge;
