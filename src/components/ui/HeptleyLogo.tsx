import React from 'react';

interface HeptleyLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  subtext?: string;
}

export const HeptleyLogo: React.FC<HeptleyLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textColor = 'var(--text-primary)',
  subtext,
}) => {
  return (
    <div
      className={`heptley-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: `${Math.max(8, Math.round(size * 0.25))}px`,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          padding: `${Math.round(size * 0.1)}px`,
        }}
      >
        <img
          src="/images/heptley-logo.png"
          alt="Heptley"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: `${Math.max(1.05, size * 0.035)}rem`,
                fontWeight: 800,
                color: textColor,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
              }}
            >
              heptley
            </span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                display: 'inline-block',
              }}
            />
          </div>
          {subtext && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted, #64748b)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '1px',
              }}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default HeptleyLogo;
