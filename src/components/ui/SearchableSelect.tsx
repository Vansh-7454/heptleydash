'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  meta?: string;
}

export interface SearchableSelectProps {
  options: (SearchableOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  id?: string;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  label,
  error,
  hint,
  disabled = false,
  size = 'md',
  className = '',
  style,
  containerStyle,
  containerClassName = '',
  id,
  required = false,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: SearchableOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value) || null;
  }, [normalizedOptions, value]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedOptions;

    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      const matchValue = opt.value.toLowerCase().includes(q);
      const matchMeta = opt.meta ? opt.meta.toLowerCase().includes(q) : false;
      return matchLabel || matchSub || matchBadge || matchValue || matchMeta;
    });
  }, [normalizedOptions, searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
      // Small timeout to ensure DOM is rendered
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const target = filteredOptions[highlightedIndex];
          if (!target.disabled) {
            onChange(target.value);
            setIsOpen(false);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-dropdown-item]');
      const activeItem = items[highlightedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Size styling tokens
  const sizeStyles = {
    sm: {
      height: '32px',
      fontSize: '0.8rem',
      padding: '0.2rem 0.6rem',
      iconSize: 14,
    },
    md: {
      height: '38px',
      fontSize: '0.85rem',
      padding: '0.45rem 0.8rem',
      iconSize: 16,
    },
    lg: {
      height: '44px',
      fontSize: '0.925rem',
      padding: '0.6rem 1rem',
      iconSize: 18,
    },
  }[size];

  return (
    <div
      ref={containerRef}
      className={`form-group ${containerClassName}`.trim()}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: label ? '1rem' : '0',
        ...containerStyle,
      }}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="form-label"
          style={{
            display: 'block',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.35rem',
            color: 'var(--text-primary)',
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`input-field ${error ? 'error' : ''} ${className}`.trim()}
        style={{
          width: '100%',
          height: sizeStyles.height,
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: disabled ? 'var(--bg-subtle)' : '#ffffff',
          border: error
            ? '1.5px solid var(--danger)'
            : isOpen
            ? '1.5px solid var(--primary)'
            : '1px solid var(--border-default)',
          borderRadius: size === 'sm' ? '8px' : 'var(--radius-md, 8px)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          userSelect: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(2, 132, 199, 0.12)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          outline: 'none',
          ...style,
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: selectedOption ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            flex: 1,
            marginRight: '0.5rem',
          }}
        >
          {selectedOption ? (
            <>
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              <span>{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  ({selectedOption.subLabel})
                </span>
              )}
              {selectedOption.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: selectedOption.badgeColor || '#f1f5f9',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>

        <ChevronDown
          size={sizeStyles.iconSize}
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            minWidth: '240px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-strong, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            zIndex: 1050,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.15s ease-out',
          }}
        >
          {/* Top Search Input Box */}
          <div
            style={{
              padding: '0.5rem',
              borderBottom: '1px solid var(--border-default, #e2e8f0)',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Search size={15} style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.8rem',
                color: 'var(--text-primary, #0f172a)',
                outline: 'none',
                padding: '0.2rem 0',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Options List Container */}
          <div
            ref={listRef}
            role="listbox"
            style={{
              maxHeight: '230px',
              overflowY: 'auto',
              padding: '0.35rem 0',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted, #64748b)',
                }}
              >
                No matching records found for "{searchQuery}"
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${opt.value}-${index}`}
                    data-dropdown-item
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value);
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.5 : 1,
                      backgroundColor: isSelected
                        ? '#eff6ff'
                        : isHighlighted
                        ? '#f8fafc'
                        : 'transparent',
                      color: isSelected ? 'var(--primary, #0284c7)' : 'var(--text-primary, #0f172a)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                      {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
                      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                                backgroundColor: isSelected ? '#dbeafe' : opt.badgeColor || '#f1f5f9',
                                color: isSelected ? '#0369a1' : 'var(--text-secondary, #475569)',
                              }}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.subLabel && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-muted, #64748b)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: '1px',
                            }}
                          >
                            {opt.subLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check
                        size={15}
                        style={{
                          color: 'var(--primary, #0284c7)',
                          flexShrink: 0,
                          marginLeft: '0.5rem',
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="form-error-msg" style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span className="form-helper-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {hint}
        </span>
      )}
    </div>
  );
};

export default SearchableSelect;
