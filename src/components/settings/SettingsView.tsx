'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Button, Input, Select } from '@/components/ui';
import { Lock, Bell, Palette, Shield, Save } from 'lucide-react';

export default function SettingsView() {
  const { showToast } = useDashboard();

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [overdueReminders, setOverdueReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  // Appearance
  const [density, setDensity] = useState('comfortable');

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

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password successfully changed', 'success');
    }, 500);
  };

  const handleSavePreferences = () => {
    showToast('Preferences updated successfully', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 0.25rem 0' }}>
          Portal Settings
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage security credentials, notification dispatch rules, and display settings.
        </p>
      </div>

      {/* Password Change Section */}
      <Card title="Security & Authentication" subtitle="Update your portal access password">
        <form onSubmit={handlePasswordSubmit}>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock size={16} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock size={16} />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock size={16} />}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="primary" size="sm" type="submit" isLoading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card title="Notification Preferences" subtitle="Configure email alerts and overdue task triggers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Email Notifications for Account Assignments
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Receive instant emails when a new customer or lead is routed to your pipeline.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-accent)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Overdue Follow-up Escalation Alerts
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Notify via in-app toast and high-priority badge when a client consultation is past due.
              </span>
            </div>
            <input
              type="checkbox"
              checked={overdueReminders}
              onChange={(e) => setOverdueReminders(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-accent)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Daily Pipeline Morning Digest
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Receive a daily 9:00 AM summary of scheduled consultations and outstanding receivables.
              </span>
            </div>
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-accent)' }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={handleSavePreferences}>
              Save Notification Rules
            </Button>
          </div>
        </div>
      </Card>

      {/* Appearance & Layout */}
      <Card title="Display & Interface Preferences" subtitle="Customize density and visual layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Table & Content Density"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            options={[
              { value: 'comfortable', label: 'Comfortable (Default)' },
              { value: 'compact', label: 'Compact (High Data Density)' },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" onClick={handleSavePreferences}>
              Save Display Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
