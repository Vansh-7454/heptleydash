'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  RotateCcw,
  Database,
  Lock,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  Shield,
  Download,
  KeyRound,
  FileJson,
  Sliders,
} from 'lucide-react';

export default function SettingsView() {
  const {
    role,
    salesMembers,
    customers,
    resetDemoData,
    showToast,
    userProfile,
    currentSalesMember,
  } = useDashboard();

  // Password change demo form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Preference toggles
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    statusUpdates: true,
  });

  // Appearance demo state
  const [themeMode, setThemeMode] = useState<'light' | 'slate' | 'system'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password successfully updated for this session!', 'success');
    }, 400);
  };

  const handleExportData = () => {
    try {
      const exportObject = {
        exportDate: new Date().toISOString(),
        environment: 'Heptley Business Portal Demo',
        salesMembers,
        customers,
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `heptley_demo_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported demo data JSON snapshot', 'success');
    } catch {
      showToast('Failed to export demo data', 'error');
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to restore demo records to default? All added mock customers and reps will be reset.'
      )
    ) {
      resetDemoData();
      showToast('Demo data restored to initial seed state', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '960px' }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Configure portal preferences, security credentials, and mock data storage controls.
        </p>
      </div>

      {/* 1. Security & Authentication Demo Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Lock size={18} style={{ color: 'var(--brand-accent)' }} />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Security & Access Credentials
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Update login password for {role === 'admin' ? userProfile.name : currentSalesMember.name}.
        </p>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '540px' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
            <button
              type="submit"
              disabled={pwdLoading}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <KeyRound size={13} />
              <span>{pwdLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Notification Preferences */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Bell size={18} style={{ color: 'var(--brand-primary)' }} />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Notification Preferences
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Choose alerts and digests sent to your registered contact channel.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Customer Assignment Alerts</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Notify immediately when a new customer account is allocated</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailAlerts}
              onChange={(e) => {
                setNotifications({ ...notifications, emailAlerts: e.target.checked });
                showToast('Notification preference saved', 'info');
              }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-accent)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Weekly Pipeline Digest</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Receive an executive summary every Monday morning</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyDigest}
              onChange={(e) => {
                setNotifications({ ...notifications, weeklyDigest: e.target.checked });
                showToast('Notification preference saved', 'info');
              }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-accent)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Contract Status Updates</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Alert when contract timeline approaches renewal or end date</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.statusUpdates}
              onChange={(e) => {
                setNotifications({ ...notifications, statusUpdates: e.target.checked });
                showToast('Notification preference saved', 'info');
              }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-accent)' }}
            />
          </label>
        </div>
      </div>

      {/* 3. Appearance & Density */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sliders size={18} style={{ color: 'var(--brand-accent)' }} />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Interface Appearance & Display
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Customize workspace layout density and presentation style.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Theme Mode</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Clean high-contrast Light mode recommended for enterprise portals.
              </div>
            </div>

            <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', padding: '0.25rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)' }}>
              <button
                type="button"
                onClick={() => {
                  setThemeMode('light');
                  showToast('Light Theme Active', 'info');
                }}
                className="btn-subtle"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: themeMode === 'light' ? '#ffffff' : 'transparent',
                  color: themeMode === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: themeMode === 'light' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: themeMode === 'light' ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setThemeMode('slate');
                  showToast('Slate Dark Mode (Preview)', 'info');
                }}
                className="btn-subtle"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: themeMode === 'slate' ? '#ffffff' : 'transparent',
                  color: themeMode === 'slate' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: themeMode === 'slate' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: themeMode === 'slate' ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Moon size={13} />
                <span>Slate</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Table Layout Density</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Adjust vertical padding and row spacing across customer tables.
              </div>
            </div>

            <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', padding: '0.25rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)' }}>
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className="btn-subtle"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: density === 'comfortable' ? '#ffffff' : 'transparent',
                  color: density === 'comfortable' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: density === 'comfortable' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: density === 'comfortable' ? 600 : 500,
                }}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className="btn-subtle"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: density === 'compact' ? '#ffffff' : 'transparent',
                  color: density === 'compact' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: density === 'compact' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: density === 'compact' ? 600 : 500,
                }}
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Demo Data & Storage Controls */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Database size={18} style={{ color: 'var(--brand-accent)' }} />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Demo Data & Persistence Controls
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Inspect local browser state, export mock datasets, or restore the initial sandbox seed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Local Storage State</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Persistent client-side storage active. Modifications survive page reloads.
              </div>
            </div>
            <span className="badge badge-active">Active</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Stored Data Snapshot</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {salesMembers.length} sales team members • {customers.length} business client records
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#b91c1c' }}>Reset Demo Storage</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Re-seeds the portal with the 3 default team reps (Vikram, Amit, Priya) and 8 baseline clients.
              </div>
            </div>
            <button
              onClick={handleResetData}
              className="btn btn-outline btn-sm"
              style={{ color: '#b91c1c', borderColor: '#fecaca' }}
            >
              <RotateCcw size={13} />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
