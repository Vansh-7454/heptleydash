import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ color: '#64748b' }}>Could not find the requested resource.</p>
      <Link href="/" style={{ color: '#0284c7', fontWeight: 700 }}>
        Return to Portal
      </Link>
    </div>
  );
}
