'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, containerClassName = '', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`form-group ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            <span>{label}</span>
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`form-input ${error ? 'error' : ''} ${className}`.trim()}
            style={{
              paddingLeft: leftIcon ? '2.25rem' : '0.75rem',
              paddingRight: rightIcon ? '2.25rem' : '0.75rem',
            }}
            {...props}
          />
          {rightIcon && (
            <div
              style={{
                position: 'absolute',
                right: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="form-error-msg">{error}</span>}
        {hint && !error && <span className="form-helper-text">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
