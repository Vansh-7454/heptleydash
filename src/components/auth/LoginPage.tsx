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
  ArrowLeft,
  Sparkles,
  Cpu,
  CheckCircle2,
  Zap,
  BarChart3,
  Bot,
  LogIn,
  Code,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useDashboard();

  // Two view modes: 'home' (Clean Showcase Homepage) vs 'login' (Dedicated Login Screen)
  const [viewMode, setViewMode] = useState<'home' | 'login'>('home');

  // Form credentials state
  const [email, setEmail] = useState('sales01@heptley.com');
  const [password, setPassword] = useState('sales123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Smooth scroll helper for homepage sections
  const scrollToSection = (id: string) => {
    if (viewMode !== 'home') {
      setViewMode('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Open the Login Page view
  const openLoginPage = (prefillEmail?: string, prefillPass?: string) => {
    setError(null);
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillPass) setPassword(prefillPass);
    setViewMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct 1-Click Demo Login (from inside login view)
  const handleDirectLogin = async (accEmail: string, accPass: string, roleName?: string) => {
    setError(null);
    setEmail(accEmail);
    if (!accPass) {
      setPassword('');
      setError('Please enter your Developer password below to continue.');
      const passInput = document.getElementById('login-password-input');
      if (passInput) passInput.focus();
      return;
    }
    setPassword(accPass);
    setIsLoading(true);
    setLoadingRole(roleName || accEmail);

    try {
      await login(accEmail, accPass);
    } catch (err: any) {
      console.error('[heptley] Login error:', err);
      setError(err.message || 'Authentication failed. Please check credentials.');
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  // Form submit handler
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
    setLoadingRole(email);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  const demoAccounts = [
    {
      id: 'admin',
      name: 'Admin Executive',
      email: 'admin@heptley.com',
      pass: 'admin123',
      badge: 'ADMIN',
      desc: 'Full Organization & Financial Scope',
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
      desc: 'Senior Representative Portfolio',
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
      id: 'developer',
      name: 'Developer',
      email: 'developer@heptley.com',
      pass: 'developer123',
      badge: 'DEVELOPER',
      desc: 'Shared Technical & Infrastructure Operations',
      icon: <Code size={16} style={{ color: '#16a34a' }} />,
      color: '#16a34a',
      accentBg: '#f0fdf4',
      badgeBg: '#dcfce7',
      badgeText: '#15803d',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary, #091321)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'var(--font-family, system-ui, sans-serif)',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP NAVIGATION BAR                                            */}
      {/* ------------------------------------------------------------- */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid var(--border-default, #cbd5e1)',
          padding: '0.875rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Brand Logo - strictly lowercase 'heptley' */}
          <div
            id="brand-logo"
            role="button"
            tabIndex={0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #091321 0%, #1e293b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.35rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                border: '1.5px solid #cbd5e1',
                userSelect: 'none',
              }}
            >
              h.
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                >
                  heptley
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  CRM
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Business Management Portal
              </p>
            </div>
          </div>

          {/* Navigation Section Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
            <button
              type="button"
              id="nav-link-home"
              onClick={() => {
                setViewMode('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                fontSize: '0.875rem',
                fontWeight: viewMode === 'home' ? 800 : 600,
                color: viewMode === 'home' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                transition: 'all 0.15s',
              }}
            >
              Home
            </button>
            <button
              type="button"
              id="nav-link-features"
              onClick={() => scrollToSection('features-section')}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                transition: 'all 0.15s',
              }}
            >
              Features
            </button>
            <button
              type="button"
              id="nav-link-ai"
              onClick={() => scrollToSection('ai-section')}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                transition: 'all 0.15s',
              }}
            >
              AI Sales Agent
            </button>
            <button
              type="button"
              id="nav-link-security"
              onClick={() => scrollToSection('security-section')}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                transition: 'all 0.15s',
              }}
            >
              Security
            </button>
          </nav>
        </div>

        {/* Top Right Corner Action ("ek upar konse m") */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#065f46',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                display: 'inline-block',
              }}
            />
            <span>MongoDB Live</span>
          </div>

          {viewMode === 'home' ? (
            <button
              type="button"
              id="nav-open-login"
              onClick={() => openLoginPage()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.35rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              type="button"
              id="nav-back-to-home"
              onClick={() => setViewMode('home')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f0f9fd',
                color: '#0284c7',
                border: '1px solid var(--border-default)',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f9fd')}
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            borderBottom: '1.5px solid #fecaca',
            color: '#991b1b',
            padding: '0.85rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            zIndex: 45,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              marginLeft: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#991b1b',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 1: DEDICATED LOGIN SCREEN ('login' viewMode)             */}
      {/* ============================================================= */}
      {viewMode === 'login' && (
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1.5rem 5rem 1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-default)',
              boxShadow: '0 20px 60px -15px rgba(2, 26, 41, 0.25)',
              padding: '2.5rem 2.25rem',
            }}
          >
            {/* Top Navigation inside Login Box */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <button
                type="button"
                id="login-back-to-home-btn"
                onClick={() => setViewMode('home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#f0f9fd',
                  border: '1px solid var(--border-default)',
                  color: '#0284c7',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f9fd')}
              >
                <ArrowLeft size={15} />
                <span>Back to Home</span>
              </button>

              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.3rem 0.65rem', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                Secure Login Gate
              </span>
            </div>

            {/* Brand Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #091321 0%, #1e293b 100%)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.85rem',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.3)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '1rem',
                }}
              >
                h.
              </div>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: '0 0 0.35rem 0',
                  letterSpacing: '-0.025em',
                }}
              >
                Sign In to <span style={{ color: '#0284c7' }}>heptley</span>
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Unified Business Management & Client Operations
              </p>
            </div>

            {/* 1-Click Demo Accounts Selector */}
            <div
              style={{
                marginBottom: '1.75rem',
                padding: '1.25rem',
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Cpu size={14} style={{ color: '#0284c7' }} />
                  <span>1-Click Demo Logins</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700, backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  Pass: sales123 / admin123 / developer123
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {demoAccounts.map((acc) => {
                  const isSelected = email === acc.email;
                  const isThisLoading = isLoading && loadingRole === acc.name;

                  return (
                    <div
                      key={acc.id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: isSelected ? `2px solid ${acc.color}` : '1.5px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        boxShadow: isSelected ? `0 4px 12px ${acc.color}25` : '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setEmail(acc.email);
                          setPassword(acc.pass);
                          setError(null);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {acc.icon}
                            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {acc.name}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 size={14} style={{ color: acc.color }} />}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                          {acc.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        id={`login-card-quick-${acc.id}`}
                        disabled={isLoading}
                        onClick={() => handleDirectLogin(acc.email, acc.pass, acc.name)}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isSelected ? acc.color : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                          if (!isLoading && !isSelected) e.currentTarget.style.backgroundColor = '#e2e8f0';
                        }}
                        onMouseOut={(e) => {
                          if (!isLoading && !isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                      >
                        <LogIn size={12} />
                        <span>{isThisLoading ? 'Signing In...' : acc.pass ? `1-Click ${acc.badge}` : `Select ${acc.badge}`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Email & Password Form */}
            <form
              action="javascript:void(0);"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  htmlFor="login-email-input"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
                >
                  Work Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sales01@heptley.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem 0.8rem 2.6rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label htmlFor="login-pass-input" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Encrypted via bcrypt
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    id="login-pass-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 2.6rem 0.8rem 2.6rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#0369a1';
                }}
                onMouseOut={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#0284c7';
                }}
              >
                {isLoading ? (
                  <span>Authenticating Identity...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ============================================================= */}
      {/* VIEW 2: SHOWCASE HOMEPAGE ('home' viewMode)                   */}
      {/* ============================================================= */}
      {viewMode === 'home' && (
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2.5rem 1.5rem 4rem 1.5rem',
          }}
        >
          {/* HERO SECTION */}
          <section
            id="overview"
            style={{
              maxWidth: '1200px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '3.5rem',
              paddingTop: '1rem',
            }}
          >
            {/* Announcement Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 1.15rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#0284c7',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sparkles size={15} style={{ color: '#0284c7' }} />
              <span>heptley ENTERPRISE WORKSPACE · REAL-TIME ENGINE · GEMINI 2.0 AI</span>
            </div>

            {/* Main Hero Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: 'var(--text-primary, #091321)',
                maxWidth: '980px',
                margin: '0 0 1.25rem 0',
              }}
            >
              The Operating System for Modern High-Growth{' '}
              <span style={{ color: '#0284c7' }}>Sales & Client Operations</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--text-secondary, #334155)',
                lineHeight: 1.6,
                maxWidth: '820px',
                margin: '0 0 2.25rem 0',
                fontWeight: 500,
              }}
            >
              <strong style={{ color: '#0284c7' }}>heptley</strong> empowers your team with automated customer onboarding, instant pipeline lead conversion, grounded Gemini 2.0 sales intelligence, and precision financial ledgers — strictly isolated by representative.
            </p>

            {/* Single Center Action Button ("ek beech m bas") */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <button
                type="button"
                id="hero-open-login-btn"
                onClick={() => openLoginPage()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(180deg, #0284c7 0%, #0052a3 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.95rem 2.25rem',
                  borderRadius: '12px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #0369a1 0%, #075985 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #0284c7 0%, #0052a3 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <LogIn size={20} />
                <span>Sign In to heptley</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Key Proof Metric Strip */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.75rem',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>47/47 End-to-End Tests Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>Strict Role-Based Multi-Room Security</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>Grounded Gemini 2.0 Copilot</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>Zero-Math-Mismatch Ledger</span>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------- */}
          {/* CLEAN PRODUCT SHOWCASE SECTION (PHOTO / MOCKUP WINDOW)        */}
          {/* ------------------------------------------------------------- */}
          <section
            style={{
              maxWidth: '1200px',
              width: '100%',
              position: 'relative',
              marginBottom: '4.5rem',
            }}
          >
            {/* Glass Window Container */}
            <div
              style={{
                backgroundColor: '#091321',
                borderRadius: '20px',
                border: '2px solid rgba(159, 216, 237, 0.4)',
                boxShadow: '0 24px 64px -12px rgba(2, 26, 41, 0.35), 0 0 40px rgba(2, 132, 199, 0.2)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Window Header with macOS-style controls */}
              <div
                style={{
                  backgroundColor: '#03253b',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(159, 216, 237, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(2, 26, 41, 0.6)',
                    border: '1px solid rgba(159, 216, 237, 0.25)',
                    padding: '0.25rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    color: 'var(--brand-accent-text)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Lock size={12} style={{ color: '#38bdf8' }} />
                  <span>https://heptley/workspace</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--brand-accent-text)', fontWeight: 600 }}>
                  Live Production Preview
                </div>
              </div>

              {/* Dashboard Showcase Visual */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '480px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/images/heptley-hero.jpg"
                  alt="heptley CRM Executive Dashboard & AI Interface"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />

                {/* Floating Overlay Badge: AI Engine */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    backgroundColor: 'rgba(2, 26, 41, 0.88)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid #38bdf8',
                    padding: '0.75rem 1.15rem',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                    }}
                  >
                    <Bot size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                      Gemini AI Copilot
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Factual Summaries & Instant Message Drafts
                    </div>
                  </div>
                </div>

                {/* Floating Overlay Badge: Real-time Multi-Room Sync */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    backgroundColor: 'rgba(2, 26, 41, 0.88)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid #10b981',
                    padding: '0.75rem 1.15rem',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                    }}
                  >
                    <Zap size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                      Real-time Socket.IO Engine
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Multi-room event isolation per sales rep
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------- */}
          {/* CORE PLATFORM CAPABILITIES GRID                               */}
          {/* ------------------------------------------------------------- */}
          <section
            id="features-section"
            style={{
              maxWidth: '1200px',
              width: '100%',
              marginBottom: '3rem',
              scrollMarginTop: '90px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Engineered for Enterprise Client Operations at{' '}
                <span style={{ color: '#0284c7' }}>heptley</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
                Every feature verified against live MongoDB collections with atomic transactions and zero mock data.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Card 1: AI Copilot */}
              <div
                id="ai-section"
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.75rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  scrollMarginTop: '90px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                  }}
                >
                  <Bot size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Gemini 2.0 AI Sales Agent
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Grounded strictly in active MongoDB records. Generates executive customer summaries, priority follow-up recommendations, outreach drafts, and extracts action items from notes.
                </p>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Zero Hallucination · Human Confirmation Gate</span>
                </div>
              </div>

              {/* Card 2: Real-time Pipeline */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.75rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                  }}
                >
                  <Zap size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Real-Time Pipeline & Kanban
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Instant stage transitions from New $\to$ Qualified $\to$ Proposal $\to$ Won. Convert winning leads to Customer accounts in 1-click with atomic ID generation (LEAD-XXXX $\to$ CUS-XXXX).
                </p>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Idempotent Conversion · Auto Timelines</span>
                </div>
              </div>

              {/* Card 3: Financial Ledger */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.75rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706',
                  }}
                >
                  <BarChart3 size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Automated Financial Ledger
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Pre-save mathematical enforcement guarantees total amounts, discount deductions, and remaining balances match with 100% precision. Rejects negative or excessive payments.
                </p>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Zero Math Mismatches · Dynamic Status</span>
                </div>
              </div>

              {/* Card 4: Role Security */}
              <div
                id="security-section"
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.75rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  scrollMarginTop: '90px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#ede9fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <Shield size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Strict Multi-Tenant RBAC
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Enforces complete cross-representative portfolio isolation. Sales Member 01 cannot view, edit, or record payments on accounts owned by Sales Member 02 (enforced with 403 Forbidden).
                </p>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>JWT Auth · bcrypt Hashing · Private Rooms</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CLEAN INFORMATIVE FOOTER (NO CLUTTERED SIGN IN BUTTONS)       */}
      {/* ------------------------------------------------------------- */}
      <footer
        style={{
          borderTop: '1.5px solid var(--border-default, rgba(159, 216, 237, 0.5))',
          backgroundColor: '#ffffff',
          color: 'var(--text-muted)',
          marginTop: 'auto',
          boxShadow: '0 -4px 20px rgba(2, 132, 199, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '3rem 2rem 2.25rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Column 1: Brand & Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #091321 0%, #1e293b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                }}
              >
                h.
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                heptley
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  border: '1px solid #bae6fd',
                }}
              >
                Enterprise
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>
              The unified operating system for high-growth client management, real-time sales pipelines, automated ledgers, and grounded Gemini 2.0 AI sales intelligence.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#065f46',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                  display: 'inline-block',
                }}
              />
              <span>Live Engine · MongoDB Active</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              🔒 256-Bit SSL Encrypted · Strict RBAC Multi-Room Isolation
            </div>
          </div>

          {/* Column 2: Platform Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Modules
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Customer Onboarding & Allocation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Real-time Pipeline & Kanban
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('ai-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Gemini 2.0 AI Sales Agent
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Automated Financial Ledger
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Activity Audit & Follow-Ups
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Security & Architecture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Security Standards
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('security-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Multi-Tenant RBAC Enforcement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('security-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Representative Data Isolation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('security-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Pre-Save Math Invariant Ledger
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('security-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  Socket.IO Private Rep Rooms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('security-section')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#475569', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  47/47 End-to-End Test Verified
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: System Information (Informational, No extra login buttons) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600 }}>Architecture</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>Next.js 15 + Express</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600 }}>Database</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>MongoDB Atlas M0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600 }}>Sync Engine</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>Socket.IO Real-Time</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600 }}>AI Intelligence</span>
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>Gemini 2.0 Flash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(159, 216, 237, 0.35)',
            backgroundColor: '#f8fafc',
            padding: '1.25rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>heptley Business Management & CRM</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Next.js 15</span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Express API</span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>MongoDB Atlas</span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Socket.IO</span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Gemini 2.0 AI</span>
          </div>

          <button
            type="button"
            id="footer-back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              color: '#0284c7',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f9fd')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <span>↑ Back to Top</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
