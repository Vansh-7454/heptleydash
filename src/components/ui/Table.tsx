'use client';

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="table-wrapper" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-wrapper" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, cIdx) => (
              <th
                key={`th-${col.key}-${cIdx}`}
                style={{
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const rawKey = keyExtractor ? keyExtractor(item) : (item as any)?.id || (item as any)?._id;
            const rowKey = rawKey ? `${rawKey}-${idx}` : `row-${idx}`;
            return (
              <tr key={rowKey}>
                {columns.map((col, cIdx) => (
                  <td
                    key={`td-${col.key}-${cIdx}`}
                    style={{
                      textAlign: col.align || 'left',
                    }}
                  >
                    {col.render ? col.render(item, idx) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
