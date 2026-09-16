'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useDashboard();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />}
          {t.type === 'error' && <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />}
          {t.type === 'info' && <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />}

          <span style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.35 }}>{t.message}</span>

          <button
            onClick={() => removeToast(t.id)}
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
