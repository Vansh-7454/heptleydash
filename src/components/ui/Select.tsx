'use client';

import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, containerClassName = '', className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`form-group ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            <span>{label}</span>
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            id={selectId}
            ref={ref}
            className={`form-select ${error ? 'error' : ''} ${className}`.trim()}
            style={{ paddingRight: '2rem', appearance: 'none' }}
            {...props}
          >
            {options.map((opt, index) => (
              <option key={`${opt.value}-${index}`} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '0.75rem',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          />
        </div>
        {error && <span className="form-error-msg">{error}</span>}
        {hint && !error && <span className="form-helper-text">{hint}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
