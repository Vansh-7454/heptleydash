'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
      }}
      className={className}
    >
      {totalItems !== undefined && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {Math.min(totalItems, (currentPage - 1) * (itemsPerPage || 10) + 1)}
          </strong>{' '}
          to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {Math.min(totalItems, currentPage * (itemsPerPage || 10))}
          </strong>{' '}
          of <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> entries
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-outline btn-sm btn-icon-only"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-outline btn-sm btn-icon-only"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
