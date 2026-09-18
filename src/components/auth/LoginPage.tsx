'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useDashboard();

  const [email, setEmail] = useState('sales01@heptley.com');
  const [password, setPassword] = useState('sales123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 200));
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoAccount = (accEmail: string, accPassword: string) => {
    setError(null);
    setEmail(accEmail);
    setPassword(accPassword);
  };

  const demoAccounts = [
    {
      id: 'admin',
      name: 'Admin Executive',
      email: 'admin@heptley.com',
      pass: 'admin123',
      badge: 'ADMIN',
      desc: 'Full Organization & Revenue Scope',
      icon: <Shield size={16} style={{ color: '#d97706' }} />,
      color: '#f59e0b',
      accentBg: '#fffbeb',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
    },
    {
      id: 'sales01',
      name: 'Sales Member 01',
      email: 'sales01@heptley.com',
      pass: 'sales123',
      badge: 'SM-001',
      desc: 'Senior Accounts Executive',
      icon: <User size={16} style={{ color: '#059669' }} />,
      color: '#10b981',
      accentBg: '#ecfdf5',
      badgeBg: '#d1fae5',
      badgeText: '#065f46',
    },
    {
      id: 'sales02',
      name: 'Sales Member 02',
      email: 'sales02@heptley.com',
      pass: 'sales123',
      badge: 'SM-002',
      desc: 'Client Accounts Representative',
      icon: <User size={16} style={{ color: '#0284c7' }} />,
      color: '#0284c7',
      accentBg: '#f0f9ff',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1',
    },
    {
      id: 'sales03',
      name: 'Sales Member 03',
      email: 'sales03@heptley.com',
      pass: 'sales123',
      badge: 'SM-003',
      desc: 'Growth & Business Development',
      icon: <User size={16} style={{ color: '#7c3aed' }} />,
      color: '#8b5cf6',
      accentBg: '#faf5ff',
      badgeBg: '#ede9fe',
      badgeText: '#5b21b6',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(2, 132, 199, 0.12) 0%, rgba(99, 102, 241, 0.06) 45%, transparent 75%),
          radial-gradient(ellipse 60% 50% at 100% 100%, rgba(14, 165, 233, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 0% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 60%),
          linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 36px 36px, 36px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Ambient background soft light spheres */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, rgba(224, 242, 254, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '5%',
          width: '450px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(238, 242, 255, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Live System Health Capsule */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 1.2rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
          marginBottom: '1.75rem',
          zIndex: 1,
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '8px',
            height: '8px',
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              opacity: 0.35,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#334155',
          }}
        >
          MongoDB Atlas Live · Socket.IO Real-Time Engine
        </span>
      </div>

      {/* Executive Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.09), 0 0 0 1px rgba(241, 245, 249, 0.8), 0 8px 24px -4px rgba(2, 132, 199, 0.06)',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.85rem' }}>
          {/* Glowing Emblem */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0284c7 100%)',
              boxShadow: '0 10px 25px -4px rgba(2, 132, 199, 0.35), 0 4px 12px rgba(15, 23, 42, 0.15)',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: '1.75rem',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.05em',
                lineHeight: 1,
              }}
            >
              h.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.45rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={12} />
              Enterprise CRM & Operations
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.035em',
              margin: '0 0 0.35rem 0',
              lineHeight: 1.25,
            }}
          >
            Heptley Executive Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
            Unified Business Management & Client Operations
          </p>
        </div>

        {/* Quick Dispatch Role Profiles */}
        <div
          style={{
            marginBottom: '1.65rem',
            padding: '1.1rem',
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              padding: '0 0.15rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Cpu size={14} style={{ color: '#0284c7' }} />
              Quick Identity Switcher
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#0284c7',
                fontWeight: 700,
                backgroundColor: '#e0f2fe',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
              }}
            >
              Pass: sales123 / admin123
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
            {demoAccounts.map((acc) => {
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => selectDemoAccount(acc.email, acc.pass)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '12px',
                    border: isSelected
                      ? '1.5px solid #0284c7'
                      : '1px solid #e2e8f0',
                    backgroundColor: isSelected
                      ? '#ffffff'
                      : '#ffffff',
                    boxShadow: isSelected
                      ? '0 4px 12px -2px rgba(2, 132, 199, 0.25), 0 0 0 1px #0284c7'
                      : '0 1px 3px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.16s ease',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: acc.accentBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {acc.icon}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          color: isSelected ? '#0f172a' : '#1e293b',
                        }}
                      >
                        {acc.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                    ) : (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: acc.badgeBg,
                          color: acc.badgeText,
                          fontFamily: 'monospace',
                        }}
                      >
                        {acc.badge}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: isSelected ? '#0284c7' : '#64748b',
                      lineHeight: 1.3,
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    {acc.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#b91c1c',
              fontSize: '0.825rem',
              marginBottom: '1.5rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#ef4444' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Email Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.45rem',
              }}
            >
              Work Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0 0.95rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <Mail size={17} style={{ color: '#0284c7', marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                type="email"
                placeholder="e.g. admin@heptley.com or sales01@heptley.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.82rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.45rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                Password
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                Encrypted via bcrypt
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0 0.95rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <Lock size={17} style={{ color: '#0284c7', marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.82rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember session & Dispatch Scope */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              padding: '0.1rem 0',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#475569',
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#0284c7',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              />
              <span>Remember session</span>
            </label>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: '#0284c7',
                fontWeight: 600,
              }}
            >
              <Shield size={12} />
              Zero-Trust Role Guard
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.925rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 22px -4px rgba(2, 132, 199, 0.45), 0 4px 6px -2px rgba(2, 132, 199, 0.2)',
              transition: 'transform 0.16s ease, box-shadow 0.16s ease',
              marginTop: '0.4rem',
            }}
          >
            {isLoading ? (
              <span>Authenticating Securely...</span>
            ) : (
              <>
                <span>Sign In to Executive Portal</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security & System Compliance Footer */}
      <div
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500 }}>
          <Lock size={13} style={{ color: '#059669' }} />
          <span>256-Bit TLS Encryption · Multi-Tenant Session Isolation · Role-Based RBAC</span>
        </div>
        <div style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} Heptley Technologies Inc. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}

